import {
  mkdir,
  readFile,
  open,
  rename,
  readdir,
  realpath,
  lstat,
} from "node:fs/promises";
import {
  resolve,
  dirname,
  join,
  relative,
  isAbsolute,
  basename,
} from "node:path";
import { randomUUID, createHash } from "node:crypto";
import type { Project } from "../../packages/document-model";
import { parseProject } from "../../packages/validation";
import { assertSafeCss } from "../../packages/css-engine";
import type { DesktopSettings } from "../../packages/desktop-bridge";

export function confined(root: string, target: string): boolean {
  const path = relative(resolve(root), resolve(target));
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}
export function validateProject(value: unknown): Project {
  const project = parseProject(
    typeof value === "string" ? value : JSON.stringify(value),
  );
  project.pages.forEach((p) => assertSafeCss(p.css));
  project.components.forEach((c) => assertSafeCss(c.css));
  return project;
}
export async function atomicWrite(
  path: string,
  data: string | Uint8Array,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = path + ".pending-" + randomUUID();
  const handle = await open(temp, "wx");
  try {
    await handle.writeFile(data);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temp, path);
}
export class FileProjectStorage {
  private readonly files = new Map<string, string>();
  private readonly hashes = new Map<string, string>();
  private readonly backupTimes = new Map<string, number>();
  private settingsQueue = Promise.resolve();
  private readonly writes = new Map<string, Promise<void>>();
  settings: DesktopSettings;
  constructor(
    private settingsFile: string,
    defaultFolder: string,
  ) {
    this.settings = {
      storageFolder: defaultFolder,
      recentFiles: [],
      theme: "dark",
      workspace: {},
      tutorial: "",
    };
  }
  async initialize() {
    try {
      const value = JSON.parse(
        await readFile(this.settingsFile, "utf8"),
      ) as Partial<DesktopSettings>;
      if (
        typeof value.storageFolder === "string" &&
        isAbsolute(value.storageFolder)
      )
        this.settings.storageFolder = value.storageFolder;
      if (Array.isArray(value.recentFiles))
        this.settings.recentFiles = value.recentFiles
          .filter((p) => typeof p === "string" && isAbsolute(p))
          .slice(0, 100);
      if (value.theme && ["light", "dark", "system"].includes(value.theme))
        this.settings.theme = value.theme;
      if (value.workspace && typeof value.workspace === "object")
        this.settings.workspace = Object.fromEntries(
          Object.entries(value.workspace).filter(
            ([key, value]) =>
              /^[\w-]{1,40}$/.test(key) &&
              (typeof value === "boolean" ||
                (typeof value === "number" &&
                  Number.isFinite(value) &&
                  Math.abs(value) < 10000)),
          ),
        );
      if (typeof value.tutorial === "string" && value.tutorial.length < 10000)
        this.settings.tutorial = value.tutorial;
    } catch {
      /* Missing settings use local defaults. */
    }
    await mkdir(this.settings.storageFolder, { recursive: true });
  }
  async updateSettings(patch: Partial<DesktopSettings>) {
    this.settings = { ...this.settings, ...patch };
    this.settingsQueue = this.settingsQueue
      .catch(() => undefined)
      .then(() =>
        atomicWrite(this.settingsFile, JSON.stringify(this.settings, null, 2)),
      );
    await this.settingsQueue;
    return this.settings;
  }
  private async remember(path: string, project: Project) {
    this.files.set(project.id, resolve(path));
    this.settings.recentFiles = [
      resolve(path),
      ...this.settings.recentFiles.filter((p) => p !== resolve(path)),
    ].slice(0, 100);
    await this.updateSettings({ recentFiles: this.settings.recentFiles });
  }
  async list(): Promise<Project[]> {
    const candidates = new Set(this.settings.recentFiles);
    for (const dir of await readdir(this.settings.storageFolder, {
      withFileTypes: true,
    }))
      if (dir.isDirectory() && !dir.isSymbolicLink())
        candidates.add(
          join(this.settings.storageFolder, dir.name, "project.codeship.json"),
        );
    const projects = new Map<string, Project>();
    for (const path of candidates) {
      try {
        const p = validateProject(await readFile(path, "utf8"));
        this.files.set(p.id, resolve(path));
        projects.set(p.id, await this.hydrate(p, path));
      } catch {
        /* Invalid files remain on disk and can be recovered explicitly. */
      }
    }
    return [...projects.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }
  async get(id: string): Promise<Project | undefined> {
    if (!this.files.has(id)) await this.list();
    const path = this.files.get(id);
    if (!path) return;
    return this.readAuthorized(path);
  }
  async authorize(path: string): Promise<Project> {
    if (!path.endsWith(".codeship.json"))
      throw new Error("Choose a .codeship.json project.");
    const resolved = await realpath(path);
    const project = await this.readAuthorized(resolved);
    await this.remember(resolved, project);
    return project;
  }
  private async readAuthorized(path: string): Promise<Project> {
    const project = validateProject(await readFile(path, "utf8"));
    return this.hydrate(project, path);
  }
  private async hydrate(project: Project, path: string): Promise<Project> {
    const root = await realpath(dirname(path));
    const replacements = new Map<string, string>();
    for (const asset of project.assets) {
      if (!asset.url.startsWith("assets/")) continue;
      const file = resolve(root, asset.url);
      if (!confined(root, file) || !confined(root, await realpath(file)))
        throw new Error("Asset path leaves the project folder.");
      const bytes = await readFile(file);
      if (bytes.length > 5_000_000)
        throw new Error("Local asset exceeds 5 MB.");
      const uri = `data:${asset.type};base64,${bytes.toString("base64")}`;
      replacements.set(asset.url, uri);
      asset.url = uri;
    }
    return this.replaceReferences(project, replacements);
  }
  private replaceReferences(
    project: Project,
    replacements: Map<string, string>,
  ) {
    const visit = (node: Project["pages"][number]["root"]) => {
      for (const [key, value] of Object.entries(node.attributes))
        if (replacements.has(value))
          node.attributes[key] = replacements.get(value)!;
      node.children.forEach(visit);
    };
    for (const page of project.pages) {
      visit(page.root);
      for (const [from, to] of replacements)
        page.css = page.css.replaceAll(from, to);
    }
    for (const component of project.components) {
      visit(component.root);
      for (const [from, to] of replacements)
        component.css = component.css.replaceAll(from, to);
    }
    return project;
  }
  private async checkPath(path: string) {
    const root = await realpath(dirname(path));
    const file = resolve(root, basename(path));
    try {
      if ((await lstat(file)).isSymbolicLink())
        throw new Error("Project documents cannot be symbolic links.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return file;
  }
  async save(input: Project, explicitPath?: string): Promise<void> {
    const safe = validateProject(input);
    const write = (this.writes.get(safe.id) ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => this.saveNow(safe, explicitPath));
    this.writes.set(safe.id, write);
    return write;
  }
  private async saveNow(input: Project, explicitPath?: string): Promise<void> {
    const project = validateProject(input);
    let path = explicitPath ?? this.files.get(project.id);
    if (!path) {
      const slug =
        project.name
          .replace(/[<>:"/\\|?*\p{Cc}]/gu, "-")
          .replace(/[. ]+$/, "")
          .slice(0, 70) || "Untitled";
      const folder = resolve(
        this.settings.storageFolder,
        slug + " - " + project.id.slice(-8),
      );
      if (!confined(this.settings.storageFolder, folder))
        throw new Error("Invalid project folder.");
      await mkdir(folder, { recursive: true });
      if (
        !confined(
          await realpath(this.settings.storageFolder),
          await realpath(folder),
        )
      )
        throw new Error(
          "Project folder leaves the selected storage directory.",
        );
      path = join(folder, "project.codeship.json");
    }
    path = await this.checkPath(path);
    const hash = createHash("sha256")
      .update(JSON.stringify(project))
      .digest("hex");
    if (this.hashes.get(path) === hash) return;
    await mkdir(join(dirname(path), "assets"), { recursive: true });
    await mkdir(join(dirname(path), "backups"), { recursive: true });
    const replacements = new Map<string, string>();
    for (const asset of project.assets) {
      const data = asset.url.match(
        /^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([a-z0-9+/=]+)$/i,
      );
      if (!data) continue;
      if (!/^[\w-]+$/.test(asset.id))
        throw new Error("Invalid asset identifier.");
      if (asset.type !== data[1])
        throw new Error("Asset MIME type does not match its contents.");
      const bytes = Buffer.from(data[2], "base64");
      const digest = createHash("sha256")
        .update(bytes)
        .digest("hex")
        .slice(0, 16);
      const reference = `assets/${asset.id}-${digest}.${data[1].split("/")[1]}`;
      const destination = join(dirname(path), reference);
      if (!confined(dirname(path), await realpath(dirname(destination))))
        throw new Error("Asset folder leaves the project directory.");
      await this.checkPath(destination);
      await atomicWrite(destination, bytes);
      replacements.set(asset.url, reference);
      asset.url = reference;
    }
    const serialized = JSON.stringify(
      this.replaceReferences(project, replacements),
      null,
      2,
    );
    validateProject(serialized);
    try {
      const previous = await readFile(path, "utf8");
      try {
        validateProject(previous);
        if (Date.now() - (this.backupTimes.get(path) ?? 0) > 60_000) {
          await this.backupFile(path);
          this.backupTimes.set(path, Date.now());
        }
      } catch {
        await atomicWrite(
          join(dirname(path), "backups", "invalid-" + Date.now() + ".json"),
          previous,
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await atomicWrite(path, serialized);
    this.hashes.set(path, hash);
    await this.remember(path, input);
  }
  pathFor(id: string) {
    const path = this.files.get(id);
    if (!path) throw new Error("Open or save this project first.");
    return path;
  }
  async flush(id?: string) {
    if (id) await this.writes.get(id);
    else await Promise.all(this.writes.values());
    await this.settingsQueue;
  }
  forget(id: string) {
    const path = this.files.get(id);
    this.files.delete(id);
    this.hashes.delete(path ?? "");
    return this.updateSettings({
      recentFiles: this.settings.recentFiles.filter((p) => p !== path),
    });
  }
  private async backupFile(path: string) {
    const source = await readFile(path, "utf8");
    validateProject(source);
    const root = await realpath(dirname(path));
    const folder = join(root, "backups");
    await mkdir(folder, { recursive: true });
    if (!confined(root, await realpath(folder)))
      throw new Error("Backup folder leaves the project.");
    const destination = join(
      folder,
      new Date().toISOString().replace(/[:.]/g, "-") +
        "-" +
        randomUUID().slice(0, 6) +
        ".codeship.json",
    );
    await atomicWrite(destination, source);
    return destination;
  }
  backup(id: string) {
    return this.flush(id).then(() => this.backupFile(this.pathFor(id)));
  }
  async recover(id: string): Promise<Project> {
    const path = this.pathFor(id);
    const folder = join(dirname(path), "backups");
    const root = await realpath(dirname(path));
    if (!confined(root, await realpath(folder)))
      throw new Error("Backup folder leaves the project.");
    const files = (await readdir(folder))
      .filter((f) => f.endsWith(".codeship.json"))
      .sort()
      .reverse();
    for (const name of files) {
      try {
        const backup = join(folder, name);
        if (!confined(root, await realpath(backup))) continue;
        const project = validateProject(await readFile(backup, "utf8"));
        return await this.hydrate(project, path);
      } catch {
        /* Try the next complete valid backup; never overwrite the original here. */
      }
    }
    throw new Error(
      "No valid project backup was found. The original files were preserved.",
    );
  }
  async recoverFile(path: string): Promise<Project> {
    const root = await realpath(dirname(path)),
      folder = join(root, "backups");
    if (!confined(root, await realpath(folder)))
      throw new Error("Backup folder leaves the project.");
    for (const file of (await readdir(folder))
      .filter((f) => f.endsWith(".codeship.json"))
      .sort()
      .reverse()) {
      try {
        if (!confined(root, await realpath(join(folder, file)))) continue;
        const project = validateProject(
          await readFile(join(folder, file), "utf8"),
        );
        this.files.set(project.id, resolve(path));
        return await this.hydrate(project, path);
      } catch {
        /* Preserve damaged files and try another complete backup. */
      }
    }
    throw new Error("No valid backup found.");
  }
}

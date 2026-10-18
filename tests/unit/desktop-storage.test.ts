// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  mkdtemp,
  readFile,
  readdir,
  writeFile,
  mkdir,
  rm,
  symlink,
  rmdir,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { FileProjectStorage, confined } from "../../apps/desktop/storage";
import { createProject, element } from "../../packages/document-model";
let directory: string, storage: FileProjectStorage;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "codeship-storage-test-"));
  storage = new FileProjectStorage(
    join(directory, "settings.json"),
    join(directory, "projects"),
  );
  await storage.initialize();
});
afterEach(async () => {
  if (
    resolve(directory).startsWith(
      resolve(tmpdir()) + String.raw`\codeship-storage-test-`,
    ) ||
    (confined(tmpdir(), directory) &&
      directory.includes("codeship-storage-test-"))
  )
    await rm(directory, { recursive: true, force: true });
});
describe("permanent desktop project files", () => {
  it("serializes overlapping saves and preserves older asset bytes for recovery", async () => {
    const p = createProject("Asset versions"),
      uri =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    p.assets.push({
      id: "asset-version",
      name: "pixel.gif",
      type: "image/gif",
      url: uri,
    });
    p.pages[0].root.children.push(
      element("img", "", { src: uri, alt: "Versioned image" }),
    );
    await storage.save(p);
    await storage.backup(p.id);
    const next = structuredClone(p),
      bytes = Buffer.concat([
        Buffer.from(uri.split(",")[1], "base64"),
        Buffer.from([0]),
      ]),
      updated = "data:image/gif;base64," + bytes.toString("base64");
    next.assets[0].url = updated;
    next.pages[0].root.children[0].attributes.src = updated;
    next.name = "Updated";
    const last = structuredClone(next);
    last.name = "Last queued snapshot";
    await Promise.all([storage.save(next), storage.save(last)]);
    await storage.flush(p.id);
    expect((await storage.get(p.id))?.name).toBe(last.name);
    expect((await storage.recover(p.id)).assets[0].url).toBe(uri);
    expect(
      await readdir(join(storage.pathFor(p.id), "..", "assets")),
    ).toHaveLength(2);
  });
  it("ignores malformed preference fields while keeping valid permanent storage settings", async () => {
    await writeFile(
      join(directory, "bad-settings.json"),
      JSON.stringify({
        storageFolder: join(directory, "valid-folder"),
        recentFiles: "invalid",
        theme: "unknown",
        workspace: { leftWidth: 240, bad: "invalid", huge: Infinity },
        tutorial: 42,
      }),
    );
    const loaded = new FileProjectStorage(
      join(directory, "bad-settings.json"),
      join(directory, "default"),
    );
    await loaded.initialize();
    expect(loaded.settings.recentFiles).toEqual([]);
    expect(loaded.settings.workspace).toEqual({ leftWidth: 240 });
    expect(loaded.settings.theme).toBe("dark");
    expect(loaded.settings.tutorial).toBe("");
  });
  it("atomically stores assets locally, reopens after restart and keeps unchanged saves stable", async () => {
    const project = createProject("Permanent / workspace");
    const uri =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    project.assets.push({
      id: "asset-local",
      name: "pixel.gif",
      type: "image/gif",
      url: uri,
    });
    project.pages[0].root.children.push(
      element("img", "", { src: uri, alt: "Local image" }),
    );
    await storage.save(project);
    const path = storage.pathFor(project.id);
    const saved = await readFile(path, "utf8");
    expect(saved).toMatch(/assets\/asset-local-[a-f0-9]{16}\.gif/);
    expect(saved).not.toContain(uri);
    await storage.save(project);
    expect((await readdir(join(path, "..", "backups"))).length).toBe(0);
    const restarted = new FileProjectStorage(
      join(directory, "settings.json"),
      "unused",
    );
    await restarted.initialize();
    expect(
      (await restarted.get(project.id))?.pages[0].root.children[0].attributes
        .src,
    ).toBe(uri);
    expect(await readdir(join(path, "..", "assets"))).toHaveLength(1);
  });
  it("validates before replacing a good project and recovers a complete backup without overwriting damage", async () => {
    const project = createProject("Recoverable");
    await storage.save(project);
    await storage.backup(project.id);
    const path = storage.pathFor(project.id),
      before = await readFile(path, "utf8");
    const bad = structuredClone(project);
    bad.pages[0].root.tag = "script";
    await expect(storage.save(bad)).rejects.toThrow();
    expect(await readFile(path, "utf8")).toBe(before);
    await writeFile(path, '{"interrupted":');
    const recovered = await storage.recover(project.id);
    expect(recovered.id).toBe(project.id);
    expect(await readFile(path, "utf8")).toBe('{"interrupted":');
  });
  it("rejects path escapes and symlink asset directories", async () => {
    expect(confined(directory, join(directory, "..", "other"))).toBe(false);
    expect(confined(directory, join(directory, "valid"))).toBe(true);
    const project = createProject("Symlink");
    await storage.save(project);
    const assets = join(storage.pathFor(project.id), "..", "assets");
    await rmdir(assets);
    const outside = join(directory, "outside");
    await mkdir(outside);
    await symlink(outside, assets, "junction");
    project.assets.push({
      id: "asset-escape",
      name: "pixel.gif",
      type: "image/gif",
      url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    });
    await expect(storage.save(project)).rejects.toThrow("leaves the project");
    expect(await readdir(outside)).toEqual([]);
  });
});

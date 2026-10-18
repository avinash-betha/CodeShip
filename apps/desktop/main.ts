import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  net,
  protocol,
  shell,
  clipboard,
} from "electron";
import { join, resolve, dirname, extname, basename } from "node:path";
import { realpath, mkdir, lstat, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  FileProjectStorage,
  atomicWrite,
  confined,
  validateProject,
} from "./storage";
import type { DesktopSettings } from "../../packages/desktop-bridge";
import type { ExportFiles } from "../../packages/codegen-core";
import { uid } from "../../packages/document-model";
import { randomUUID, webcrypto } from "node:crypto";
if (!globalThis.crypto)
  Object.defineProperty(globalThis, "crypto", { value: webcrypto });
protocol.registerSchemesAsPrivileged([
  {
    scheme: "codeship",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
app.setName("CodeShip");
const previewNonce = "cs" + randomUUID().replaceAll("-", "");
let window: BrowserWindow;
let storage: FileProjectStorage;
let exportedFolder = "";
const rendererRoot = resolve(__dirname, "../studio/browser");
const id = (value: unknown): string => {
  if (typeof value !== "string" || !/^[a-zA-Z][\w-]{0,100}$/.test(value))
    throw new Error("Invalid project identifier.");
  return value;
};
const handler = (name: string, fn: (...args: unknown[]) => unknown) =>
  ipcMain.handle("codeship:" + name, (event, ...args) => {
    const source = event.senderFrame ? new URL(event.senderFrame.url) : null;
    if (
      event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      source?.protocol !== "codeship:" ||
      source.host !== "app"
    )
      throw new Error(
        "Desktop access is restricted to the trusted application window.",
      );
    return fn(...args);
  });
async function register() {
  handler("window:fullscreen:get", () => window.isFullScreen());
  handler("window:fullscreen:set", (value) => {
    if (typeof value !== "boolean")
      throw new Error("Full-screen state must be a boolean.");
    window.setFullScreen(value);
  });
  handler("clipboard:write", (value) => {
    if (typeof value !== "string" || value.length > 2_000_000)
      throw new Error("Copy text must be smaller than 2 MB.");
    clipboard.writeText(value);
  });
  handler("projects:list", () => storage.list());
  handler("projects:get", (value) => storage.get(id(value)));
  handler("projects:save", (value) => storage.save(validateProject(value)));
  handler("projects:delete", async (value) => {
    const projectId = id(value),
      path = storage.pathFor(projectId);
    const contents = await readdir(dirname(path));
    const isolated =
      basename(path) === "project.codeship.json" &&
      contents.every((name) =>
        ["project.codeship.json", "assets", "backups"].includes(name),
      );
    const destination = isolated ? dirname(path) : path;
    const answer = await dialog.showMessageBox(window, {
      type: "warning",
      buttons: ["Cancel", "Move project to Recycle Bin"],
      defaultId: 0,
      cancelId: 0,
      title: "Delete local project?",
      message: isolated
        ? "Move this project folder and its assets/backups to the Recycle Bin?"
        : "Move this project document to the Recycle Bin?",
      detail:
        destination +
        (isolated
          ? ""
          : "\nThis folder contains other files. Assets and backups will remain in place."),
    });
    if (answer.response !== 1) return false;
    await storage.flush(projectId);
    await shell.trashItem(await realpath(destination));
    await storage.forget(projectId);
    return true;
  });
  handler("projects:open", async () => {
    const result = await dialog.showOpenDialog(window, {
      title: "Open CodeShip project",
      filters: [
        { name: "CodeShip project", extensions: ["codeship.json", "json"] },
      ],
      properties: ["openFile"],
    });
    if (result.canceled) return null;
    try {
      return await storage.authorize(result.filePaths[0]);
    } catch (error) {
      const answer = await dialog.showMessageBox(window, {
        type: "warning",
        buttons: ["Cancel", "Recover latest valid backup"],
        defaultId: 0,
        cancelId: 0,
        message: "This project could not be opened.",
        detail:
          String(error) +
          "\nRecovery creates a separate project and preserves the original files.",
      });
      if (answer.response !== 1) return null;
      const recovered = await storage.recoverFile(result.filePaths[0]);
      recovered.id = uid();
      recovered.name += " (recovered)";
      recovered.createdAt = recovered.updatedAt = new Date().toISOString();
      return recovered;
    }
  });
  handler("projects:save-as", async (value) => {
    const project = validateProject(value),
      result = await dialog.showOpenDialog(window, {
        title: "Save project in a new folder",
        properties: ["openDirectory", "createDirectory"],
      });
    if (result.canceled) return null;
    const path = join(result.filePaths[0], "project.codeship.json");
    if ((await readdir(result.filePaths[0])).length)
      throw new Error(
        "Choose a new empty folder for Save as. Existing files will be preserved.",
      );
    try {
      await lstat(path);
      throw new Error(
        "This folder already contains a project. Choose an empty project folder to preserve it.",
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    project.id = uid();
    project.createdAt = project.updatedAt = new Date().toISOString();
    await storage.save(project, path);
    return project;
  });
  handler("projects:folder", async (value) => {
    const error = await shell.openPath(dirname(storage.pathFor(id(value))));
    if (error) throw new Error(error);
  });
  handler("projects:backup", (value) => storage.backup(id(value)));
  handler("projects:recover", async (value) => {
    const projectId = id(value),
      answer = await dialog.showMessageBox(window, {
        type: "question",
        buttons: ["Cancel", "Open latest valid backup"],
        defaultId: 0,
        message:
          "Open a recovered copy as a separate project? The original project files will stay untouched.",
      });
    if (answer.response !== 1) return null;
    const recovered = await storage.recover(projectId);
    recovered.id = uid();
    recovered.name += " (recovered)";
    recovered.createdAt = recovered.updatedAt = new Date().toISOString();
    return recovered;
  });
  handler("settings:get", () => storage.settings);
  handler("settings:update", (value) => {
    if (!value || typeof value !== "object")
      throw new Error("Invalid preferences.");
    const settings = value as Partial<DesktopSettings>;
    const patch: Partial<DesktopSettings> = {};
    if (settings.theme && ["light", "dark", "system"].includes(settings.theme))
      patch.theme = settings.theme;
    if (
      settings.workspace &&
      Object.entries(settings.workspace).every(
        ([key, val]) =>
          /^[\w-]{1,40}$/.test(key) &&
          (typeof val === "boolean" ||
            (typeof val === "number" &&
              Number.isFinite(val) &&
              Math.abs(val) < 10000)),
      )
    )
      patch.workspace = {
        ...storage.settings.workspace,
        ...settings.workspace,
      };
    if (
      typeof settings.tutorial === "string" &&
      settings.tutorial.length < 10000
    )
      patch.tutorial = settings.tutorial;
    return storage.updateSettings(patch);
  });
  handler("settings:folder", async () => {
    const result = await dialog.showOpenDialog(window, {
      title: "Default CodeShip project folder",
      properties: ["openDirectory", "createDirectory"],
    });
    return result.canceled
      ? storage.settings
      : storage.updateSettings({
          storageFolder: await realpath(result.filePaths[0]),
        });
  });
  handler("export:folder", async (value, name) => {
    if (!value || typeof value !== "object" || typeof name !== "string")
      throw new Error("Invalid export.");
    const entries = Object.entries(value as ExportFiles);
    if (entries.length > 1500)
      throw new Error("Export contains too many files.");
    let size = 0;
    for (const [file, content] of entries) {
      if (
        !file ||
        file.includes("\\") ||
        file.startsWith("/") ||
        file
          .split("/")
          .some(
            (p) => !p || p === "." || p === ".." || /[<>:"|?*\p{Cc}]/u.test(p),
          )
      )
        throw new Error("Invalid export filename.");
      if (typeof content !== "string" && !(content instanceof Uint8Array))
        throw new Error("Invalid export content.");
      size +=
        typeof content === "string"
          ? Buffer.byteLength(content)
          : content.byteLength;
    }
    if (size > 100_000_000) throw new Error("Export exceeds 100 MB.");
    const chosen = await dialog.showOpenDialog(window, {
      title: "Choose export destination",
      properties: ["openDirectory", "createDirectory"],
    });
    if (chosen.canceled) return null;
    const root = await realpath(chosen.filePaths[0]),
      folder = resolve(
        root,
        (name.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) ||
          "codeship-export") +
          "-" +
          Date.now(),
      );
    await mkdir(folder);
    for (const [file, content] of entries) {
      const target = resolve(folder, file);
      if (!confined(folder, target))
        throw new Error("Export leaves its folder.");
      await mkdir(dirname(target), { recursive: true });
      if (!confined(await realpath(folder), await realpath(dirname(target))))
        throw new Error("Export folder contains a symbolic link.");
      await atomicWrite(target, content);
    }
    exportedFolder = folder;
    return folder;
  });
  handler("export:show", async () => {
    if (!exportedFolder) throw new Error("Export to a folder first.");
    const error = await shell.openPath(exportedFolder);
    if (error) throw new Error(error);
  });
}
async function start() {
  if (process.env["CODESHIP_DESKTOP_SMOKE"])
    console.info("Starting CodeShip desktop.");
  storage = new FileProjectStorage(
    join(app.getPath("userData"), "codeship", "settings.json"),
    process.env["CODESHIP_TEST_PROJECTS"] ??
      join(app.getPath("documents"), "CodeShip Projects"),
  );
  await storage.initialize();
  protocol.handle("codeship", async (request) => {
    try {
      const url = new URL(request.url);
      if (url.host !== "app") return new Response("Not found", { status: 404 });
      const path = resolve(
        rendererRoot,
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/index.html" : url.pathname,
          ),
      );
      if (
        !confined(rendererRoot, path) ||
        !confined(await realpath(rendererRoot), await realpath(path))
      )
        return new Response("Forbidden", { status: 403 });
      const response = await net.fetch(pathToFileURL(path).href);
      const headers = new Headers(response.headers);
      headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'nonce-" +
          previewNonce +
          "'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self'; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'",
      );
      if (extname(path) === ".js")
        headers.set("Content-Type", "text/javascript");
      const types: Record<string, string> = {
        ".html": "text/html",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
      };
      if (types[extname(path)])
        headers.set("Content-Type", types[extname(path)]);
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
  window = new BrowserWindow({
    show: !process.env["CODESHIP_DESKTOP_SMOKE"],
    width: Math.min(
      3000,
      Math.max(900, Number(storage.settings.workspace["windowWidth"]) || 1500),
    ),
    height: Math.min(
      2000,
      Math.max(640, Number(storage.settings.workspace["windowHeight"]) || 980),
    ),
    minWidth: 900,
    minHeight: 640,
    title: "CodeShip: Design visually. Build beautifully.",
    backgroundColor: "#191b1e",
    icon: join(__dirname, "icon.png"),
    webPreferences: {
      additionalArguments: ["--codeship-nonce=" + previewNonce],
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      webviewTag: false,
      backgroundThrottling: !process.env["CODESHIP_DESKTOP_SMOKE"],
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const fullScreenChanged = () =>
    window.webContents.send("codeship:fullscreen", window.isFullScreen());
  window.on("enter-full-screen", fullScreenChanged);
  window.on("leave-full-screen", fullScreenChanged);
  if (
    storage.settings.workspace["maximized"] &&
    !process.env["CODESHIP_DESKTOP_SMOKE"]
  )
    window.maximize();
  let boundsTimer: ReturnType<typeof setTimeout>;
  window.on("resize", () => {
    clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => {
      if (window.isDestroyed()) return;
      const bounds = window.getNormalBounds();
      void storage
        .updateSettings({
          workspace: {
            ...storage.settings.workspace,
            windowWidth: bounds.width,
            windowHeight: bounds.height,
            maximized: window.isMaximized(),
          },
        })
        .catch((error) => console.error("Window preferences:", error));
    }, 700);
  });
  window.webContents.on("will-prevent-unload", (event) => {
    const answer = dialog.showMessageBoxSync(window, {
      type: "warning",
      buttons: ["Keep editing", "Close without saving"],
      defaultId: 0,
      cancelId: 0,
      message: "Changes have not been saved yet.",
      detail:
        "Keep editing until the save indicator confirms that your changes are saved.",
    });
    if (answer === 1) event.preventDefault();
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("codeship://app/")) event.preventDefault();
  });
  window.webContents.session.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false),
  );
  await register();
  const send = (command: string) =>
    window.webContents.send("codeship:command", command);
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "My Projects",
            accelerator: "CmdOrCtrl+Shift+P",
            click: () => send("projects"),
          },
          {
            label: "Open project…",
            accelerator: "CmdOrCtrl+O",
            click: () => send("open"),
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: () => send("save"),
          },
          {
            label: "Save as…",
            accelerator: "CmdOrCtrl+Shift+S",
            click: () => send("save-as"),
          },
          { type: "separator" },
          {
            label: "Export…",
            accelerator: "CmdOrCtrl+E",
            click: () => send("export"),
          },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo design",
            accelerator: "CmdOrCtrl+Z",
            click: () => send("undo"),
          },
          {
            label: "Redo design",
            accelerator: "CmdOrCtrl+Shift+Z",
            click: () => send("redo"),
          },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          {
            label: "Application full screen",
            accelerator: "F11",
            click: () => window.setFullScreen(!window.isFullScreen()),
          },
          {
            label: "Focus canvas",
            accelerator: "CmdOrCtrl+Shift+F",
            click: () => send("focus-canvas"),
          },
          { label: "Full-screen preview", click: () => send("full-preview") },
          { label: "Maximize code workspace", click: () => send("focus-code") },
          ...(!app.isPackaged ? [{ role: "toggleDevTools" as const }] : []),
        ],
      },
      {
        label: "Help",
        submenu: [
          { label: "Offline documentation", click: () => send("docs") },
          {
            label: "About CodeShip",
            click: () =>
              void dialog.showMessageBox(window, {
                message: "CodeShip",
                detail:
                  "Design visually. Build beautifully. Export clean code.\nOffline desktop visual UI engineering.",
              }),
          },
        ],
      },
    ]),
  );
  await window.loadURL("codeship://app/index.html");
  if (!app.isPackaged && process.env["CODESHIP_DEVTOOLS"] === "1")
    window.webContents.openDevTools({ mode: "detach" });
  if (process.env["CODESHIP_DESKTOP_SMOKE"])
    window.webContents.on("did-finish-load", () =>
      console.info("CodeShip desktop loaded."),
    );
}
if (process.env["CODESHIP_TEST_USER_DATA"])
  app.setPath("userData", resolve(process.env["CODESHIP_TEST_USER_DATA"]));
app
  .whenReady()
  .then(start)
  .catch((error) => {
    console.error("CodeShip startup failed:", error);
    if (!process.env["CODESHIP_DESKTOP_SMOKE"])
      dialog.showErrorBox("CodeShip could not start", String(error));
    app.quit();
  });
app.on("window-all-closed", () => app.quit());

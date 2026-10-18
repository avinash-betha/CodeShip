import { contextBridge, ipcRenderer } from "electron";
import type { DesktopApi } from "../../packages/desktop-bridge";
const invoke = (command: string, ...args: unknown[]) =>
  ipcRenderer.invoke("codeship:" + command, ...args);
const api: DesktopApi = {
  platform: process.platform,
  previewNonce:
    process.argv
      .find((a) => a.startsWith("--codeship-nonce="))
      ?.split("=")[1] ?? "",
  listProjects: () => invoke("projects:list"),
  getProject: (id) => invoke("projects:get", id),
  saveProject: (project) => invoke("projects:save", project),
  deleteProject: (id) => invoke("projects:delete", id),
  openProject: () => invoke("projects:open"),
  saveProjectAs: (project) => invoke("projects:save-as", project),
  showProjectFolder: (id) => invoke("projects:folder", id),
  backupProject: (id) => invoke("projects:backup", id),
  recoverProject: (id) => invoke("projects:recover", id),
  getSettings: () => invoke("settings:get"),
  updateSettings: (settings) => invoke("settings:update", settings),
  chooseStorageFolder: () => invoke("settings:folder"),
  exportFolder: (files, name) => invoke("export:folder", files, name),
  showExportFolder: () => invoke("export:show"),
  copyText: (text) => invoke("clipboard:write", text),
  getFullScreen: () => invoke("window:fullscreen:get"),
  setFullScreen: (value) => invoke("window:fullscreen:set", value),
  onFullScreen: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean) =>
      callback(value);
    ipcRenderer.on("codeship:fullscreen", handler);
    return () => ipcRenderer.removeListener("codeship:fullscreen", handler);
  },
  onCommand: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, command: string) =>
      callback(command);
    ipcRenderer.on("codeship:command", handler);
    return () => ipcRenderer.removeListener("codeship:command", handler);
  },
};
contextBridge.exposeInMainWorld("codeshipDesktop", Object.freeze(api));

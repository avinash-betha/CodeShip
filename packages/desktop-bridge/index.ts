import type { Project } from "../document-model";
import type { ExportFiles } from "../codegen-core";
export interface DesktopSettings {
  storageFolder: string;
  recentFiles: string[];
  theme: "dark" | "light" | "system";
  workspace: Record<string, number | boolean>;
  tutorial: string;
}
export interface DesktopApi {
  readonly platform: string;
  readonly previewNonce: string;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<boolean>;
  openProject(): Promise<Project | null>;
  saveProjectAs(project: Project): Promise<Project | null>;
  showProjectFolder(id: string): Promise<void>;
  backupProject(id: string): Promise<string>;
  recoverProject(id: string): Promise<Project | null>;
  getSettings(): Promise<DesktopSettings>;
  updateSettings(
    settings: Partial<
      Pick<DesktopSettings, "theme" | "workspace" | "tutorial">
    >,
  ): Promise<DesktopSettings>;
  chooseStorageFolder(): Promise<DesktopSettings>;
  exportFolder(files: ExportFiles, name: string): Promise<string | null>;
  showExportFolder(): Promise<void>;
  copyText(text: string): Promise<void>;
  getFullScreen(): Promise<boolean>;
  setFullScreen(value: boolean): Promise<void>;
  onFullScreen(callback: (value: boolean) => void): () => void;
  onCommand(callback: (command: string) => void): () => void;
}
declare global {
  interface Window {
    codeshipDesktop?: DesktopApi;
  }
}
export const desktop = (): DesktopApi | undefined =>
  typeof window === "undefined" ? undefined : window.codeshipDesktop;
export const copyText = (text: string): Promise<void> =>
  desktop()?.copyText(text) ?? navigator.clipboard.writeText(text);

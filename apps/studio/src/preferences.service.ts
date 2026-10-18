import { Injectable, effect, signal, computed } from "@angular/core";
import {
  desktop,
  type DesktopSettings,
} from "../../../packages/desktop-bridge";
export const defaultPreferences: DesktopSettings = {
  storageFolder: "Browser local workspace",
  recentFiles: [],
  theme: "dark",
  workspace: {},
  tutorial: "",
};
@Injectable({ providedIn: "root" })
export class PreferencesService {
  readonly settings = signal<DesktopSettings>(this.read());
  readonly isDesktop = !!desktop();
  private readonly systemLight = signal(
    matchMedia("(prefers-color-scheme: light)").matches,
  );
  readonly resolvedTheme = computed(() =>
    this.settings().theme === "system"
      ? this.systemLight()
        ? "light"
        : "dark"
      : this.settings().theme,
  );
  constructor() {
    const media = matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", () => {
      this.systemLight.set(media.matches);
    });
    effect(() => {
      const settings = this.settings();
      document.documentElement.dataset["theme"] = this.resolvedTheme();
      localStorage.setItem("codeship-preferences", JSON.stringify(settings));
      void desktop()?.updateSettings({
        theme: settings.theme,
        workspace: Object.fromEntries(
          Object.entries(settings.workspace).filter(
            ([key]) =>
              !["windowWidth", "windowHeight", "maximized"].includes(key),
          ),
        ),
      });
    });
    void desktop()
      ?.getSettings()
      .then((s) => this.settings.set(s));
  }
  private read() {
    try {
      return {
        ...defaultPreferences,
        ...(JSON.parse(
          localStorage.getItem("codeship-preferences") ?? "{}",
        ) as Partial<DesktopSettings>),
      };
    } catch {
      return defaultPreferences;
    }
  }
  theme(value: DesktopSettings["theme"]) {
    this.settings.update((s) => ({ ...s, theme: value }));
  }
  layout(workspace: DesktopSettings["workspace"]) {
    this.settings.update((s) => ({
      ...s,
      workspace: { ...s.workspace, ...workspace },
    }));
  }
  async chooseFolder() {
    const settings = await desktop()?.chooseStorageFolder();
    if (settings) this.settings.set(settings);
  }
}

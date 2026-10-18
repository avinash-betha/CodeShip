import { Injectable, OnDestroy, signal } from "@angular/core";
import { desktop } from "../../../packages/desktop-bridge";

export type WorkspaceView = "editor" | "canvas" | "preview" | "code";

/** Transient views never rewrite the saved panel layout or the project. */
@Injectable({ providedIn: "root" })
export class WorkspaceViewService implements OnDestroy {
  readonly mode = signal<WorkspaceView>("editor");
  readonly fullScreen = signal(false);
  readonly error = signal("");
  private native = desktop();
  private unsubscribe = this.native?.onFullScreen((value) =>
    this.fullScreen.set(value),
  );
  private changed = () => this.fullScreen.set(!!document.fullscreenElement);
  constructor() {
    if (this.native)
      void this.native
        .getFullScreen()
        .then((value) => this.fullScreen.set(value));
    else document.addEventListener("fullscreenchange", this.changed);
  }
  enter(mode: WorkspaceView) {
    this.mode.set(mode);
  }
  restore() {
    this.mode.set("editor");
  }
  async toggleFullScreen() {
    this.error.set("");
    try {
      if (this.native) await this.native.setFullScreen(!this.fullScreen());
      else if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      this.error.set(
        "Full screen is unavailable in this window. Workspace focus modes remain available.",
      );
    }
  }
  async exitFullScreen() {
    if (!this.fullScreen()) return;
    if (this.native) await this.native.setFullScreen(false);
    else if (document.fullscreenElement) await document.exitFullscreen();
  }
  ngOnDestroy() {
    this.unsubscribe?.();
    document.removeEventListener("fullscreenchange", this.changed);
  }
}

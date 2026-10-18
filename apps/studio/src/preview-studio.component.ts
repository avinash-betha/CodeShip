import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { EditorStore } from "../../../packages/editor-core/store";
import { canvasDocument } from "../../../packages/codegen-core";
import { desktop } from "../../../packages/desktop-bridge";
import { WorkspaceViewService } from "./workspace-view.service";
import { IconComponent } from "./ui/icon.component";

@Component({
  selector: "cs-preview-studio",
  imports: [FormsModule, IconComponent],
  template: ` <section class="preview-studio" aria-label="Full-screen preview">
    <header class="preview-studio-toolbar" [hidden]="!controls()">
      <button class="quiet-button" (click)="view.restore()">
        <cs-icon name="arrow" />Back to editor
      </button>
      <strong>Live preview</strong>
      <select
        aria-label="Preview device"
        [ngModel]="device()"
        (ngModelChange)="choose($event)"
      >
        <option value="desktop">Desktop · fit window</option>
        <option value="laptop">Laptop · 1366 × 768</option>
        <option value="tablet">Tablet · 768 × 1024</option>
        <option value="mobile">Mobile · 375 × 812</option>
        <option value="custom">Custom viewport</option>
      </select>
      <label
        >W
        <input
          type="number"
          aria-label="Preview width"
          min="240"
          max="3840"
          [ngModel]="width()"
          (ngModelChange)="custom($event, height())"
      /></label>
      <label
        >H
        <input
          type="number"
          aria-label="Preview height"
          min="240"
          max="3840"
          [ngModel]="height()"
          (ngModelChange)="custom(width(), $event)"
      /></label>
      <button
        class="icon-button"
        aria-label="Rotate preview"
        (click)="custom(height(), width())"
      >
        <cs-icon name="rotate" />
      </button>
      <span class="preview-scale"
        >{{ Math.round(scale() * 100) }}% display · {{ width() }} ×
        {{ height() }} CSS px</span
      >
      <button
        class="icon-button"
        [attr.aria-label]="
          view.fullScreen()
            ? 'Exit application full screen'
            : 'Enter application full screen'
        "
        (click)="view.toggleFullScreen()"
      >
        <cs-icon name="expand" />
      </button>
      <button class="quiet-button" (click)="controls.set(false)">
        Hide controls
      </button>
    </header>
    @if (!controls()) {
      <div class="preview-return">
        <button class="quiet-button" (click)="view.restore()">
          Back to editor · Esc</button
        ><button class="quiet-button" (click)="controls.set(true)">
          Preview controls
        </button>
      </div>
    }
    <div #stage class="preview-studio-stage">
      <div
        [style.width.px]="width() * scale()"
        [style.height.px]="height() * scale()"
      >
        <iframe
          #frame
          title="Full-screen interactive preview"
          sandbox="allow-scripts"
          [srcdoc]="source()"
          [style.width.px]="width()"
          [style.height.px]="height()"
          [style.transform]="'scale(' + scale() + ')'"
        ></iframe>
      </div>
    </div>
  </section>`,
})
export class PreviewStudioComponent implements AfterViewInit, OnDestroy {
  readonly view = inject(WorkspaceViewService);
  private store = inject(EditorStore);
  private sanitizer = inject(DomSanitizer);
  readonly Math = Math;
  readonly controls = signal(true);
  readonly device = signal("desktop");
  readonly size = signal({
    width: window.innerWidth,
    height: window.innerHeight - 56,
  });
  readonly customSize = signal({ width: 375, height: 812 });
  readonly width = computed(() =>
    this.device() === "desktop" ? this.size().width : this.customSize().width,
  );
  readonly height = computed(() =>
    this.device() === "desktop" ? this.size().height : this.customSize().height,
  );
  readonly scale = computed(() =>
    Math.min(
      1,
      this.size().width / this.width(),
      this.size().height / this.height(),
    ),
  );
  readonly source = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      canvasDocument(this.store.project(), {
        interactive: true,
        nonce: desktop()?.previewNonce,
        previewExit: true,
      }),
    ),
  );
  @ViewChild("frame") frame?: ElementRef<HTMLIFrameElement>;
  @HostListener("window:message", ["$event"]) message(event: MessageEvent) {
    if (
      event.source === this.frame?.nativeElement.contentWindow &&
      event.data?.type === "codeship:preview-exit"
    )
      this.view.restore();
  }
  @ViewChild("stage") stage?: ElementRef<HTMLElement>;
  private observer?: ResizeObserver;
  choose(device: string) {
    this.device.set(device);
    const sizes: Record<string, { width: number; height: number }> = {
      laptop: { width: 1366, height: 768 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 812 },
    };
    if (sizes[device]) this.customSize.set(sizes[device]);
  }
  custom(width: number, height: number) {
    this.device.set("custom");
    this.customSize.set({
      width: Math.max(240, Math.min(3840, Math.round(Number(width) || 375))),
      height: Math.max(240, Math.min(3840, Math.round(Number(height) || 812))),
    });
  }
  ngAfterViewInit() {
    this.observer = new ResizeObserver(([entry]) =>
      this.size.set({
        width: Math.max(240, Math.floor(entry.contentRect.width)),
        height: Math.max(240, Math.floor(entry.contentRect.height)),
      }),
    );
    if (this.stage) this.observer.observe(this.stage.nativeElement);
  }
  ngOnDestroy() {
    this.observer?.disconnect();
  }
}

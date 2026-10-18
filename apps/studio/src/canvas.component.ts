import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  output,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { EditorStore } from "../../../packages/editor-core/store";
import { canvasDocument } from "../../../packages/codegen-core";
import { declarations, selectorFor } from "../../../packages/css-engine";
import {
  applyRecommendation,
  analysisWidths,
  analyzeMeasurements,
  measureDocument,
  type Measurement,
} from "../../../packages/responsive-engine";
import {
  components,
  primitives,
  templates,
} from "../../../packages/component-registry";
import {
  findNode,
  findParent,
  canContain,
  walk,
} from "../../../packages/document-model";
import { IconComponent } from "./ui/icon.component";
import { desktop } from "../../../packages/desktop-bridge";
import {
  resizeBounds,
  snapAxis,
  cssLength,
  type ResizeHandle,
} from "../../../packages/editor-core/geometry";
@Component({
  selector: "cs-canvas",
  imports: [IconComponent],
  templateUrl: "./canvas.component.html",
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  readonly Math = Math;
  readonly compare = output<void>();
  readonly icon = output<void>();
  readonly store = inject(EditorStore);
  private readonly sanitizer = inject(DomSanitizer);
  @ViewChild("frame") frame?: ElementRef<HTMLIFrameElement>;
  @ViewChild("stage") stage?: ElementRef<HTMLElement>;
  readonly pan = signal(false);
  readonly grid = signal(false);
  readonly aspect = signal(false);
  readonly spacing = signal(false);
  readonly spacingDraft = signal<{ property: string; value: string } | null>(
    null,
  );
  readonly handles: ResizeHandle[] = [
    "nw",
    "n",
    "ne",
    "e",
    "se",
    "s",
    "sw",
    "w",
  ];
  readonly layoutMode = computed(
    () => this.store.node()?.attributes["data-cs-layout"] ?? "flow",
  );
  layout(value: string): void {
    if (!this.store.node()) return;
    const el = this.selectedElement(),
      children = new Map<
        string,
        { left: string; top: string; width: string; height: string }
      >();
    if (value === "freeform" && el)
      for (const child of el.children) {
        const item = child as HTMLElement;
        if (item.dataset["csId"])
          children.set(item.dataset["csId"], {
            left: item.offsetLeft + "px",
            top: item.offsetTop + "px",
            width: item.offsetWidth + "px",
            height: item.offsetHeight + "px",
          });
      }
    this.store.transact("Change layout", (p) => {
      const page = p.pages.find((pg) => pg.id === p.activePageId)!,
        node = findNode(page.root, this.store.selected()[0])!;
      node.attributes["data-cs-layout"] = value;
      page.css = setDeclarations(
        page.css,
        selectorFor(node.id),
        {
          display:
            value === "flex" ? "flex" : value === "grid" ? "grid" : "block",
          position: value === "freeform" ? "relative" : "",
          ...(value === "grid"
            ? {
                "grid-template-columns": "repeat(2,minmax(0,1fr))",
                gap: "16px",
              }
            : value === "flex"
              ? { "flex-wrap": "wrap", gap: "16px" }
              : {}),
        },
        this.store.query(),
      );
      if (value !== "freeform")
        for (const child of node.children)
          page.css = setDeclarations(
            page.css,
            selectorFor(child.id),
            { position: "", left: "", top: "" },
            this.store.query(),
          );
      if (value === "freeform") {
        page.css = setDeclarations(
          page.css,
          selectorFor(this.store.selected()[0]),
          { "min-height": Math.max(200, el?.offsetHeight ?? 200) + "px" },
          this.store.query(),
        );
        for (const [id, values] of children)
          page.css = setDeclarations(
            page.css,
            selectorFor(id),
            { position: "absolute", ...values },
            this.store.query(),
          );
      }
    });
  }
  spaceDrag(event: PointerEvent, property: string): void {
    event.preventDefault();
    event.stopPropagation();
    const el = this.selectedElement();
    if (!el) return;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const initial = el.style.cssText,
      start = event.clientX,
      value =
        parseFloat(
          el.ownerDocument
            .defaultView!.getComputedStyle(el)
            .getPropertyValue(property),
        ) || 0;
    let next = value;
    const move = (e: PointerEvent) => {
      next = Math.max(
        0,
        Math.round(value + (e.clientX - start) / (this.store.zoom() / 100)),
      );
      el.style.setProperty(property, next + "px");
      this.spacingDraft.set({ property, value: next + "px" });
      this.updateSelection();
    };
    const done = (e: PointerEvent) => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", done);
      target.removeEventListener("pointercancel", done);
      el.style.cssText = initial;
      this.spacingDraft.set(null);
      if (e.type !== "pointercancel")
        this.store.setStyles({ [property]: next + "px" }, "Adjust spacing");
      this.updateSelection();
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", done);
    target.addEventListener("pointercancel", done);
  }
  private selectedElement() {
    return this.frame?.nativeElement.contentDocument?.querySelector<HTMLElement>(
      selectorFor(this.store.selected()[0] ?? ""),
    );
  }
  spacingTop(box: { y: number; height: number }) {
    const stage = this.stage?.nativeElement;
    return Math.max(
      8,
      Math.min(
        box.height + 24,
        (stage ? stage.scrollTop + stage.clientHeight : window.innerHeight) -
          box.y -
          100,
      ),
    );
  }
  nudge(dx: number, dy: number): void {
    const values = new Map<string, Record<string, string>>();
    for (const id of this.store.selected()) {
      const el =
        this.frame?.nativeElement.contentDocument?.querySelector<HTMLElement>(
          selectorFor(id),
        );
      if (!el) continue;
      const style = el.ownerDocument.defaultView!.getComputedStyle(el);
      values.set(id, {
        position: style.position === "absolute" ? "absolute" : "relative",
        left: (parseFloat(style.left) || 0) + dx + "px",
        top: (parseFloat(style.top) || 0) + dy + "px",
      });
    }
    this.store.transact("Nudge element", (p) => {
      const page = p.pages.find((pg) => pg.id === p.activePageId)!;
      for (const [id, style] of values)
        page.css = setDeclarations(
          page.css,
          selectorFor(id),
          style,
          this.store.query(),
        );
    });
  }
  align(axis: string): void {
    const selected = this.store.selected(),
      values = new Map<string, Record<string, string>>();
    for (const id of selected) {
      const el =
        this.frame?.nativeElement.contentDocument?.querySelector<HTMLElement>(
          selectorFor(id),
        );
      if (!el?.offsetParent) continue;
      const owner = el.offsetParent as HTMLElement,
        style = el.ownerDocument.defaultView!.getComputedStyle(el);
      if (style.position !== "absolute") {
        this.store.notify(
          "Use a freeform layout to align positioned elements. Flex and grid alignment are available in Design properties.",
        );
        return;
      }
      values.set(
        id,
        axis === "left"
          ? { left: "0px" }
          : axis === "center"
            ? { left: (owner.clientWidth - el.offsetWidth) / 2 + "px" }
            : axis === "right"
              ? { left: owner.clientWidth - el.offsetWidth + "px" }
              : axis === "top"
                ? { top: "0px" }
                : { top: owner.clientHeight - el.offsetHeight + "px" },
      );
    }
    this.store.transact("Align elements", (p) => {
      const page = p.pages.find((pg) => pg.id === p.activePageId)!;
      for (const [id, style] of values)
        page.css = setDeclarations(
          page.css,
          selectorFor(id),
          style,
          this.store.query(),
        );
    });
  }
  readonly background = signal("#222529");
  readonly context = signal<{ x: number; y: number } | null>(null);
  readonly box = signal<{
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  } | null>(null);
  readonly progress = signal("");
  readonly guide = signal<number | null>(null);
  readonly horizontalGuide = signal<number | null>(null);
  readonly dropIndicator = signal<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  private dropPlan(event: MouseEvent): {
    parentId: string;
    index?: number;
    line?: { x: number; y: number; width: number };
  } {
    const iconButton = this.iconButtonAt(event, this.dragId);
    if (iconButton) return iconButton;
    const el = this.atPoint(event),
      root = this.store.page().root,
      id = el?.dataset["csId"],
      node = id ? findNode(root, id) : null,
      parent = id ? findParent(root, id) : null;
    if (!el || !node) return { parentId: root.id };
    const rect = el.getBoundingClientRect(),
      scale = this.store.zoom() / 100,
      frame = this.frame!.nativeElement.getBoundingClientRect(),
      stage = this.stage!.nativeElement,
      s = stage.getBoundingClientRect(),
      localY = (event.clientY - frame.top) / scale - rect.top;
    const leaf = !canContain(node, { ...node, tag: "div" }),
      edge =
        node.children.length > 0 && (localY < 6 || localY > rect.height - 6);
    if (parent && (leaf || edge)) {
      const after = localY > rect.height / 2;
      return {
        parentId: parent.id,
        index:
          parent.children.findIndex((n) => n.id === node.id) + (after ? 1 : 0),
        line: {
          x: frame.left - s.left + stage.scrollLeft + rect.left * scale,
          y:
            frame.top -
            s.top +
            stage.scrollTop +
            (rect.top + (after ? rect.height : 0)) * scale,
          width: Math.max(24, rect.width * scale),
        },
      };
    }
    return { parentId: node.id };
  }
  private iconButtonAt(
    event: MouseEvent,
    sourceId: string,
  ): { parentId: string; index: number } | null {
    if (findNode(this.store.page().root, sourceId)?.tag !== "svg") return null;
    const svg =
      this.frame?.nativeElement.contentDocument?.querySelector<SVGElement>(
        selectorFor(sourceId),
      );
    const previous = svg?.style.pointerEvents ?? "";
    if (svg) svg.style.pointerEvents = "none";
    const target = this.atPoint(event)?.closest<HTMLElement>(
      "button[data-cs-id],a[data-cs-id]",
    );
    if (svg) svg.style.pointerEvents = previous;
    if (!target) return null;
    const frame = this.frame!.nativeElement.getBoundingClientRect(),
      rect = target.getBoundingClientRect();
    const x = (event.clientX - frame.left) / (this.store.zoom() / 100);
    return {
      parentId: target.dataset["csId"]!,
      index: x < rect.left + rect.width / 2 ? 0 : 1,
    };
  }
  readonly breadcrumbs = computed(() => {
    const out: { id: string; name: string }[] = [];
    const root = this.store.page().root,
      selected = this.store.selected()[0];
    if (!selected) return [{ id: root.id, name: root.name }];
    const path = (n: typeof root): boolean => {
      if (n.id === selected) {
        out.unshift({ id: n.id, name: n.name });
        return true;
      }
      for (const c of n.children)
        if (path(c)) {
          out.unshift({ id: n.id, name: n.name });
          return true;
        }
      return false;
    };
    path(root);
    return out;
  });
  readonly document = computed(() => {
    let css = this.store.page().css;
    const r = this.store.previewRecommendation();
    if (r) css = applyRecommendation(css, r);
    if (this.store.pseudo())
      for (const id of this.store.selected())
        css = setDeclarations(
          css,
          selectorFor(id),
          declarations(
            css,
            selectorFor(id) + this.store.pseudo(),
            this.store.query(),
          ),
          this.store.query(),
        );
    return this.sanitizer.bypassSecurityTrustHtml(
      canvasDocument(this.store.project(), {
        nonce: desktop()?.previewNonce,
        interactive: this.store.mode() === "preview",
        css,
      }),
    );
  });
  private observer?: ResizeObserver;
  private destroyed = false;
  constructor() {
    effect(() => {
      this.store.selected();
      this.store.zoom();
      this.store.viewport();
      this.store.mode();
      queueMicrotask(() => this.updateSelection());
    });
  }
  ngAfterViewInit(): void {
    this.observer = new ResizeObserver(() => this.updateSelection());
    if (this.stage) this.observer.observe(this.stage.nativeElement);
    queueMicrotask(() => this.fit());
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
  }
  readonly inlineText = signal<{
    id: string;
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  private dragId = "";
  private ignoreClick = false;
  loaded(event: Event): void {
    if (this.store.mode() !== "edit") return;
    const frame = event.target as HTMLIFrameElement,
      doc = frame.contentDocument;
    if (!doc) return;
    const style = doc.createElement("style");
    style.textContent =
      "html{scrollbar-width:thin}body{min-height:1000px}[data-cs-id]:empty:not(img):not(input):not(hr):not(br):not(video):not(audio):not(svg *):not(svg){min-height:60px;min-width:60px;border:1px dashed #c8d3be}[data-cs-selected]{outline:1px solid #96c57c;outline-offset:-1px}[data-drop]{outline:2px solid #75a85a!important}";
    doc.head.append(style);
    this.observer?.disconnect();
    if (this.stage) this.observer?.observe(this.stage.nativeElement);
    if (doc.body) this.observer?.observe(doc.body);
    queueMicrotask(() => {
      const selected = this.selectedElement();
      selected?.scrollIntoView({ block: "center", inline: "nearest" });
      this.updateSelection();
      const box = this.box(),
        stage = this.stage?.nativeElement;
      if (box && stage)
        stage.scrollTop = Math.max(
          0,
          box.y + Math.min(box.height, 200) / 2 - stage.clientHeight / 2,
        );
    });
  }
  private atPoint(event: MouseEvent): HTMLElement | null {
    const frame = this.frame?.nativeElement;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect(),
      scale = this.store.zoom() / 100;
    const target =
      frame.contentDocument
        ?.elementFromPoint(
          (event.clientX - rect.left) / scale,
          (event.clientY - rect.top) / scale,
        )
        ?.closest<HTMLElement>("[data-cs-id]") ?? null;
    return target?.closest<HTMLElement>("svg[data-cs-icon]") ?? target;
  }
  setViewport(value: number): void {
    if (!Number.isFinite(value)) return;
    this.store.viewport.set(Math.min(3840, Math.max(240, Math.round(value))));
    this.store.viewportHeight.set(
      value <= 480 ? 812 : value <= 800 ? 1024 : 1040,
    );
    if (value <= 480) this.store.recordActivity("mobile");
    this.frame?.nativeElement.contentWindow?.scrollTo(0, 0);
    this.stage?.nativeElement.scrollTo(0, 0);
    this.fit();
  }
  rotateViewport(): void {
    const width = this.store.viewport(),
      height = this.store.viewportHeight();
    this.store.viewport.set(height);
    this.store.viewportHeight.set(width);
    this.fit();
    this.updateSelection();
  }
  surfaceClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.ignoreClick) {
      this.ignoreClick = false;
      return;
    }
    this.context.set(null);
    if (this.pan()) return;
    const node = this.atPoint(event);
    if (node?.dataset["csId"])
      this.store.select(node.dataset["csId"], event.shiftKey);
  }
  editText(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const el = this.atPoint(event),
      id = el?.dataset["csId"];
    if (
      !el ||
      !id ||
      el.children.length ||
      ["input", "img", "video", "audio", "hr", "br"].includes(
        el.tagName.toLowerCase(),
      )
    )
      return;
    const rect = el.getBoundingClientRect(),
      scale = this.store.zoom() / 100;
    this.store.select(id);
    this.inlineText.set({
      id,
      value: findNode(this.store.page().root, id)?.text ?? "",
      x: rect.left * scale,
      y: rect.top * scale,
      width: Math.max(120, rect.width * scale),
      height: Math.max(45, rect.height * scale),
    });
    setTimeout(() => {
      const editor =
        this.stage?.nativeElement.querySelector<HTMLTextAreaElement>(
          ".inline-text-editor",
        );
      editor?.focus();
      editor?.select();
    }, 0);
  }
  updateInline(value: string): void {
    this.inlineText.update((current) =>
      current ? { ...current, value } : null,
    );
  }
  commitText(): void {
    const draft = this.inlineText();
    this.inlineText.set(null);
    if (draft) {
      this.store.select(draft.id);
      this.store.update({ text: draft.value });
    }
  }
  inlineKey(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      this.inlineText.set(null);
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.commitText();
    }
  }
  surfaceContext(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const node = this.atPoint(event);
    if (node?.dataset["csId"]) this.store.select(node.dataset["csId"]);
    this.context.set({
      x: Math.min(window.innerWidth - 210, event.clientX),
      y: Math.min(window.innerHeight - 230, event.clientY),
    });
  }
  surfaceDown(event: PointerEvent): void {
    this.ignoreClick = false;
    this.dragId = this.atPoint(event)?.dataset["csId"] ?? "";
    if (!this.pan() && event.altKey && this.dragId) {
      this.store.select(this.dragId);
      this.freeMove(event);
      return;
    }
    if (!this.pan() && this.dragId) {
      const el = this.atPoint(event);
      if (
        el?.ownerDocument.defaultView?.getComputedStyle(el).position ===
        "absolute"
      ) {
        this.store.select(this.dragId);
        this.freeMove(event);
        return;
      }
    }
    if (!this.pan()) return;
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    el.setPointerCapture(event.pointerId);
    const win = this.frame?.nativeElement.contentWindow,
      x = event.clientX,
      y = event.clientY,
      sx = win?.scrollX ?? 0,
      sy = win?.scrollY ?? 0;
    const move = (e: PointerEvent) => {
      win?.scrollTo(sx + x - e.clientX, sy + y - e.clientY);
      this.updateSelection();
    };
    const done = () => el.removeEventListener("pointermove", move);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", done, { once: true });
    el.addEventListener("pointercancel", done, { once: true });
  }
  surfaceDrag(event: DragEvent): void {
    if (this.pan() || !this.dragId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData(
      "application/codeship",
      JSON.stringify({ kind: "move", id: this.dragId }),
    );
  }
  surfaceOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.clearDrop();
    const plan = this.dropPlan(event);
    this.frame?.nativeElement.contentDocument
      ?.querySelector(selectorFor(plan.parentId))
      ?.setAttribute("data-drop", "");
    this.dropIndicator.set(plan.line ?? null);
    const frame = this.frame?.nativeElement;
    if (frame) {
      const rect = frame.getBoundingClientRect();
      if (event.clientY < rect.top + 40) frame.contentWindow?.scrollBy(0, -18);
      if (event.clientY > Math.min(rect.bottom, window.innerHeight - 65) - 40)
        frame.contentWindow?.scrollBy(0, 18);
    }
  }
  clearDrop(): void {
    this.dropIndicator.set(null);
    this.frame?.nativeElement.contentDocument
      ?.querySelectorAll("[data-drop]")
      .forEach((el) => el.removeAttribute("data-drop"));
  }
  surfaceDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    let sourceId = this.dragId;
    try {
      const data = JSON.parse(
        event.dataTransfer?.getData("application/codeship") ?? "{}",
      );
      sourceId = data.kind === "move" ? data.id : "";
    } catch {
      sourceId = "";
    }
    const plan = this.iconButtonAt(event, sourceId) ?? this.dropPlan(event);
    this.clearDrop();
    this.drop(event, plan.parentId, plan.index);
    this.dragId = "";
  }
  surfaceWheel(event: WheelEvent): void {
    event.preventDefault();
    const win = this.frame?.nativeElement.contentWindow;
    if (!win) return;
    const before = win.scrollY;
    win.scrollBy(event.deltaX, event.deltaY);
    if (win.scrollY === before)
      this.stage?.nativeElement.scrollBy(event.deltaX, event.deltaY);
    requestAnimationFrame(() => this.updateSelection());
  }
  shortcut(event: KeyboardEvent): void {
    if (
      (event.target as HTMLElement).matches(
        'input,textarea,select,[contenteditable="true"]',
      )
    )
      return;
    const mod = event.ctrlKey || event.metaKey,
      key = event.key.toLowerCase();
    if (mod && ["z", "y", "c", "v", "d", "g", "s"].includes(key))
      event.preventDefault();
    if (mod && key === "z") {
      if (event.shiftKey) this.store.redo();
      else this.store.undo();
    } else if (mod && key === "y") this.store.redo();
    else if (mod && key === "c") this.store.copy();
    else if (mod && key === "v") this.store.paste();
    else if (mod && key === "d") this.store.duplicate();
    else if (mod && key === "g") {
      if (event.shiftKey) this.store.ungroup();
      else this.store.group();
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      this.nudge(
        event.key === "ArrowLeft"
          ? -step
          : event.key === "ArrowRight"
            ? step
            : 0,
        event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
      );
    } else if (mod && key === "s") void this.store.persist();
    else if (["Delete", "Backspace"].includes(event.key)) {
      event.preventDefault();
      this.store.remove();
    } else if (event.key === "Escape") {
      this.store.selected.set([]);
      this.context.set(null);
    } else if (key === "v") this.setPan(false);
    else if (key === "h") this.setPan(true);
  }
  setPan(value: boolean): void {
    this.pan.set(value);
  }
  drop(event: DragEvent, parentId?: string, index?: number): void {
    try {
      const data = JSON.parse(
        event.dataTransfer?.getData("application/codeship") ?? "{}",
      ) as { kind: string; id: string };
      if (data.kind === "primitive") {
        const p = primitives.find((p) => p.name === data.id);
        if (p) this.store.insert(p.tag, p.text, p.attributes, parentId, index);
      } else if (data.kind === "move" && parentId)
        this.store.move(data.id, parentId, index);
      else if (data.kind === "component" || data.kind === "template") {
        if (parentId) this.store.select(parentId);
        const entry = [...components, ...templates].find(
          (e) => e.id === data.id,
        );
        if (entry) this.store.loadEntry(entry, false, index);
      }
    } catch (error) {
      this.store.fail(error);
    }
  }
  updateSelection(): void {
    if (this.destroyed) return;
    const frame = this.frame?.nativeElement,
      stage = this.stage?.nativeElement;
    if (!frame || !stage || this.store.mode() === "preview") {
      this.box.set(null);
      return;
    }
    const id = this.store.selected()[0],
      el = id
        ? frame.contentDocument?.querySelector<HTMLElement>(selectorFor(id))
        : null;
    if (!el) {
      this.box.set(null);
      return;
    }
    const r = el.getBoundingClientRect(),
      f = frame.getBoundingClientRect(),
      s = stage.getBoundingClientRect(),
      scale = this.store.zoom() / 100;
    if (!r.width || !r.height) {
      this.box.set(null);
      return;
    }
    this.box.set({
      x: f.left - s.left + stage.scrollLeft + r.left * scale,
      y: f.top - s.top + stage.scrollTop + r.top * scale,
      width: r.width * scale,
      height: r.height * scale,
      name:
        findNode(this.store.page().root, id)?.name ?? el.tagName.toLowerCase(),
    });
    frame.contentDocument
      ?.querySelectorAll("[data-cs-selected]")
      .forEach((n) => n.removeAttribute("data-cs-selected"));
    for (const selected of this.store.selected())
      frame.contentDocument
        ?.querySelector(selectorFor(selected))
        ?.setAttribute("data-cs-selected", "");
  }
  freeMove(event: PointerEvent): void {
    const el = this.selectedElement();
    if (!el) return;
    event.preventDefault();
    const surface = event.currentTarget as HTMLElement;
    const iconId =
      this.store.node()?.tag === "svg" ? this.store.node()!.id : "";
    surface.setPointerCapture(event.pointerId);
    const original = el.style.cssText,
      x = event.clientX,
      y = event.clientY,
      scale = this.store.zoom() / 100,
      style = el.ownerDocument.defaultView!.getComputedStyle(el),
      position = style.position === "absolute" ? "absolute" : "relative",
      left = parseFloat(style.left) || 0,
      top = parseFloat(style.top) || 0;
    let dx = 0,
      dy = 0;
    const move = (e: PointerEvent) => {
      const snap = this.grid() ? 8 : 1;
      dx = Math.round((e.clientX - x) / scale / snap) * snap;
      dy = Math.round((e.clientY - y) / scale / snap) * snap;
      const parent = el.offsetParent as HTMLElement | null;
      if (position === "absolute" && parent) {
        const siblings = Array.from(parent.children).filter(
            (node): node is HTMLElement =>
              node instanceof el.ownerDocument.defaultView!.HTMLElement &&
              node !== el &&
              node.offsetParent === parent,
          ),
          xs = [
            0,
            parent.clientWidth / 2,
            parent.clientWidth,
            ...siblings.flatMap((node) => [
              node.offsetLeft,
              node.offsetLeft + node.offsetWidth / 2,
              node.offsetLeft + node.offsetWidth,
            ]),
          ],
          ys = [
            0,
            parent.clientHeight / 2,
            parent.clientHeight,
            ...siblings.flatMap((node) => [
              node.offsetTop,
              node.offsetTop + node.offsetHeight / 2,
              node.offsetTop + node.offsetHeight,
            ]),
          ];
        const sx = snapAxis(left + dx, el.offsetWidth, xs),
          sy = snapAxis(top + dy, el.offsetHeight, ys);
        dx = sx.value - left;
        dy = sy.value - top;
        const frame = this.frame!.nativeElement,
          stage = this.stage!.nativeElement,
          f = frame.getBoundingClientRect(),
          s = stage.getBoundingClientRect(),
          p = parent.getBoundingClientRect();
        this.guide.set(
          sx.guide === null
            ? null
            : f.left - s.left + stage.scrollLeft + (p.left + sx.guide) * scale,
        );
        this.horizontalGuide.set(
          sy.guide === null
            ? null
            : f.top - s.top + stage.scrollTop + (p.top + sy.guide) * scale,
        );
      }
      el.style.position = position;
      el.style.left = left + dx + "px";
      el.style.top = top + dy + "px";
      if (iconId) {
        this.clearDrop();
        const target = this.iconButtonAt(e, iconId);
        if (target)
          this.frame?.nativeElement.contentDocument
            ?.querySelector(selectorFor(target.parentId))
            ?.setAttribute("data-drop", "");
      }
      this.updateSelection();
    };
    const done = (e: PointerEvent) => {
      this.guide.set(null);
      this.horizontalGuide.set(null);
      this.ignoreClick =
        e.type === "pointerup" && (Math.abs(dx) > 2 || Math.abs(dy) > 2);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", done);
      surface.removeEventListener("pointercancel", done);
      el.style.cssText = original;
      const target =
        iconId && e.type !== "pointercancel" && this.ignoreClick
          ? this.iconButtonAt(e, iconId)
          : null;
      this.clearDrop();
      if (target)
        this.store.moveIconToButton(
          iconId,
          target.parentId,
          target.index === 0 ? "before-text" : "after-text",
        );
      else if (e.type !== "pointercancel" && (dx || dy))
        this.store.setStyles(
          { position, left: left + dx + "px", top: top + dy + "px" },
          "Move element",
        );
      this.updateSelection();
    };
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", done);
    surface.addEventListener("pointercancel", done);
  }
  resize(event: PointerEvent, handle: ResizeHandle = "se"): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const start = this.box();
    if (!start) return;
    const scale = this.store.zoom() / 100,
      x = event.clientX,
      y = event.clientY;
    const element = this.selectedElement();
    if (!element) return;
    const original = element.style.cssText,
      computed = element.ownerDocument.defaultView!.getComputedStyle(element),
      positioned = computed.position === "absolute";
    const initial = {
      x: parseFloat(computed.left) || 0,
      y: parseFloat(computed.top) || 0,
      width: start.width / scale,
      height: start.height / scale,
    };
    let bounds = initial;
    const move = (e: PointerEvent) => {
      bounds = resizeBounds(
        initial,
        handle,
        (e.clientX - x) / scale,
        (e.clientY - y) / scale,
        {
          snap: this.grid() ? 8 : 1,
          aspect: this.aspect() || e.shiftKey,
          minWidth: cssLength(
            computed.minWidth,
            element.parentElement?.clientWidth ?? this.store.viewport(),
            16,
          ),
          minHeight: cssLength(
            computed.minHeight,
            element.parentElement?.clientHeight ?? this.store.viewportHeight(),
            16,
          ),
          maxWidth: cssLength(
            computed.maxWidth,
            element.parentElement?.clientWidth ?? this.store.viewport(),
            Infinity,
          ),
          maxHeight: cssLength(
            computed.maxHeight,
            element.parentElement?.clientHeight ?? this.store.viewportHeight(),
            Infinity,
          ),
        },
      );
      let { width } = bounds;
      const { height } = bounds;
      const el =
        this.frame?.nativeElement.contentDocument?.querySelector<HTMLElement>(
          selectorFor(this.store.selected()[0]),
        );
      if (el) {
        const parent = el.parentElement,
          stage = this.stage?.nativeElement,
          frame = this.frame?.nativeElement;
        if (
          parent &&
          stage &&
          frame &&
          Math.abs(width - parent.clientWidth) < 8
        ) {
          width = parent.clientWidth;
          const p = parent.getBoundingClientRect(),
            f = frame.getBoundingClientRect(),
            s = stage.getBoundingClientRect();
          this.guide.set(f.left - s.left + stage.scrollLeft + p.right * scale);
        } else this.guide.set(null);
        el.style.width = width + "px";
        el.style.height = height + "px";
        bounds.width = width;
        if (positioned) {
          el.style.left = bounds.x + "px";
          el.style.top = bounds.y + "px";
        }
      }
      this.updateSelection();
    };
    const done = (event: PointerEvent) => {
      this.guide.set(null);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", done);
      target.removeEventListener("pointercancel", done);
      element.style.cssText = original;
      if (event.type === "pointercancel") {
        this.updateSelection();
        return;
      }
      this.store.transact("Resize element", (p) => {
        const page = p.pages.find((pg) => pg.id === p.activePageId)!;
        importStyle(
          page,
          this.store.selected(),
          bounds.width,
          bounds.height,
          this.store.query(),
        );
        if (positioned)
          for (const id of this.store.selected())
            page.css = setDeclarations(
              page.css,
              selectorFor(id),
              { left: bounds.x + "px", top: bounds.y + "px" },
              this.store.query(),
            );
      });
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", done);
    target.addEventListener("pointercancel", done);
  }
  async analyze(): Promise<void> {
    if (this.store.busy()) return;
    this.store.busy.set(true);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.style.cssText =
      "position:fixed;left:-20000px;top:0;height:1400px;border:0;visibility:hidden";
    document.body.append(iframe);
    try {
      const all: Measurement[] = [];
      iframe.srcdoc = canvasDocument(this.store.project());
      await new Promise<void>((resolve) => (iframe.onload = () => resolve()));
      for (const width of analysisWidths) {
        if (this.destroyed) return;
        this.progress.set(`Measuring ${width}px`);
        iframe.style.width = width + "px";
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        if (iframe.contentDocument)
          all.push(...measureDocument(iframe.contentDocument, width));
      }
      const recommendations = analyzeMeasurements(all);
      this.store.recommendations.set(recommendations);
      this.store.notify(
        recommendations.length
          ? `${recommendations.length} recommendations from ${analysisWidths.length} measured viewports.`
          : `No detected layout issues at ${analysisWidths.join(", ")}px. Review your design visually too.`,
      );
    } catch (error) {
      this.store.fail(error);
    } finally {
      iframe.remove();
      this.store.busy.set(false);
      this.progress.set("");
    }
  }
  fit(): void {
    const stage = this.stage?.nativeElement;
    if (stage)
      this.store.zoom.set(
        Math.max(
          20,
          Math.min(
            100,
            Math.floor(
              ((stage.clientWidth - 96) / this.store.viewport()) * 100,
            ),
          ),
        ),
      );
  }
  count(): number {
    let count = 0;
    walk(this.store.page().root, () => count++);
    return count;
  }
}
import { setDeclarations } from "../../../packages/css-engine";
import type { Page } from "../../../packages/document-model";
function importStyle(
  page: Page,
  ids: string[],
  width: number,
  height: number,
  context: string,
): void {
  for (const id of ids)
    page.css = setDeclarations(
      page.css,
      selectorFor(id),
      { width: width + "px", height: height + "px" },
      context,
    );
}

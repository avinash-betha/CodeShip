import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { EditorStore } from "../../../packages/editor-core/store";
import {
  declarations,
  propertyRegistry,
  selectorFor,
} from "../../../packages/css-engine";
import {
  animationCss,
  defaultAnimation,
  type Keyframe,
} from "../../../packages/animation-engine";
import {
  findParent,
  walk,
  type Interaction,
  type ElementNode,
} from "../../../packages/document-model";
import {
  buttonLabel,
  iconPlacements,
  type IconPlacement,
} from "../../../packages/editor-core/icon-placement";
import type { Recommendation } from "../../../packages/responsive-engine";
import { IconComponent } from "./ui/icon.component";
import {
  stylePresets,
  defaultGlass,
  glassValues,
  type StylePreset,
} from "../../../packages/component-registry/style-presets";
import { setDeclarations } from "../../../packages/css-engine";
@Component({
  selector: "cs-inspector",
  imports: [FormsModule, DecimalPipe, IconComponent],
  templateUrl: "./inspector.component.html",
})
export class InspectorComponent {
  readonly iconPlacements = iconPlacements;
  readonly iconTarget = signal("");
  readonly iconPlacement = signal<IconPlacement>("before-text");
  readonly editIcon = output<void>();
  readonly store = inject(EditorStore);
  readonly mode = input<"properties" | "responsive">("properties");
  readonly tab = signal("design");
  readonly groups = ["Layout", "Size", "Spacing", "Typography", "Appearance"];
  readonly registry = propertyRegistry;
  readonly presets = stylePresets;
  readonly iconButtons = computed(() => {
    const targets: { id: string; label: string }[] = [];
    walk(this.store.page().root, (node: ElementNode) => {
      if (["button", "a"].includes(node.tag))
        targets.push({
          id: node.id,
          label:
            buttonLabel(node) || node.attributes["aria-label"] || node.name,
        });
    });
    return targets;
  });
  constructor() {
    effect(() => {
      const node = this.store.node();
      const parent =
        node?.tag === "svg"
          ? findParent(this.store.page().root, node.id)
          : null;
      const button =
        parent && ["button", "a"].includes(parent.tag) ? parent : null;
      this.iconTarget.set(button?.id ?? "");
      this.iconPlacement.set(
        (button?.attributes["data-cs-icon-layout"] as IconPlacement) ||
          "before-text",
      );
    });
  }
  placeSelectedIcon() {
    const node = this.store.node();
    if (node?.tag === "svg" && this.iconTarget())
      this.store.moveIconToButton(
        node.id,
        this.iconTarget(),
        this.iconPlacement(),
      );
  }
  glass = { ...defaultGlass };
  setGlassVariant(dark: boolean) {
    this.glass.dark = dark;
    this.glass.tint = dark ? "#172d25" : "#f0faf5";
  }
  applyPreset(preset: StylePreset) {
    if (preset.name === "Glassmorphism") this.applyGlass();
    else this.store.setStyles(preset.values, "Apply " + preset.name);
  }
  applyGlass() {
    const ids = this.store.selected();
    this.store.transact("Apply glass style", (p) => {
      const page = p.pages.find((pg) => pg.id === p.activePageId)!;
      for (const id of ids) {
        const selector = selectorFor(id);
        page.css = setDeclarations(
          page.css,
          selector,
          glassValues(this.glass),
          this.store.query(),
        );
        page.css = setDeclarations(
          page.css,
          selector,
          {
            background: this.glass.dark ? "#1c302a" : "#edf5ef",
            "backdrop-filter": "none",
            "-webkit-backdrop-filter": "none",
          },
          "@supports not (backdrop-filter: blur(1px))",
        );
        page.css = setDeclarations(
          page.css,
          selector,
          {
            background: this.glass.dark ? "#1c302a" : "#edf5ef",
            "backdrop-filter": "none",
            "-webkit-backdrop-filter": "none",
          },
          "@media (prefers-reduced-transparency: reduce)",
        );
        page.css = setDeclarations(
          page.css,
          selector,
          { transition: "none" },
          "@media (prefers-reduced-motion: reduce)",
        );
      }
    });
  }
  readonly attributes = computed(() =>
    Object.entries(this.store.node()?.attributes ?? {}),
  );
  readonly animation = defaultAnimation();
  newAttribute = "";
  newValue = "";
  customProperty = "";
  customValue = "";
  readonly customError = signal("");
  readonly ownDeclarations = computed(() => Object.entries(this.store.style()));
  resetGroup(group: string) {
    this.store.setStyles(
      Object.fromEntries(
        this.registry
          .filter((p) => p.group === group)
          .map((p) => [p.property, ""]),
      ),
      "Reset " + group + " styles",
    );
  }
  resetCustom() {
    this.customProperty = "";
    this.customValue = "";
    this.customError.set("");
  }
  blockName = "";
  transitionProperty = "all";
  transitionDuration = 200;
  transitionEasing = "ease";
  transitionDelay = 0;
  interactionAction: Interaction["action"] = "toggle-class";
  interactionEvent: Interaction["event"] = "click";
  interactionTarget = "";
  interactionValue = "";
  readonly frames = signal<Keyframe[]>(this.animation.frames);
  readonly pending = computed(() =>
    this.store.recommendations().filter((r) => r.status === "pending"),
  );
  addAttribute(): void {
    if (this.newAttribute) {
      this.store.setAttribute(this.newAttribute, this.newValue);
      this.newAttribute = "";
      this.newValue = "";
    }
  }
  removeAttribute(key: string): void {
    const a = { ...this.store.node()?.attributes };
    delete a[key];
    this.store.update({ attributes: a });
  }
  applyCustom(): void {
    if (this.customProperty) {
      try {
        setDeclarations(
          this.store.page().css,
          selectorFor(this.store.selected()[0]) + this.store.pseudo(),
          { [this.customProperty.trim()]: this.customValue },
          this.store.query(),
        );
        this.store.setStyle(this.customProperty.trim(), this.customValue);
        const supported = CSS.supports(
          this.customProperty.trim(),
          this.customValue,
        );
        this.customError.set(
          supported || this.customProperty.startsWith("--")
            ? ""
            : "Saved. This browser does not recognize that property/value; it is preserved for export.",
        );
        this.customProperty = "";
        this.customValue = "";
      } catch (error) {
        this.customError.set(String(error));
      }
    }
  }
  applyAnimation(): void {
    const n = this.store.node();
    if (!n) return;
    try {
      this.store.setCss(
        animationCss(this.store.page().css, n.id, {
          ...this.animation,
          frames: this.frames(),
        }),
      );
      this.store.notify(
        "Animation applied, including a reduced-motion alternative.",
      );
    } catch (error) {
      this.store.fail(error);
    }
  }
  setFrame(index: number, key: keyof Keyframe, value: string): void {
    this.frames.update((frames) =>
      frames.map((f, i) =>
        i === index
          ? { ...f, [key]: key === "offset" ? Number(value) : value }
          : f,
      ),
    );
  }
  addFrame(): void {
    this.frames.update((frames) =>
      [
        ...frames,
        { offset: 50, opacity: "1", transform: "translateY(-8px)" },
      ].sort((a, b) => a.offset - b.offset),
    );
  }
  removeFrame(index: number): void {
    this.frames.update((frames) => frames.filter((_f, i) => i !== index));
  }
  dragFrame(event: PointerEvent, index: number): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement,
      track = target.parentElement;
    if (!track) return;
    target.setPointerCapture(event.pointerId);
    const bounds = track.getBoundingClientRect();
    const move = (e: PointerEvent) =>
      this.setFrame(
        index,
        "offset",
        String(
          Math.max(
            0,
            Math.min(
              100,
              Math.round(((e.clientX - bounds.left) / bounds.width) * 100),
            ),
          ),
        ),
      );
    target.addEventListener("pointermove", move);
    const end = () => target.removeEventListener("pointermove", move);
    target.addEventListener("pointerup", end, { once: true });
    target.addEventListener("pointercancel", end, { once: true });
  }
  curveValues(): number[] {
    const match = /cubic-bezier\(([^)]+)\)/.exec(this.animation.easing);
    const values = match?.[1].split(",").map(Number);
    return values?.length === 4 && values.every(Number.isFinite)
      ? values
      : [0.16, 1, 0.3, 1];
  }
  curvePath(): string {
    const [x1, y1, x2, y2] = this.curveValues();
    return `M 10 90 C ${10 + x1 * 100} ${90 - y1 * 80}, ${10 + x2 * 100} ${90 - y2 * 80}, 110 10`;
  }
  setCurve(index: number, value: string): void {
    const values = this.curveValues();
    values[index] = Math.max(
      index % 2 ? -1 : 0,
      Math.min(index % 2 ? 2 : 1, Number(value) || 0),
    );
    this.animation.easing = `cubic-bezier(${values.join(", ")})`;
  }
  transition(): void {
    this.store.setStyle(
      "transition",
      `${this.transitionProperty} ${this.transitionDuration}ms ${this.transitionEasing} ${this.transitionDelay}ms`,
    );
  }
  previewAnimation(): void {
    const el = document
      .querySelector<HTMLIFrameElement>('iframe[title="Design canvas"]')
      ?.contentDocument?.querySelector<HTMLElement>(
        selectorFor(this.store.selected()[0]),
      );
    if (el) {
      const value = el.style.animation;
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = value;
    }
  }
  addInteraction(): void {
    const n = this.store.node();
    if (!n || !this.interactionValue) return;
    this.store.update({
      interactions: [
        ...n.interactions,
        {
          event: this.interactionEvent,
          action: this.interactionAction,
          target: this.interactionTarget || n.id,
          value: this.interactionValue,
        },
      ],
    });
    this.interactionValue = "";
  }
  removeInteraction(index: number): void {
    const n = this.store.node();
    if (n)
      this.store.update({
        interactions: n.interactions.filter((_i, i) => i !== index),
      });
  }
  before(r: Recommendation): string {
    const styles = declarations(this.store.page().css, r.selector, r.context);
    return Object.keys(r.styles)
      .map((k) => `${k}: ${styles[k] ?? "(computed / inherited)"};`)
      .join("\n");
  }
  after(r: Recommendation): string {
    return `${r.context ? `${r.context} {\n` : ""}${r.selector} {\n${Object.entries(
      r.styles,
    )
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")}\n}${r.context ? "\n}" : ""}`;
  }
  alternative(
    r: Recommendation,
    alternative: { styles: Record<string, string>; context: string },
  ): void {
    this.store.applySuggestion({
      ...r,
      styles: alternative.styles,
      context: alternative.context,
    });
  }
  saveBlock(): void {
    this.store.saveBlock(
      this.blockName || this.store.node()?.name || "Untitled block",
    );
    this.blockName = "";
  }
}

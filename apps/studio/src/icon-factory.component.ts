import {
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { EditorStore } from "../../../packages/editor-core/store";
import {
  placeButtonIcon,
  type IconPlacement,
} from "../../../packages/editor-core/icon-placement";
import {
  clone,
  duplicateNode,
  element,
  findNode,
  findParent,
  History,
  type ElementNode,
  uid,
  walk,
  canContain,
} from "../../../packages/document-model";
import {
  cloneIcon,
  defaultIconOptions,
  iconCategories,
  iconComponent,
  icons,
  makeIcon,
  parseSvg,
  svgSource,
  type IconOptions,
} from "../../../packages/icon-factory";
import { download } from "../../../packages/codegen-core/export";
import { IconComponent } from "./ui/icon.component";
import { setDeclarations, selectorFor } from "../../../packages/css-engine";

@Component({
  selector: "cs-icon-factory",
  imports: [FormsModule, IconComponent],
  templateUrl: "./icon-factory.component.html",
  styleUrl: "./icon-factory.css",
  encapsulation: ViewEncapsulation.None,
})
export class IconFactoryComponent {
  readonly Math = Math;
  readonly Object = Object;
  readonly store = inject(EditorStore);
  private readonly sanitizer = inject(DomSanitizer);
  readonly icons = icons;
  readonly categories = iconCategories;
  readonly search = signal("");
  readonly category = signal("All");
  readonly tab = signal<"library" | "saved" | "vector">("library");
  readonly placement = signal<IconPlacement>("after-text");
  readonly selected = signal("spark");
  readonly options = signal<IconOptions>({ ...defaultIconOptions });
  readonly draft = signal<ElementNode>(makeIcon("spark"));
  readonly source = signal(svgSource(this.draft()));
  readonly error = signal("");
  readonly notice = signal("");
  readonly selectedLayer = signal("");
  readonly history = new History<ElementNode>();
  readonly version = signal(0);
  readonly canUndo = computed(() => {
    this.version();
    return this.history.canUndo;
  });
  readonly canRedo = computed(() => {
    this.version();
    return this.history.canRedo;
  });
  readonly preview = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(svgSource(this.draft(), true)),
  );
  readonly filtered = computed(() =>
    icons.filter(
      (i) =>
        (this.category() === "All" || i.category === this.category()) &&
        `${i.name} ${i.category} ${i.tags.join(" ")}`
          .toLowerCase()
          .includes(this.search().toLowerCase()),
    ),
  );
  readonly saved = computed(() =>
    this.store
      .project()
      .components.filter(
        (c) => c.root.tag === "svg" && c.root.attributes["data-cs-icon"],
      ),
  );
  readonly layers = computed(() => {
    const list: { node: ElementNode; depth: number }[] = [];
    walk(this.draft(), (node, _p, depth) => {
      if (
        ![
          "defs",
          "lineargradient",
          "radialgradient",
          "stop",
          "title",
          "desc",
        ].includes(node.tag)
      )
        list.push({ node, depth });
    });
    return list;
  });
  readonly layer = computed(() => findNode(this.draft(), this.selectedLayer()));
  readonly editTarget =
    this.store.node()?.tag === "svg" ? this.store.node()?.id : undefined;
  variantName = "My custom icon";
  exportTarget = "svg";
  constructor() {
    const current = this.store.node();
    if (current?.tag === "svg") {
      this.draft.set(clone(current));
      this.source.set(svgSource(current));
      this.restoreOptions(current);
    }
  }
  private commit(root: ElementNode) {
    this.history.record(this.draft());
    this.draft.set(root);
    this.source.set(svgSource(root));
    this.error.set("");
    this.notice.set("");
    this.version.update((n) => n + 1);
  }
  choose(id: string) {
    this.selected.set(id);
    this.commit(makeIcon(id, this.options()));
    this.selectedLayer.set("");
  }
  configure(key: keyof IconOptions, value: unknown) {
    try {
      const next = { ...this.options(), [key]: value } as IconOptions;
      const generated = makeIcon(this.selected(), next);
      if (this.selected() === "custom") {
        const root = clone(this.draft());
        const attributes =
          key === "size"
            ? ["width", "height"]
            : key === "opacity"
              ? ["opacity"]
              : key === "label"
                ? ["aria-label", "aria-hidden", "role"]
                : [];
        for (const attr of attributes) {
          delete root.attributes[attr];
          if (generated.attributes[attr])
            root.attributes[attr] = generated.attributes[attr];
        }
        root.attributes["data-cs-icon-config"] = JSON.stringify(next);
        this.commit(root);
      } else this.commit(generated);
      this.options.set(next);
    } catch (error) {
      this.error.set(String(error));
    }
  }
  useSaved(id: string) {
    const saved = this.saved().find((c) => c.id === id);
    if (saved) {
      this.commit(cloneIcon(saved.root));
      this.restoreOptions(saved.root);
      this.variantName = saved.name;
      this.notice.set(
        "Loaded saved vector. Use shape controls to edit its layers.",
      );
    }
  }
  save() {
    const root = cloneIcon(this.draft());
    const name = this.variantName.trim() || "Custom icon";
    root.name = name;
    this.store.transact("Save icon variant", (p) => {
      p.components.push({ id: uid(), name, root, css: "" });
    });
    this.notice.set(
      "Saved to this project. It will be here when you reopen it.",
    );
  }
  removeSaved(id: string) {
    this.store.transact("Remove saved icon", (p) => {
      p.components = p.components.filter((c) => c.id !== id);
    });
  }
  insert(update = false) {
    const root = duplicateNode(this.draft());
    if (update && this.editTarget) {
      this.store.transact("Update icon", (p) => {
        const page = p.pages.find((pg) => pg.id === p.activePageId)!;
        const target = findNode(page.root, this.editTarget!);
        if (target) {
          root.id = target.id;
          Object.assign(target, root);
        }
      });
      this.notice.set("Selected icon updated.");
    } else {
      const target = this.store.node();
      if (target && ["input", "select", "textarea"].includes(target.tag)) {
        const done = this.store.transact("Insert field icon", (p) => {
          const page = p.pages.find((pg) => pg.id === p.activePageId)!;
          const parent = findParent(page.root, target.id);
          if (!parent) throw new Error("Select a field inside a container.");
          const index = parent.children.findIndex((c) => c.id === target.id),
            field = parent.children[index];
          const wrapper = element("div", "", { "data-cs-icon-field": "true" }, [
            root,
            field,
          ]);
          wrapper.name = "Icon field";
          parent.children[index] = wrapper;
          page.css = setDeclarations(page.css, selectorFor(wrapper.id), {
            position: "relative",
            width: "100%",
            "min-width": "0",
          });
          page.css = setDeclarations(page.css, selectorFor(root.id), {
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            "pointer-events": "none",
          });
          page.css = setDeclarations(page.css, selectorFor(field.id), {
            "padding-left": `${(Number(root.attributes["width"]) || 24) + 20}px !important`,
            width: "100%",
          });
        });
        if (done) {
          this.store.select(root.id);
          this.store.recordActivity("Insert icon");
          this.notice.set(
            "Field wrapped with an icon; its ID, label and behavior are preserved.",
          );
        }
        return;
      }
      if (target && ["button", "a"].includes(target.tag)) {
        const done = this.store.transact("Insert button icon", (p) => {
          placeButtonIcon(p, root, target.id, this.placement());
        });
        if (done) {
          this.store.select(root.id);
          this.store.recordActivity("Insert icon");
          this.notice.set(
            "Icon inserted without replacing the button content or behavior.",
          );
        }
        return;
      }
      const container =
        target && canContain(target, root) ? target : this.store.page().root;
      if (
        this.store.operate({
          type: "insert",
          parentId: container.id,
          node: root,
        })
      ) {
        this.store.select(root.id);
        this.store.recordActivity("Insert icon");
        this.notice.set(
          "Icon inserted. Close the factory to position it on your canvas.",
        );
      }
    }
  }
  importSource() {
    try {
      const root = parseSvg(this.source());
      this.commit(root);
      this.restoreOptions(root);
      this.tab.set("vector");
      this.notice.set("SVG imported as editable vector layers.");
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    }
  }
  async importFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.source.set(await file.text());
      this.importSource();
    }
    (event.target as HTMLInputElement).value = "";
  }
  selectShape(event: MouseEvent) {
    const target = (event.target as Element).closest("[data-vector-id]");
    if (target) this.selectedLayer.set(target.getAttribute("data-vector-id")!);
  }
  shape(kind: string) {
    const attrs: Record<string, Record<string, string>> = {
      rect: { x: "5", y: "5", width: "14", height: "14", rx: "3" },
      circle: { cx: "12", cy: "12", r: "7" },
      line: { x1: "4", y1: "20", x2: "20", y2: "4" },
      path: { d: "M4 18 Q12 2 20 18" },
      g: { transform: "translate(0 0)" },
    };
    const root = clone(this.draft());
    const layer = element(kind, "", {
      ...attrs[kind],
      fill: "none",
      stroke: this.options().color,
      "stroke-width": String(this.options().stroke),
    });
    const parent = findNode(root, this.selectedLayer());
    (parent?.tag === "g" ? parent : root).children.push(layer);
    this.commitVector(root);
    this.selectedLayer.set(layer.id);
  }
  editShape(key: string, value: string) {
    try {
      const root = clone(this.draft());
      const layer = findNode(root, this.selectedLayer());
      if (layer) {
        layer.attributes[key] = value;
        parseSvg(svgSource(root));
        this.commitVector(root);
      }
    } catch (error) {
      this.error.set(String(error));
    }
  }
  deleteShape() {
    const root = clone(this.draft()),
      parent = findParent(root, this.selectedLayer());
    if (parent) {
      parent.children = parent.children.filter(
        (c) => c.id !== this.selectedLayer(),
      );
      this.commitVector(root);
      this.selectedLayer.set("");
      this.selected.set("custom");
    }
  }
  align(axis: "x" | "y") {
    const root = clone(this.draft()),
      node = findNode(root, this.selectedLayer());
    if (!node) return;
    const attrs = node.attributes;
    if (node.tag === "circle") {
      attrs[axis === "x" ? "cx" : "cy"] = "12";
    } else if (node.tag === "rect") {
      attrs[axis] = String(
        (24 - Number(attrs[axis === "x" ? "width" : "height"] ?? 0)) / 2,
      );
    } else {
      this.notice.set(
        "Center alignment supports rectangles and circles. Use transform for paths and groups.",
      );
      return;
    }
    this.commitVector(root);
  }
  private commitVector(root: ElementNode) {
    root.attributes["data-cs-icon"] = "custom";
    root.attributes["data-cs-icon-config"] = JSON.stringify(this.options());
    root.name = "Custom icon";
    this.commit(root);
    this.selected.set("custom");
  }
  undo() {
    const prev = this.history.undo(this.draft());
    if (prev) {
      this.draft.set(prev);
      this.source.set(svgSource(prev));
      this.restoreOptions(prev);
      this.version.update((n) => n + 1);
    }
  }
  redo() {
    const next = this.history.redo(this.draft());
    if (next) {
      this.draft.set(next);
      this.source.set(svgSource(next));
      this.restoreOptions(next);
      this.version.update((n) => n + 1);
    }
  }
  private restoreOptions(root: ElementNode) {
    this.selected.set(root.attributes["data-cs-icon"] ?? "custom");
    try {
      this.options.set({
        ...defaultIconOptions,
        ...(JSON.parse(
          root.attributes["data-cs-icon-config"] ?? "{}",
        ) as Partial<IconOptions>),
        size: Math.max(
          12,
          Math.min(512, parseFloat(root.attributes["width"]) || 32),
        ),
        opacity: Number.isFinite(Number(root.attributes["opacity"]))
          ? Math.max(0, Math.min(1, Number(root.attributes["opacity"])))
          : 1,
        label: root.attributes["aria-label"] ?? "",
      });
    } catch {
      this.options.set({ ...defaultIconOptions });
    }
  }
  async export() {
    try {
      const root = this.draft(),
        source = svgSource(root),
        slug = (this.variantName || "codeship-icon")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      if (this.exportTarget === "png") {
        const image = new Image(),
          url = URL.createObjectURL(
            new Blob([source], { type: "image/svg+xml" }),
          );
        try {
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new Error("SVG could not be rasterized."));
            image.src = url;
          });
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = this.options().size * 3;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is unavailable.");
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((b) =>
              b ? resolve(b) : reject(new Error("PNG export failed.")),
            ),
          );
          download(await blob.arrayBuffer(), slug + ".png", "image/png");
        } finally {
          URL.revokeObjectURL(url);
        }
      } else if (this.exportTarget === "css")
        download(
          `.custom-icon { display:inline-block; width:${root.attributes.width}px; height:${root.attributes.height}px; background:center / contain no-repeat url("data:image/svg+xml,${encodeURIComponent(source)}"); }`,
          slug + ".css",
          "text/css",
        );
      else if (this.exportTarget === "react" || this.exportTarget === "angular")
        download(
          iconComponent(root, this.exportTarget),
          slug + (this.exportTarget === "react" ? ".tsx" : ".component.ts"),
          "text/plain",
        );
      else
        download(
          source,
          slug + (this.exportTarget === "html" ? ".html" : ".svg"),
          this.exportTarget === "html" ? "text/html" : "image/svg+xml",
        );
      this.notice.set("Icon downloaded.");
    } catch (error) {
      this.error.set(String(error));
    }
  }
}

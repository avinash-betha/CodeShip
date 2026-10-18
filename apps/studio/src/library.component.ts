import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { EditorStore } from "../../../packages/editor-core/store";
import {
  components,
  primitives,
  templates,
  baseCss,
  type LibraryEntry,
} from "../../../packages/component-registry";
import {
  walk,
  createProject,
  type ElementNode,
} from "../../../packages/document-model";
import { DomSanitizer } from "@angular/platform-browser";
import { canvasDocument } from "../../../packages/codegen-core";
import { IconComponent } from "./ui/icon.component";
@Component({
  selector: "cs-library",
  imports: [FormsModule, IconComponent],
  templateUrl: "./library.component.html",
})
export class LibraryComponent {
  readonly store = inject(EditorStore);
  private readonly sanitizer = inject(DomSanitizer);
  readonly preview = signal<{ entry: LibraryEntry; screen: boolean } | null>(
    null,
  );
  readonly previewWidth = signal(375);
  readonly previewSource = computed(() => {
    const selected = this.preview();
    if (!selected) return null;
    const p = createProject(selected.entry.name),
      content = selected.entry.create();
    p.pages[0].root = content.root;
    p.pages[0].css = baseCss + "\n" + content.css;
    return this.sanitizer.bypassSecurityTrustHtml(canvasDocument(p));
  });
  insertPreview() {
    const selected = this.preview();
    if (selected) this.store.loadEntry(selected.entry, selected.screen);
    this.preview.set(null);
  }
  readonly tab = signal("insert");
  readonly search = signal("");
  readonly category = signal("All");
  readonly componentCategory = signal("All");
  readonly screenCategory = signal("All");
  readonly componentCategories = [
    "All",
    ...new Set(components.map((c) => c.category)),
  ];
  readonly screenCategories = [
    "All",
    ...new Set(templates.map((c) => c.category)),
  ];
  readonly filteredComponents = computed(() =>
    components.filter(
      (c) =>
        (this.componentCategory() === "All" ||
          c.category === this.componentCategory()) &&
        this.matches(c.name + " " + c.description),
    ),
  );
  readonly filteredTemplates = computed(() =>
    templates.filter(
      (c) =>
        (this.screenCategory() === "All" ||
          c.category === this.screenCategory()) &&
        this.matches(c.name + " " + c.description),
    ),
  );
  readonly primitives = primitives;
  readonly components = components;
  readonly templates = templates;
  readonly categories = [
    "All",
    "Layout",
    "Text",
    "Forms",
    "Media",
    "Semantic",
    "Content",
  ];
  readonly filtered = computed(() =>
    primitives.filter(
      (p) =>
        (this.category() === "All" || p.category === this.category()) &&
        p.name.toLowerCase().includes(this.search().toLowerCase()),
    ),
  );
  readonly layers = computed(() => {
    const nodes: { node: ElementNode; depth: number }[] = [];
    walk(this.store.page().root, (node, _p, depth) =>
      nodes.push({ node, depth }),
    );
    return nodes;
  });
  readonly matches = (text: string) =>
    text.toLowerCase().includes(this.search().toLowerCase());
  drag(event: DragEvent, kind: string, id: string): void {
    event.dataTransfer?.setData(
      "application/codeship",
      JSON.stringify({ kind, id }),
    );
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "copyMove";
  }
  drop(event: DragEvent, target: string): void {
    event.preventDefault();
    try {
      const data = JSON.parse(
        event.dataTransfer?.getData("application/codeship") ?? "{}",
      ) as { kind: string; id: string };
      if (data.kind === "move") this.store.move(data.id, target);
    } catch (error) {
      this.store.fail(error);
    }
  }
  removeAsset(id: string): void {
    this.store.transact("Remove asset", (p) => {
      p.assets = p.assets.filter((a) => a.id !== id);
    });
  }
  async upload(event: Event): Promise<void> {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    for (const file of files) {
      if (
        !/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type) ||
        file.size > 5_000_000
      ) {
        this.store.notify("Choose a PNG, JPEG, WebP, GIF, or AVIF under 5 MB.");
        continue;
      }
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      this.store.transact("Add asset", (p) => {
        p.assets.push({
          id: "asset-" + crypto.randomUUID(),
          name: file.name,
          type: file.type,
          url,
        });
      });
    }
    (event.target as HTMLInputElement).value = "";
  }
}

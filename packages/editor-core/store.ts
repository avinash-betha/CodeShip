import {
  Injectable,
  InjectionToken,
  inject,
  computed,
  effect,
  signal,
} from "@angular/core";
import {
  applyOperation,
  canContain,
  clone,
  createProject,
  currentPage,
  duplicateNode,
  element,
  findNode,
  findParent,
  History,
  type ElementNode,
  type Operation,
  type Project,
  uid,
  walk,
} from "../document-model";
import {
  baseCss,
  demoProject,
  primitive,
  type LibraryEntry,
} from "../component-registry";
import { placeButtonIcon, type IconPlacement } from "./icon-placement";
import {
  assertSafeCss,
  declarations,
  mergeClonedStyles,
  selectorFor,
  setDeclarations,
} from "../css-engine";
import { IndexedDbRepository, type ProjectRepository } from "../persistence";
import { DesktopProjectRepository } from "../persistence/desktop";
import { desktop } from "../desktop-bridge";
import { parseProject, safeAttribute, validateTree } from "../validation";
import { type Recommendation, applyRecommendation } from "../responsive-engine";
import { upgradeTemplateStyles } from "../component-registry/template-styles";
export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>(
  "CodeShip project repository",
  {
    providedIn: "root",
    factory: () =>
      desktop() ? new DesktopProjectRepository() : new IndexedDbRepository(),
  },
);
@Injectable({ providedIn: "root" })
export class EditorStore {
  readonly project = signal<Project>(demoProject());
  readonly selected = signal<string[]>([]);
  readonly page = computed(() => currentPage(this.project()));
  readonly node = computed(() =>
    findNode(this.page().root, this.selected()[0] ?? ""),
  );
  readonly diagnostics = computed(() => validateTree(this.page().root));
  readonly viewport = signal(1200);
  readonly viewportHeight = signal(1040);
  readonly zoom = signal(75);
  readonly mode = signal<"edit" | "preview">("edit");
  readonly pseudo = signal("");
  readonly query = signal("");
  readonly recommendations = signal<Recommendation[]>([]);
  readonly previewRecommendation = signal<Recommendation | null>(null);
  readonly busy = signal(false);
  readonly saved = signal<"saved" | "saving" | "unsaved" | "error">("saving");
  readonly message = signal("");
  readonly history = new History<Project>();
  readonly revision = signal(0);
  readonly activity = signal({ name: "", serial: 0 });
  recordActivity(name: string): void {
    this.activity.update((a) => ({ name, serial: a.serial + 1 }));
  }
  readonly canUndo = computed(() => {
    this.revision();
    return this.history.canUndo;
  });
  readonly canRedo = computed(() => {
    this.revision();
    return this.history.canRedo;
  });
  readonly style = computed(() => {
    const n = this.node();
    return n
      ? declarations(
          this.page().css,
          selectorFor(n.id) + this.pseudo(),
          this.query(),
        )
      : {};
  });
  readonly repository = inject(PROJECT_REPOSITORY);
  private clipboard?: { node: ElementNode; css: string };
  private ready = false;
  private timer?: ReturnType<typeof setTimeout>;
  private noticeTimer?: ReturnType<typeof setTimeout>;
  constructor() {
    effect(() => {
      const p = this.project();
      if (!this.ready) return;
      this.saved.set("unsaved");
      clearTimeout(this.timer);
      this.timer = setTimeout(() => void this.persist(p), 700);
    });
    void this.restore();
  }
  private async restore(): Promise<void> {
    try {
      const recent = localStorage.getItem("codeship-recent");
      const p = recent ? await this.repository.get(recent) : undefined;
      if (p) {
        this.assertProject(p);
        const upgraded = upgradeTemplateStyles(p);
        this.project.set(upgraded);
        if (JSON.stringify(upgraded) !== JSON.stringify(p))
          await this.repository.save(upgraded);
      } else {
        await this.repository.save(this.project());
        localStorage.setItem("codeship-recent", this.project().id);
      }
      this.ready = true;
      this.saved.set("saved");
    } catch (error) {
      this.ready = true;
      this.saved.set("error");
      this.fail(error);
    }
  }
  private assertProject(p: Project): void {
    parseProject(JSON.stringify(p));
    p.pages.forEach((page) => assertSafeCss(page.css));
  }
  notify(message: string): void {
    this.message.set(message);
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.message.set(""), 4500);
  }
  fail(error: unknown): void {
    this.notify(error instanceof Error ? error.message : String(error));
  }
  transact(label: string, fn: (p: Project) => void): boolean {
    try {
      const before = this.project(),
        next = clone(before);
      fn(next);
      next.updatedAt = new Date().toISOString();
      this.assertProject(next);
      this.history.record(before);
      this.project.set(next);
      this.revision.update((n) => n + 1);
      this.saved.set("unsaved");
      this.recordActivity(label);
      return true;
    } catch (error) {
      this.fail(
        new Error(
          `${label}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return false;
    }
  }
  operate(op: Operation): boolean {
    return this.transact(op.type, (p) => {
      const page = currentPage(p);
      page.root = applyOperation(page.root, op);
      if (op.type === "insert") {
        const parent = findNode(page.root, op.parentId);
        if (parent?.attributes["data-cs-layout"] === "freeform")
          page.css = setDeclarations(
            page.css,
            selectorFor(op.node.id),
            {
              position: "absolute",
              left: "24px",
              top: 24 + (parent.children.length - 1) * 24 + "px",
            },
            this.query(),
          );
      }
    });
  }
  select(id: string, add = false): void {
    if (!findNode(this.page().root, id)) return;
    this.selected.update((ids) =>
      add
        ? ids.includes(id)
          ? ids.filter((s) => s !== id)
          : [...ids, id]
        : [id],
    );
  }
  insert(
    tag: string,
    text = "",
    attributes: Record<string, string> = {},
    parentId?: string,
    index?: number,
  ): void {
    const selected = this.node(),
      n = primitive(tag, text, attributes),
      root = this.page().root;
    let parent = parentId ? findNode(root, parentId) : selected;
    if (!parentId) {
      if (
        parent &&
        [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "span",
          "button",
          "a",
          "label",
          "strong",
          "em",
          "small",
          "code",
          "pre",
          "summary",
        ].includes(parent.tag)
      )
        parent = findParent(root, parent.id);
      while (parent && !canContain(parent, n))
        parent = findParent(root, parent.id);
      parent ??= root;
    }
    if (!parent) return;
    if (this.operate({ type: "insert", parentId: parent.id, node: n, index })) {
      this.select(n.id);
      this.recordActivity("insert:" + tag);
    }
  }
  update(
    changes: Partial<
      Pick<ElementNode, "name" | "tag" | "text" | "attributes" | "interactions">
    >,
  ): void {
    const n = this.node();
    if (!n) return;
    if (
      changes.attributes &&
      Object.entries(changes.attributes).some(([k, v]) => !safeAttribute(k, v))
    ) {
      this.fail(new Error("Unsafe or invalid HTML attribute."));
      return;
    }
    this.operate({ type: "update", id: n.id, changes });
  }
  setAttribute(key: string, value: string): void {
    const n = this.node();
    if (!n) return;
    const a = { ...n.attributes };
    if (value === "") delete a[key];
    else a[key] = value;
    this.update({ attributes: a });
  }
  setStyle(property: string, value: string): void {
    const ids = this.selected();
    this.transact("Update style", (p) => {
      const page = currentPage(p);
      for (const id of ids)
        page.css = setDeclarations(
          page.css,
          selectorFor(id) + this.pseudo(),
          { [property]: value },
          this.query(),
        );
    });
  }
  setCss(css: string): boolean {
    return this.transact("Apply CSS", (p) => {
      assertSafeCss(css);
      currentPage(p).css = css;
    });
  }
  undo(): void {
    const p = this.history.undo(this.project());
    if (p) {
      this.project.set(p);
      this.revision.update((n) => n + 1);
      this.selected.update((ids) =>
        ids.filter((id) => !!findNode(currentPage(p).root, id)),
      );
    }
  }
  redo(): void {
    const p = this.history.redo(this.project());
    if (p) {
      this.project.set(p);
      this.revision.update((n) => n + 1);
      this.selected.update((ids) =>
        ids.filter((id) => !!findNode(currentPage(p).root, id)),
      );
    }
  }
  remove(): void {
    const ids = this.selected();
    this.transact("Delete", (p) => {
      const page = currentPage(p);
      for (const id of ids)
        if (findParent(page.root, id))
          page.root = applyOperation(page.root, { type: "remove", id });
    });
    this.selected.set([]);
  }
  copy(): void {
    const n = this.node();
    if (n) {
      this.clipboard = { node: clone(n), css: this.page().css };
      this.notify("Copied to the studio clipboard.");
    }
  }
  paste(): void {
    if (!this.clipboard) return;
    const source = this.clipboard.node,
      node = duplicateNode(source),
      ids = new Map<string, string>();
    const a: ElementNode[] = [],
      b: ElementNode[] = [];
    walk(source, (n) => a.push(n));
    walk(node, (n) => b.push(n));
    a.forEach((n, i) => ids.set(n.id, b[i].id));
    const selected = this.node();
    const parent =
      selected && canContain(selected, node) ? selected : this.page().root;
    this.transact("Paste", (p) => {
      const page = currentPage(p);
      page.root = applyOperation(page.root, {
        type: "insert",
        parentId: parent.id,
        node,
      });
      page.css = mergeClonedStyles(page.css, this.clipboard!.css, ids);
    });
    this.select(node.id);
  }
  duplicate(): void {
    const n = this.node();
    if (!n || n.id === this.page().root.id) return;
    this.copy();
    const parent = findParent(this.page().root, n.id);
    this.selected.set(parent ? [parent.id] : []);
    this.paste();
  }
  move(id: string, parentId: string, index?: number): void {
    if (
      findNode(this.page().root, id)?.tag === "svg" &&
      ["button", "a"].includes(findNode(this.page().root, parentId)?.tag ?? "")
    ) {
      this.moveIconToButton(
        id,
        parentId,
        index === 0 ? "before-text" : "after-text",
      );
      return;
    }
    this.operate({ type: "move", id, parentId, index });
  }
  moveIconToButton(
    iconId: string,
    buttonId: string,
    placement: IconPlacement = "before-text",
  ): void {
    if (
      this.transact("Place button icon", (project) => {
        const icon = findNode(currentPage(project).root, iconId);
        if (!icon) throw new Error("Select an icon on this page.");
        placeButtonIcon(project, icon, buttonId, placement);
      })
    )
      this.select(iconId);
  }
  reorder(delta: number): void {
    const n = this.node();
    if (!n) return;
    const parent = findParent(this.page().root, n.id);
    if (!parent) return;
    const index = parent.children.findIndex((c) => c.id === n.id);
    this.move(
      n.id,
      parent.id,
      Math.max(0, Math.min(parent.children.length - 1, index + delta)),
    );
  }
  group(): void {
    this.operate({ type: "group", ids: this.selected() });
  }
  ungroup(): void {
    const selected = this.node();
    if (!selected?.children.length) return;
    const parent = findParent(this.page().root, selected.id);
    if (
      !parent ||
      selected.children.some((child) => !canContain(parent, child))
    )
      return;
    const ids = selected.children.map((n) => n.id);
    if (
      this.transact("Ungroup", (p) => {
        const root = currentPage(p).root,
          group = findNode(root, selected.id)!,
          owner = findParent(root, selected.id)!;
        const index = owner.children.findIndex((n) => n.id === group.id);
        owner.children.splice(index, 1, ...group.children);
      })
    )
      this.selected.set(ids);
  }
  setStyles(values: Record<string, string>, label = "Update style"): void {
    this.transact(label, (p) => {
      const page = currentPage(p);
      for (const id of this.selected())
        page.css = setDeclarations(
          page.css,
          selectorFor(id) + this.pseudo(),
          values,
          this.query(),
        );
    });
  }
  loadEntry(entry: LibraryEntry, replace = false, index?: number): void {
    const { root, css } = entry.create();
    this.transact(`Insert ${entry.name}`, (p) => {
      const page = currentPage(p);
      if (replace) {
        page.root = root;
        page.css = baseCss + "\n" + css;
      } else {
        const selected = this.node();
        const parent =
          selected && canContain(selected, root) ? selected : page.root;
        page.root = applyOperation(page.root, {
          type: "insert",
          parentId: parent.id,
          node: root,
          index,
        });
        if (!page.css.includes(css)) page.css += "\n" + css;
        if (parent.attributes["data-cs-layout"] === "freeform")
          page.css = setDeclarations(
            page.css,
            selectorFor(root.id),
            { position: "absolute", left: "24px", top: "24px" },
            this.query(),
          );
      }
    });
    this.select(root.id);
  }
  saveBlock(name: string): void {
    const n = this.node();
    if (!n) return;
    this.transact("Save block", (p) => {
      p.components.push({
        id: uid(),
        name,
        root: clone(n),
        css: this.page().css,
      });
    });
    this.notify("Reusable block saved to this project.");
  }
  insertBlock(id: string): void {
    const def = this.project().components.find((c) => c.id === id);
    if (!def) return;
    this.clipboard = {
      node: { ...def.root, componentId: def.id },
      css: def.css,
    };
    this.paste();
  }
  async persist(project = this.project()): Promise<boolean> {
    this.saved.set("saving");
    try {
      await this.repository.save(project);
      if (this.project() === project) {
        localStorage.setItem("codeship-recent", project.id);
        this.saved.set("saved");
      }
      return true;
    } catch (error) {
      this.saved.set("error");
      this.fail(error);
      return false;
    }
  }
  async open(p: Project, saveCurrent = true): Promise<boolean> {
    try {
      clearTimeout(this.timer);
      this.assertProject(p);
      if (saveCurrent && !(await this.persist()))
        throw new Error(
          "The current project could not be saved. Save it or use Save as before switching.",
        );
      this.history.clear();
      this.project.set(upgradeTemplateStyles(p));
      this.selected.set([]);
      this.recommendations.set([]);
      this.revision.update((n) => n + 1);
      return await this.persist();
    } catch (error) {
      this.fail(error);
      return false;
    }
  }
  async newProject(name: string): Promise<void> {
    const p = createProject(name);
    p.pages[0].css = baseCss;
    if (await this.open(p)) this.recordActivity("new-project");
  }
  async duplicateProject(p: Project): Promise<void> {
    const copy = clone(p);
    copy.id = uid();
    copy.name += " (copy)";
    copy.createdAt = copy.updatedAt = new Date().toISOString();
    await this.repository.save(copy);
  }
  async deleteProject(id: string): Promise<void> {
    clearTimeout(this.timer);
    await this.persist();
    await this.repository.remove(id);
    if (this.project().id === id) {
      const next = createProject("Untitled project");
      next.pages[0].css = baseCss;
      this.history.clear();
      this.project.set(next);
      this.selected.set([]);
      this.revision.update((n) => n + 1);
      await this.persist();
    }
  }
  rename(name: string): void {
    if (name.trim())
      this.transact("Rename project", (p) => {
        p.name = name.trim();
      });
  }
  addPage(name: string): void {
    const id = uid();
    this.transact("Add page", (p) => {
      p.pages.push({
        id,
        name,
        path: "/" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        root: element("main"),
        css: baseCss,
      });
      p.activePageId = id;
    });
    this.selected.set([]);
  }
  switchPage(id: string): void {
    this.transact("Switch page", (p) => {
      p.activePageId = id;
    });
    this.selected.set([]);
    this.recommendations.set([]);
  }
  applySuggestion(r: Recommendation): void {
    this.transact("Apply responsive suggestion", (p) => {
      const page = currentPage(p);
      page.css = applyRecommendation(page.css, r);
    });
    this.recommendations.update((list) =>
      list.map((i) => (i.id === r.id ? { ...i, status: "applied" } : i)),
    );
    this.previewRecommendation.set(null);
  }
  rejectSuggestion(id: string): void {
    this.recommendations.update((list) =>
      list.map((i) => (i.id === id ? { ...i, status: "rejected" } : i)),
    );
    this.previewRecommendation.set(null);
  }
}

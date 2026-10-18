export const SCHEMA_VERSION = 1;
export type Styles = Record<string, string>;
export type Interaction = {
  event:
    | "click"
    | "submit"
    | "input"
    | "change"
    | "dragstart"
    | "dragover"
    | "drop"
    | "pointerdown"
    | "pointermove"
    | "pointerup"
    | "pointercancel";
  action:
    | "toggle-class"
    | "navigate"
    | "set-text"
    | "filter"
    | "sort"
    | "paginate"
    | "select-panel"
    | "dialog"
    | "add-item"
    | "drag-reorder"
    | "range-output"
    | "show-message";
  target: string;
  value: string;
};
export interface ElementNode {
  id: string;
  tag: string;
  name: string;
  attributes: Record<string, string>;
  text: string;
  children: ElementNode[];
  componentId?: string;
  interactions: Interaction[];
}
export interface Page {
  id: string;
  name: string;
  path: string;
  root: ElementNode;
  css: string;
}
export interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
}
export interface ComponentDefinition {
  id: string;
  name: string;
  root: ElementNode;
  css: string;
}
export interface Project {
  schemaVersion: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
  activePageId: string;
  tokens: Record<string, string>;
  assets: Asset[];
  components: ComponentDefinition[];
  metadata: { description: string; author: string };
}
export const uid = () =>
  "cs-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12);
export const clone = <T>(value: T): T => structuredClone(value);
export function element(
  tag: string,
  text = "",
  attributes: Record<string, string> = {},
  children: ElementNode[] = [],
): ElementNode {
  return {
    id: uid(),
    tag,
    name: tag === "div" ? "Container" : tag,
    attributes,
    text,
    children,
    interactions: [],
  };
}
export function createProject(name = "Untitled project"): Project {
  const root = element("main");
  root.name = "Page";
  const page: Page = { id: uid(), name: "Home", path: "/", root, css: "" };
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid(),
    name,
    createdAt: now,
    updatedAt: now,
    pages: [page],
    activePageId: page.id,
    tokens: { "--accent": "#b6ed9c" },
    assets: [],
    components: [],
    metadata: { description: "", author: "" },
  };
}
export const currentPage = (p: Project): Page =>
  p.pages.find((page) => page.id === p.activePageId) ?? p.pages[0];
export function walk(
  root: ElementNode,
  fn: (node: ElementNode, parent: ElementNode | null, depth: number) => void,
  parent: ElementNode | null = null,
  depth = 0,
): void {
  fn(root, parent, depth);
  for (const child of root.children) walk(child, fn, root, depth + 1);
}
export function findNode(
  root: ElementNode,
  id: string,
): ElementNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}
export function findParent(
  root: ElementNode,
  id: string,
): ElementNode | undefined {
  if (root.children.some((n) => n.id === id)) return root;
  for (const child of root.children) {
    const found = findParent(child, id);
    if (found) return found;
  }
  return undefined;
}
export const voidTags = new Set(
  "area base br col embed hr img input link meta param source track wbr".split(
    " ",
  ),
);
export const blockedTags = new Set(
  "script iframe object embed base link meta style".split(" "),
);
export function validTag(tag: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(tag) && !blockedTags.has(tag);
}
export function svgTagName(tag: string): string {
  const aliases: Record<string, string> = {
    lineargradient: "linearGradient",
    radialgradient: "radialGradient",
    clippath: "clipPath",
    textpath: "textPath",
    foreignobject: "foreignObject",
    fegaussianblur: "feGaussianBlur",
    fecolormatrix: "feColorMatrix",
    feoffset: "feOffset",
    femerge: "feMerge",
    femergenode: "feMergeNode",
  };
  return aliases[tag] ?? tag;
}
export function canContain(parent: ElementNode, child?: ElementNode): boolean {
  if (voidTags.has(parent.tag) || ["textarea", "option"].includes(parent.tag))
    return false;
  if (!child) return true;
  // SVG and its groups use the SVG namespace; HTML controls must be siblings.
  if (["svg", "g"].includes(parent.tag))
    return [
      "svg",
      "g",
      "path",
      "circle",
      "ellipse",
      "rect",
      "line",
      "polyline",
      "polygon",
      "defs",
      "title",
      "desc",
      "text",
      "use",
      "linearGradient",
      "radialGradient",
      "clipPath",
      "mask",
      "filter",
    ].includes(svgTagName(child.tag));
  if (parent.tag === "select")
    return ["option", "optgroup"].includes(child.tag);
  if (parent.tag === "optgroup" || parent.tag === "datalist")
    return child.tag === "option";
  if (["ul", "ol", "menu"].includes(parent.tag)) return child.tag === "li";
  if (parent.tag === "table")
    return ["caption", "colgroup", "thead", "tbody", "tfoot", "tr"].includes(
      child.tag,
    );
  if (["thead", "tbody", "tfoot"].includes(parent.tag))
    return child.tag === "tr";
  if (parent.tag === "tr") return ["td", "th"].includes(child.tag);
  if (parent.tag === "colgroup") return child.tag === "col";
  if (
    ["p", "h1", "h2", "h3", "h4", "span", "button", "a", "label"].includes(
      parent.tag,
    ) &&
    ["div", "section", "main", "article", "p", "h1", "form", "table"].includes(
      child.tag,
    )
  )
    return false;
  if (child.tag === "li" && !["ul", "ol", "menu"].includes(parent.tag))
    return false;
  if (
    child.tag === "tr" &&
    !["table", "tbody", "thead", "tfoot"].includes(parent.tag)
  )
    return false;
  if (["td", "th"].includes(child.tag) && parent.tag !== "tr") return false;
  if (parent.tag === "button" && ["button", "input", "a"].includes(child.tag))
    return false;
  return true;
}
export function duplicateNode(node: ElementNode): ElementNode {
  const copy = clone(node);
  const ids = new Map<string, string>();
  const vectorIds = new Map<string, string>();
  walk(copy, (n) => {
    const id = uid();
    ids.set(n.id, id);
    n.id = id;
    if (
      n.attributes.id &&
      [
        "lineargradient",
        "radialgradient",
        "clippath",
        "mask",
        "pattern",
        "filter",
      ].includes(n.tag)
    ) {
      const replacement = uid();
      vectorIds.set(n.attributes.id, replacement);
      n.attributes.id = replacement;
    } else delete n.attributes["id"];
  });
  walk(copy, (n) => {
    for (const [key, value] of Object.entries(n.attributes)) {
      const ref = value.match(/^url\(#([\w-]+)\)$/);
      if (ref && vectorIds.has(ref[1]))
        n.attributes[key] = `url(#${vectorIds.get(ref[1])})`;
    }
    for (const interaction of n.interactions)
      interaction.target = ids.get(interaction.target) ?? interaction.target;
  });
  return copy;
}
export type Operation =
  | { type: "insert"; parentId: string; node: ElementNode; index?: number }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; parentId: string; index?: number }
  | {
      type: "update";
      id: string;
      changes: Partial<
        Pick<
          ElementNode,
          "tag" | "name" | "text" | "attributes" | "interactions"
        >
      >;
    }
  | { type: "group"; ids: string[] };
export function applyOperation(root: ElementNode, op: Operation): ElementNode {
  const next = clone(root);
  if (op.type === "insert") {
    const parent = findNode(next, op.parentId);
    if (!parent || !canContain(parent, op.node))
      throw new Error("This element cannot be inserted into that container.");
    walk(op.node, (n) => {
      if (findNode(next, n.id))
        throw new Error("Element identifiers must be unique.");
    });
    parent.children.splice(
      op.index ?? parent.children.length,
      0,
      clone(op.node),
    );
  } else if (op.type === "remove") {
    const parent = findParent(next, op.id);
    if (!parent) throw new Error("The page root cannot be removed.");
    parent.children = parent.children.filter((n) => n.id !== op.id);
  } else if (op.type === "move") {
    const node = findNode(next, op.id),
      parent = findNode(next, op.parentId),
      old = findParent(next, op.id);
    if (
      !node ||
      !parent ||
      !old ||
      findNode(node, parent.id) ||
      !canContain(parent, node)
    )
      throw new Error(
        "Invalid move: choose a compatible container outside this element.",
      );
    old.children = old.children.filter((n) => n.id !== op.id);
    parent.children.splice(op.index ?? parent.children.length, 0, node);
  } else if (op.type === "update") {
    const node = findNode(next, op.id);
    if (!node) throw new Error("Element no longer exists.");
    if (op.changes.tag && !validTag(op.changes.tag))
      throw new Error("Enter a safe HTML or custom element tag.");
    Object.assign(node, clone(op.changes));
    if (voidTags.has(node.tag) && node.children.length)
      throw new Error("Void elements cannot have children.");
  } else {
    const ids = [...new Set(op.ids)];
    if (!ids.length) throw new Error("Select sibling elements to group.");
    const parent = findParent(next, ids[0]);
    if (!parent || ids.some((id) => findParent(next, id)?.id !== parent.id))
      throw new Error("Grouped elements must share a parent.");
    const nodes = parent.children.filter((n) => ids.includes(n.id));
    const group = element("div", "", {}, nodes);
    group.name = "Group";
    const at = parent.children.findIndex((n) => ids.includes(n.id));
    parent.children = parent.children.filter((n) => !ids.includes(n.id));
    parent.children.splice(at, 0, group);
  }
  return next;
}
export class History<T> {
  private past: T[] = [];
  private future: T[] = [];
  constructor(private limit = 80) {}
  get canUndo(): boolean {
    return this.past.length > 0;
  }
  get canRedo(): boolean {
    return this.future.length > 0;
  }
  record(previous: T): void {
    this.past.push(clone(previous));
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }
  undo(current: T): T | undefined {
    const p = this.past.pop();
    if (p !== undefined) this.future.push(clone(current));
    return p;
  }
  redo(current: T): T | undefined {
    const p = this.future.pop();
    if (p !== undefined) this.past.push(clone(current));
    return p;
  }
  clear(): void {
    this.past = [];
    this.future = [];
  }
}

import {
  blockedTags,
  canContain,
  type ElementNode,
  type Project,
  SCHEMA_VERSION,
  walk,
  validTag,
} from "../document-model";
import { migrateProject } from "../document-model/migrations";
export interface Diagnostic {
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
}
const urlAttributes = new Set([
  "href",
  "src",
  "action",
  "poster",
  "xlink:href",
  "formaction",
]);
const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);
const safeIdentifier = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z][\w-]{0,100}$/.test(value);
export function safeUrl(value: string, image = false): boolean {
  const clean = [...value]
    .filter((character) => character.charCodeAt(0) > 32)
    .join("");
  if (/^(javascript|vbscript|file):/i.test(clean) || clean.startsWith("//"))
    return false;
  if (/^data:/i.test(clean))
    return (
      image &&
      /^data:image\/(png|jpeg|webp|gif|avif);base64,[a-z0-9+/=]+$/i.test(clean)
    );
  return (
    !/^[a-z][a-z0-9+.-]*:/i.test(clean) ||
    /^(https?:|mailto:|tel:|blob:)/i.test(clean)
  );
}
export function safeAttribute(name: string, value: string): boolean {
  if (
    !/^[a-zA-Z_:][\w:.-]*$/.test(name) ||
    /^on/i.test(name) ||
    ["srcdoc", "style", "xmlns"].includes(name.toLowerCase()) ||
    forbiddenKeys.has(name)
  )
    return false;
  if (name.toLowerCase() === "srcset")
    return value
      .split(",")
      .every((v) => safeUrl(v.trim().split(/\s+/)[0], true));
  return (
    !urlAttributes.has(name.toLowerCase()) ||
    safeUrl(value, ["src", "poster"].includes(name.toLowerCase()))
  );
}
export function validateTree(root: ElementNode): Diagnostic[] {
  const diagnostics: Diagnostic[] = [],
    ids = new Set<string>(),
    elementIds = new Set<string>();
  const htmlIds = new Set<string>();
  walk(root, (n) => {
    if (n.attributes.id) htmlIds.add(n.attributes.id);
  });
  walk(root, (node, parent) => {
    const push = (
      message: string,
      severity: Diagnostic["severity"] = "warning",
    ) => diagnostics.push({ severity, message, nodeId: node.id });
    if (elementIds.has(node.id))
      push("Duplicate internal element identifier.", "error");
    elementIds.add(node.id);
    if (!validTag(node.tag) || blockedTags.has(node.tag))
      push(`Unsafe element: ${node.tag}`, "error");
    if (node.attributes.id) {
      if (ids.has(node.attributes.id))
        push(`Duplicate HTML id: ${node.attributes.id}`, "error");
      ids.add(node.attributes.id);
    }
    for (const [name, value] of Object.entries(node.attributes))
      if (!safeAttribute(name, value))
        push(`Unsafe attribute ${name} is not permitted.`, "error");
    if (parent && !canContain(parent, node))
      push(`Invalid nesting: ${node.tag} inside ${parent.tag}.`, "error");
    if (node.tag === "img" && !("alt" in node.attributes))
      push("Add alternative text to this image.");
    if (
      ["input", "textarea", "select"].includes(node.tag) &&
      node.attributes.type !== "hidden" &&
      !node.attributes["aria-label"] &&
      !node.attributes["aria-labelledby"]
    ) {
      let hasLabel = false;
      walk(root, (n) => {
        if (
          n.tag === "label" &&
          ((n.attributes.for === node.attributes.id && !!node.attributes.id) ||
            n.children.some((c) => c.id === node.id))
        )
          hasLabel = true;
      });
      if (!hasLabel) push("Form control needs a label or aria-label.");
    }
    if (node.tag === "a" && !node.attributes.href)
      push("Link needs an href destination.");
    if (
      node.attributes["aria-labelledby"]
        ?.split(/\s+/)
        .some((id) => !htmlIds.has(id))
    )
      push("aria-labelledby references a missing ID.");
  });
  return diagnostics;
}
export function parseProject(input: string): Project {
  if (input.length > 25_000_000)
    throw new Error("Project exceeds the 25 MB import limit.");
  const value: unknown = JSON.parse(input, (key, val: unknown) => {
    if (forbiddenKeys.has(key)) throw new Error("Unsafe project property.");
    return val;
  });
  if (!value || typeof value !== "object")
    throw new Error("Expected a project object.");
  const p = migrateProject(value) as Project;
  if (p.schemaVersion !== SCHEMA_VERSION)
    throw new Error(
      `Unsupported schema version ${String(p.schemaVersion)}. Supported: ${SCHEMA_VERSION}.`,
    );
  if (
    !safeIdentifier(p.id) ||
    typeof p.name !== "string" ||
    !Array.isArray(p.pages) ||
    !p.pages.length ||
    p.pages.length > 50
  )
    throw new Error("Project is missing valid metadata or pages.");
  let count = 0;
  const verifyNode = (n: ElementNode, depth: number): void => {
    if (depth > 100 || ++count > 10000)
      throw new Error("Project tree exceeds safe complexity limits.");
    if (
      !n ||
      typeof n !== "object" ||
      !safeIdentifier(n.id) ||
      typeof n.name !== "string" ||
      !validTag(n.tag) ||
      typeof n.text !== "string" ||
      !Array.isArray(n.children) ||
      !n.attributes ||
      typeof n.attributes !== "object" ||
      !Array.isArray(n.interactions)
    )
      throw new Error("Invalid element shape.");
    for (const [key, val] of Object.entries(n.attributes))
      if (typeof val !== "string" || !safeAttribute(key, val))
        throw new Error(`Unsafe imported attribute: ${key}`);
    for (const i of n.interactions)
      if (
        ![
          "click",
          "submit",
          "input",
          "change",
          "dragstart",
          "dragover",
          "drop",
          "pointerdown", "pointermove", "pointerup", "pointercancel",
        ].includes(i.event) ||
        ![
          "toggle-class",
          "navigate",
          "set-text",
          "filter",
          "sort",
          "paginate",
          "select-panel",
          "dialog",
          "add-item",
          "drag-reorder",
          "range-output",
          "show-message",
        ].includes(i.action) ||
        typeof i.target !== "string" ||
        typeof i.value !== "string" ||
        (i.action === "navigate" && !safeUrl(i.value)) ||
        (i.action === "toggle-class" && (!i.value || /\s/.test(i.value)))
      )
        throw new Error("Unsupported or unsafe interaction.");
    n.children.forEach((c) => verifyNode(c, depth + 1));
  };
  const pageIds = new Set<string>();
  for (const page of p.pages) {
    if (
      !safeIdentifier(page.id) ||
      typeof page.name !== "string" ||
      typeof page.path !== "string" ||
      typeof page.css !== "string" ||
      pageIds.has(page.id)
    )
      throw new Error("Invalid or duplicate page.");
    pageIds.add(page.id);
    verifyNode(page.root, 0);
    if (validateTree(page.root).some((d) => d.severity === "error"))
      throw new Error(
        "Project contains invalid HTML structure or duplicate IDs.",
      );
  }
  if (!pageIds.has(p.activePageId)) p.activePageId = p.pages[0].id;
  if (
    !Array.isArray(p.assets) ||
    !Array.isArray(p.components) ||
    !p.tokens ||
    typeof p.tokens !== "object" ||
    !p.metadata ||
    typeof p.metadata !== "object"
  )
    throw new Error("Invalid project collections.");
  for (const asset of p.assets)
    if (
      !safeIdentifier(asset.id) ||
      typeof asset.name !== "string" ||
      typeof asset.type !== "string" ||
      typeof asset.url !== "string" ||
      !safeUrl(asset.url, true)
    )
      throw new Error("Unsafe asset.");
  for (const component of p.components) {
    if (
      !safeIdentifier(component.id) ||
      typeof component.name !== "string" ||
      typeof component.css !== "string"
    )
      throw new Error("Invalid reusable component.");
    verifyNode(component.root, 0);
  }
  for (const [k, v] of Object.entries(p.tokens))
    if (!/^--[\w-]+$/.test(k) || typeof v !== "string" || /[;{}<>]/.test(v))
      throw new Error("Invalid design token.");
  return p;
}

import postcss, { type Root, type Rule } from "postcss";
import type { Styles } from "../document-model";
export interface CssResult {
  root?: Root;
  error?: string;
}
export function parseCss(css: string): CssResult {
  try {
    return { root: postcss.parse(css, { from: undefined }) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid CSS" };
  }
}
export function assertSafeCss(css: string): void {
  const normalized = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/\\(.)/g, "$1");
  if (
    /@import\b|expression\s*\(|javascript\s*:|vbscript\s*:|-moz-binding|behavior\s*:|<\/style/i.test(
      normalized,
    )
  )
    throw new Error(
      "CSS imports, executable URLs, and embedded markup are not permitted.",
    );
  if (
    /url\s*\(\s*['"]?\s*(data:(?!image\/(?:png|jpeg|webp|gif|avif);base64)|file:)/i.test(
      normalized,
    )
  )
    throw new Error("Unsafe CSS asset URL.");
  const parsed = parseCss(css);
  if (parsed.error) throw new Error(parsed.error);
}
export const selectorFor = (id: string) => `[data-cs-id="${id}"]`;
export function setDeclarations(
  css: string,
  selector: string,
  styles: Styles,
  context = "",
): string {
  assertSafeCss(css);
  const root = postcss.parse(css, { from: undefined });
  let container: Root | postcss.AtRule = root;
  if (context) {
    const match = /^@(media|container|supports)\s+(.+)$/.exec(context);
    if (!match || /[{};]/.test(match[2]))
      throw new Error("Use a media, container or feature query context.");
    let at: postcss.AtRule | undefined;
    root.each((node) => {
      if (
        node.type === "atrule" &&
        node.name === match[1] &&
        node.params === match[2]
      )
        at = node;
    });
    if (!at) {
      at = postcss.atRule({ name: match[1], params: match[2] });
      root.append(at);
    }
    container = at;
  }
  let rule: Rule | undefined;
  container.each((node) => {
    if (node.type === "rule" && node.selector === selector) rule = node;
  });
  if (!rule) {
    rule = postcss.rule({ selector });
    container.append(rule);
  }
  for (const [prop, value] of Object.entries(styles)) {
    if (!/^(--[\p{L}\p{N}_-]+|-?[a-z][a-z0-9-]*)$/iu.test(prop))
      throw new Error("Invalid CSS property.");
    const trimmed = value.trim();
    const candidate = `a{${prop}:${trimmed || "initial"}}`;
    assertSafeCss(candidate);
    const parsed = postcss.parse(candidate);
    const one = parsed.nodes[0];
    if (
      parsed.nodes.length !== 1 ||
      one.type !== "rule" ||
      one.selector !== "a" ||
      one.nodes.length !== 1 ||
      one.nodes[0].type !== "decl" ||
      one.nodes[0].prop !== prop
    )
      throw new Error("Enter one CSS property value.");
    rule.nodes
      .filter((n) => n.type === "decl" && n.prop === prop)
      .forEach((n) => n.remove());
    if (trimmed && one.nodes[0].type === "decl")
      rule.append(one.nodes[0].clone());
  }
  return root.toString();
}
export function declarations(
  css: string,
  selector: string,
  context = "",
): Styles {
  const result: Styles = {},
    parsed = parseCss(css);
  if (!parsed.root) return result;
  parsed.root.walkRules((rule) => {
    const actualContext =
      rule.parent?.type === "atrule"
        ? `@${rule.parent.name} ${rule.parent.params}`
        : "";
    if (rule.selector === selector && actualContext === context)
      rule.nodes.forEach((d) => {
        if (d.type === "decl") result[d.prop] = d.value;
      });
  });
  return result;
}
export function duplicateStyles(css: string, ids: Map<string, string>): string {
  const root = postcss.parse(css);
  const copies: { rule: Rule; parent: postcss.Container }[] = [];
  root.walkRules((rule) => {
    let selector = rule.selector;
    for (const [from, to] of ids)
      selector = selector.replaceAll(selectorFor(from), selectorFor(to));
    if (selector !== rule.selector && rule.parent)
      copies.push({ rule: rule.clone({ selector }), parent: rule.parent });
  });
  for (const { rule, parent } of copies) parent.append(rule);
  return root.toString();
}
/** Extract a copied tree's scoped rules and merge shared rules without duplicating the entire stylesheet. */
export function mergeClonedStyles(
  targetCss: string,
  sourceCss: string,
  ids: Map<string, string>,
): string {
  const target = postcss.parse(targetCss),
    source = postcss.parse(sourceCss);
  source.walkRules((rule) => {
    let selector = rule.selector,
      matched = false;
    for (const [from, to] of ids) {
      if (selector.includes(selectorFor(from))) {
        matched = true;
        selector = selector.replaceAll(selectorFor(from), selectorFor(to));
      }
    }
    if (rule.selector.includes("[data-cs-id=") && !matched) rule.remove();
    else rule.selector = selector;
  });
  const merge = (
    destination: postcss.Container,
    addition: postcss.Container,
  ): void => {
    for (const node of [...(addition.nodes ?? [])]) {
      if (node.type === "atrule" && node.nodes) {
        if (!node.nodes.length) continue;
        const existing = destination.nodes?.find(
          (n) =>
            n.type === "atrule" &&
            n.name === node.name &&
            n.params === node.params &&
            n.nodes,
        );
        if (existing?.type === "atrule") merge(existing, node);
        else destination.append(node.clone());
      } else if (node.type === "rule") {
        if (
          !destination.nodes?.some(
            (n) => n.type === "rule" && n.selector === node.selector,
          )
        )
          destination.append(node.clone());
      } else if (
        !destination.nodes?.some((n) => n.toString() === node.toString())
      )
        destination.append(node.clone());
    }
  };
  merge(target, source);
  return target.toString();
}
export interface PropertyControl {
  property: string;
  label: string;
  group: string;
  choices?: string[];
  placeholder?: string;
}
export const propertyRegistry: PropertyControl[] = [
  {
    property: "display",
    label: "Display",
    group: "Layout",
    choices: ["", "block", "flex", "grid", "inline", "inline-flex", "none"],
  },
  {
    property: "flex-direction",
    label: "Direction",
    group: "Layout",
    choices: ["", "row", "column", "row-reverse", "column-reverse"],
  },
  {
    property: "justify-content",
    label: "Justify",
    group: "Layout",
    choices: ["", "start", "center", "end", "space-between", "space-around"],
  },
  {
    property: "align-items",
    label: "Align",
    group: "Layout",
    choices: ["", "stretch", "start", "center", "end"],
  },
  {
    property: "flex-wrap",
    label: "Wrap",
    group: "Layout",
    choices: ["", "wrap", "nowrap"],
  },
  {
    property: "grid-template-columns",
    label: "Columns",
    group: "Layout",
    placeholder: "repeat(3, 1fr)",
  },
  { property: "gap", label: "Gap", group: "Layout", placeholder: "16px" },
  {
    property: "position",
    label: "Position",
    group: "Layout",
    choices: ["", "static", "relative", "absolute", "fixed", "sticky"],
  },
  ...[
    "width",
    "height",
    "min-width",
    "max-width",
    "min-height",
    "max-height",
  ].map((property) => ({
    property,
    label: property.replaceAll("-", " "),
    group: "Size",
    placeholder: "auto",
  })),
  ...[
    "padding",
    "margin",
    "padding-inline",
    "padding-block",
    "margin-inline",
    "margin-block",
  ].map((property) => ({
    property,
    label: property.replaceAll("-", " "),
    group: "Spacing",
    placeholder: "0px",
  })),
  ...[
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "text-align",
    "color",
  ].map((property) => ({
    property,
    label: property.replaceAll("-", " "),
    group: "Typography",
  })),
  ...[
    "background",
    "border",
    "border-radius",
    "box-shadow",
    "opacity",
    "filter",
    "backdrop-filter",
    "transform",
    "transform-origin",
    "overflow",
    "z-index",
    "scroll-behavior",
    "container-type",
  ].map((property) => ({
    property,
    label: property.replaceAll("-", " "),
    group: "Appearance",
  })),
];

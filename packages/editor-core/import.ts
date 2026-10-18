import { clone, element, walk, type ElementNode } from "../document-model";
import { assertSafeCss, selectorFor } from "../css-engine";
import postcss from "postcss";
import { safeAttribute } from "../validation";
export function importHtml(
  html: string,
  css: string,
  existingRoot?: ElementNode,
): { root: ElementNode; css: string; warnings: string[] } {
  assertSafeCss(css);
  if (html.length > 5_000_000)
    throw new Error("HTML import exceeds the 5 MB limit.");
  const doc = new DOMParser().parseFromString(html, "text/html"),
    warnings: string[] = [];
  const existing = new Map<string, ElementNode>(),
    used = new Set<string>();
  if (existingRoot) walk(existingRoot, (n) => existing.set(n.id, n));
  for (const style of doc.querySelectorAll("style")) {
    assertSafeCss(style.textContent ?? "");
    css += "\n" + (style.textContent ?? "");
    style.remove();
  }
  const blocked = "script,iframe,object,embed,base,link,meta";
  for (const unsafe of doc.querySelectorAll(blocked)) {
    warnings.push(`Removed unsafe ${unsafe.tagName.toLowerCase()} element.`);
    unsafe.remove();
  }
  const convert = (el: Element): ElementNode => {
    const attributes: Record<string, string> = {};
    for (const a of el.attributes) {
      if (a.name === "style" || a.name === "data-cs-id") continue;
      if (safeAttribute(a.name, a.value)) attributes[a.name] = a.value;
      else warnings.push(`Removed unsafe ${a.name} attribute.`);
    }
    const node = element(el.tagName.toLowerCase(), "", attributes);
    node.name = attributes.id || node.tag;
    const trackedId = el.getAttribute("data-cs-id"),
      original = trackedId ? existing.get(trackedId) : undefined;
    if (original && !used.has(original.id)) {
      node.id = original.id;
      node.name = original.name;
      node.interactions = clone(original.interactions);
      node.componentId = original.componentId;
      used.add(original.id);
    }
    if (el.hasAttribute("style")) {
      const inline = el.getAttribute("style") ?? "";
      assertSafeCss(`a{${inline}}`);
      const parsed = postcss.parse(`${selectorFor(node.id)} {${inline}}`),
        rule = parsed.first;
      if (
        parsed.nodes.length !== 1 ||
        rule?.type !== "rule" ||
        rule.nodes.some((n) => !["decl", "comment"].includes(n.type))
      )
        throw new Error(
          "Inline styles must contain CSS declarations, not nested rules.",
        );
      css += "\n" + rule.toString();
    }
    const hasElements = el.children.length > 0;
    if (!hasElements) node.text = el.textContent ?? "";
    else
      for (const child of el.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE)
          node.children.push(convert(child as Element));
        else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
          node.children.push(element("span", child.textContent));
      }
    return node;
  };
  const children = [...doc.body.children].map(convert);
  const root =
    children.length === 1 ? children[0] : element("main", "", {}, children);
  if (!children.length && doc.body.textContent?.trim())
    root.text = doc.body.textContent.trim();
  return { root, css, warnings };
}

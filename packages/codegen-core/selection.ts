import postcss from "postcss";
import {
  clone,
  currentPage,
  element,
  walk,
  type Project,
} from "../document-model";
import { selectorFor } from "../css-engine";
export type ExportScope = "selection" | "screen" | "screens" | "project";
export type OutputMode = "snippet" | "component" | "screen" | "project";
export interface ExportOptions {
  scope: ExportScope;
  mode: OutputMode;
  name: string;
  selectedIds: string[];
  pageIds: string[];
}
export const defaultExportOptions: ExportOptions = {
  scope: "project",
  mode: "project",
  name: "MyComponent",
  selectedIds: [],
  pageIds: [],
};
export interface ExtractedDesign {
  project: Project;
  warnings: string[];
  dependencies: {
    assets: number;
    animations: string[];
    tokens: string[];
    externalTargets: string[];
  };
}
/** Conservative AST extraction retains unfamiliar constructs and reports ambiguity. */
export function extractDesign(
  source: Project,
  options: ExportOptions,
): ExtractedDesign {
  const project = clone(source),
    warnings: string[] = [],
    externalTargets: string[] = [];
  if (options.scope === "screens") {
    project.pages = project.pages.filter((p) => options.pageIds.includes(p.id));
    if (!project.pages.length) throw new Error("Choose at least one screen.");
  }
  if (options.scope === "screen" || options.scope === "selection")
    project.pages = [clone(currentPage(project))];
  if (!project.pages.some((p) => p.id === project.activePageId))
    project.activePageId = project.pages[0].id;
  if (options.scope === "selection") {
    const page = project.pages[0],
      ids = new Set(options.selectedIds),
      roots: (typeof page.root)[] = [];
    const pick = (node: typeof page.root) => {
      if (ids.has(node.id)) {
        roots.push(clone(node));
        return;
      }
      node.children.forEach(pick);
    };
    pick(page.root);
    if (!roots.length)
      throw new Error(
        "Select an element, component, container or section on the canvas.",
      );
    page.root =
      roots.length === 1
        ? roots[0]
        : element("section", "", { class: "cs-selected-export" }, roots);
    page.css = extractCss(page.css, page.root, warnings);
  }
  const allIds = new Set<string>(),
    definitions = new Set<string>();
  for (const page of project.pages)
    walk(page.root, (n) => {
      allIds.add(n.id);
      if (n.componentId) definitions.add(n.componentId);
    });
  for (const page of project.pages)
    walk(page.root, (n) => {
      n.interactions = n.interactions.filter((i) => {
        if (!i.target || allIds.has(i.target)) return true;
        externalTargets.push(i.target);
        warnings.push(
          "An interaction targets an element outside the export. It was omitted; include its container to retain the behavior.",
        );
        return false;
      });
    });
  if (options.scope !== "project")
    project.components = project.components.filter((c) =>
      definitions.has(c.id),
    );
  let content =
    project.pages.map((p) => p.css + JSON.stringify(p.root)).join("") +
    project.components.map((c) => c.css + JSON.stringify(c.root)).join("");
  project.assets = project.assets.filter(
    (a) => content.includes(a.url) || content.includes(a.id),
  );
  const tokens = new Set<string>();
  let previous = -1;
  while (previous !== tokens.size) {
    previous = tokens.size;
    for (const match of content.matchAll(/var\(\s*(--[\w-]+)/g)) {
      tokens.add(match[1]);
      content += "\n" + (project.tokens[match[1]] ?? "");
    }
  }
  if (options.scope !== "project")
    project.tokens = Object.fromEntries(
      Object.entries(project.tokens).filter(([key]) => tokens.has(key)),
    );
  const animations: string[] = [];
  for (const page of project.pages)
    postcss.parse(page.css).walkAtRules(/keyframes$/, (rule) => {
      animations.push(rule.params);
    });
  return {
    project,
    warnings: [...new Set(warnings)],
    dependencies: {
      assets: project.assets.length,
      animations,
      tokens: [...tokens],
      externalTargets,
    },
  };
}
export function extractCss(
  css: string,
  root: Project["pages"][number]["root"],
  warnings: string[],
): string {
  const ids = new Set<string>(),
    classes = new Set<string>(),
    tags = new Set<string>(),
    htmlIds = new Set<string>();
  walk(root, (n) => {
    ids.add(n.id);
    tags.add(n.tag);
    (n.attributes.class ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => classes.add(c));
    for (const interaction of n.interactions)
      if (interaction.action === "toggle-class") classes.add(interaction.value);
    if (n.attributes.id) htmlIds.add(n.attributes.id);
  });
  const tree = postcss.parse(css),
    usedAnimations = new Set<string>();
  const matches = (selector: string): boolean => {
    const internal = [
      ...selector.matchAll(/\[data-cs-id=["']([^"']+)["']\]/g),
    ].map((m) => m[1]);
    if (internal.length) return internal.some((id) => ids.has(id));
    const names = [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(
      (m) => m[1],
    );
    if (names.length) {
      if (!classes.has(names[names.length - 1])) return false;
      if (!names.every((name) => classes.has(name)))
        warnings.push(
          "Some retained selectors depend on ancestor classes outside the selection. Include their container or adjust those selectors in the destination.",
        );
      return true;
    }
    const html = [...selector.matchAll(/#([a-zA-Z_][\w-]*)/g)].map((m) => m[1]);
    if (html.length) return html.some((id) => htmlIds.has(id));
    if (
      /(^|[\s,>+~])(?:body|html|:root|\*)(?=$|[\s:.,>+~])/.test(selector) ||
      selector.includes(":root") ||
      selector === "*"
    )
      return true;
    const elements = selector.match(/(?:^|[\s>+~,(])([a-z][\w-]*)/g) ?? [];
    if (elements.length)
      return elements.some((token) =>
        tags.has(token.trim().replace(/^[>+~,(]+/, "")),
      );
    warnings.push(
      "Advanced selectors were retained conservatively. Review the extracted stylesheet in its destination context.",
    );
    return true;
  };
  tree.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name))
      return;
    const kept = postcss.list.comma(rule.selector).filter(matches);
    if (!kept.length) {
      rule.remove();
      return;
    }
    rule.selector = kept.join(", ");
    rule.walkDecls(/^animation(?:-name)?$/, (decl) =>
      decl.value.split(/[\s,]+/).forEach((value) => usedAnimations.add(value)),
    );
  });
  tree.walkAtRules(/keyframes$/, (rule) => {
    if (!usedAnimations.has(rule.params)) rule.remove();
  });
  tree.walkAtRules((rule) => {
    if (rule.nodes && !rule.nodes.length) rule.remove();
  });
  // Preserve inherited baseline typography on a component host without applying page backgrounds.
  const inherited: Record<string, string> = {};
  tree.walkRules((rule) => {
    if (["body", "html"].includes(rule.selector))
      rule.walkDecls((d) => {
        if (/^(font|color|line-height|letter-spacing|text-align)/.test(d.prop))
          inherited[d.prop] = d.value;
      });
  });
  if (Object.keys(inherited).length) {
    const host = postcss.rule({ selector: selectorFor(root.id) });
    Object.entries(inherited).forEach(([prop, value]) =>
      host.append(postcss.decl({ prop, value })),
    );
    tree.prepend(host);
  }
  return tree.toString();
}

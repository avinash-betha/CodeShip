import { describe, it, expect } from "vitest";
import { createProject, element, walk } from "../../packages/document-model";
import { components } from "../../packages/component-registry";
import {
  defaultExportOptions,
  extractDesign,
} from "../../packages/codegen-core/selection";
import { generateExport } from "../../packages/codegen-core/export";
import { validateTree, parseProject } from "../../packages/validation";
import {
  resizeBounds,
  snapAxis,
  cssLength,
} from "../../packages/editor-core/geometry";
import {
  glassValues,
  defaultGlass,
} from "../../packages/component-registry/style-presets";
import { setDeclarations } from "../../packages/css-engine";
describe("selected design extraction and canvas geometry", () => {
  it("extracts required tokens, assets, keyframes and internal targets without sibling content", () => {
    const p = createProject("Extraction"),
      button = element("button", "Toggle"),
      target = element("div", "Panel", { class: "panel" }),
      outside = element("aside", "Private sibling", { class: "unused" }),
      root = element("section", "", { class: "card" }, [button, target]);
    button.interactions = [
      {
        event: "click",
        action: "toggle-class",
        target: target.id,
        value: "open",
      },
      {
        event: "click",
        action: "set-text",
        target: outside.id,
        value: "not exported",
      },
    ];
    p.pages[0].root.children = [root, outside];
    p.pages[0].css =
      ".card {color:var(--ink);animation:enter 1s}.unused{color:red}@keyframes enter{from{opacity:0}to{opacity:1}}@keyframes unused{to{opacity:0}}@media(max-width:600px){.card{padding:16px}}";
    p.tokens = {
      "--ink": "var(--brand)",
      "--brand": "#123456",
      "--unused": "red",
    };
    const result = extractDesign(p, {
      ...defaultExportOptions,
      scope: "selection",
      selectedIds: [root.id, button.id],
    });
    expect(result.project.pages[0].root.id).toBe(root.id);
    expect(result.project.pages[0].css).not.toContain(".unused");
    expect(result.project.pages[0].css).toContain("@media");
    expect(result.dependencies.animations).toEqual(["enter"]);
    expect(result.project.tokens).toEqual({
      "--ink": "var(--brand)",
      "--brand": "#123456",
    });
    expect(result.dependencies.externalTargets).toEqual([outside.id]);
    expect(result.warnings).toHaveLength(1);
    expect(result.project.pages[0].root.children[0].interactions).toHaveLength(
      1,
    );
    expect(p.pages[0].root.children[0].children[0].interactions).toHaveLength(
      2,
    );
  });
  it("generates reusable static and interactive framework files with scoped listeners", async () => {
    const p = createProject("Components");
    const data =
      components.find((c) => c.id === "data-table") ??
      components.find((c) => c.name === "Data table")!;
    expect(data).toBeTruthy();
    const content = data.create();
    p.pages[0].root = content.root;
    p.pages[0].css = content.css;
    const options = {
      ...defaultExportOptions,
      scope: "selection" as const,
      mode: "component" as const,
      name: "TeamTable",
      selectedIds: [content.root.id],
    };
    const angular = await generateExport(p, "angular", options),
      next = await generateExport(p, "nextjs", options);
    expect(angular["team-table.component.ts"]).toContain(
      "this.host.nativeElement.querySelector",
    );
    expect(angular["team-table.component.ts"]).toContain("ngOnDestroy");
    expect(next["TeamTable.tsx"]).toContain("use client");
    expect(next["TeamTable.tsx"]).toContain("host.current?.querySelector");
    expect(next["TeamTable.module.css"]).toContain(":global");
    expect(next["package.json"]).toBeUndefined();
    p.pages[0].root = element("article", "Static");
    options.selectedIds = [p.pages[0].root.id];
    const staticFiles = await generateExport(p, "nextjs", options);
    expect(staticFiles["TeamTable.tsx"]).not.toContain("use client");
  });
  it("validates every library component, its unique identities and local interaction targets", () => {
    for (const entry of components) {
      const p = createProject(entry.name),
        content = entry.create();
      p.pages[0].root = content.root;
      p.pages[0].css = content.css;
      expect(
        validateTree(content.root).filter((d) => d.severity === "error"),
        entry.name,
      ).toEqual([]);
      expect(() => parseProject(JSON.stringify(p)), entry.name).not.toThrow();
      const ids = new Set<string>();
      walk(content.root, (n) => {
        expect(ids.has(n.id)).toBe(false);
        ids.add(n.id);
      });
      walk(content.root, (n) =>
        n.interactions.forEach((i) =>
          expect(!i.target || ids.has(i.target), entry.name).toBe(true),
        ),
      );
    }
  });
  it("locks the opposite corner, respects constraints and preserves aspect ratios", () => {
    const start = { x: 100, y: 50, width: 200, height: 100 };
    expect(resizeBounds(start, "nw", 50, 20)).toEqual({
      x: 150,
      y: 70,
      width: 150,
      height: 80,
    });
    expect(
      resizeBounds(start, "se", 100, 20, { aspect: true, maxWidth: 240 }),
    ).toEqual({ x: 100, y: 50, width: 240, height: 120 });
    expect(resizeBounds(start, "e", -500, 20, { minWidth: 80 })).toEqual({
      x: 100,
      y: 50,
      width: 80,
      height: 100,
    });
    expect(resizeBounds(start, "s", 100, 15, { snap: 8 }).height).toBe(112);
    expect(snapAxis(101, 100, [200])).toEqual({ value: 100, guide: 200 });
    expect(cssLength("100%", 360, Infinity)).toBe(360);
    expect(cssLength("none", 360, Infinity)).toBe(Infinity);
  });
  it("writes glass vendor properties and feature fallbacks as valid CSS", () => {
    let css = setDeclarations("", ".glass", glassValues(defaultGlass));
    css = setDeclarations(
      css,
      ".glass",
      { "backdrop-filter": "none" },
      "@supports not (backdrop-filter: blur(1px))",
    );
    expect(css).toContain("-webkit-backdrop-filter");
    expect(css).toContain("@supports");
  });
});

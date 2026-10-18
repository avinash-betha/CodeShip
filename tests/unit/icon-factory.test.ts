import { describe, expect, it } from "vitest";
import ts from "typescript";
import {
  cloneIcon,
  iconComponent,
  icons,
  makeIcon,
  parseSvg,
  svgSource,
} from "../../packages/icon-factory";
import {
  createProject,
  duplicateNode,
  walk,
} from "../../packages/document-model";
import { parseProject, validateTree } from "../../packages/validation";
import {
  legacyBaseCss,
  legacyLibraryCss,
} from "../../packages/component-registry/legacy-template-styles";
import {
  baseCss,
  libraryCss,
  upgradeTemplateStyles,
} from "../../packages/component-registry/template-styles";
import { IndexedDbRepository } from "../../packages/persistence";
import { generateExport } from "../../packages/codegen-core/export";

describe("original icon factory and safe portable vectors", () => {
  it("uses unique named icons with valid editable geometry in every variant", () => {
    expect(icons.length).toBeGreaterThanOrEqual(80);
    expect(new Set(icons.map((i) => i.id)).size).toBe(icons.length);
    for (const icon of icons)
      for (const variant of [
        "outline",
        "rounded",
        "sharp",
        "duotone",
        "tinted",
      ] as const) {
        const root = makeIcon(icon.id, { variant });
        expect(
          validateTree(root).filter((d) => d.severity === "error"),
        ).toEqual([]);
        expect(root.children.length).toBeGreaterThan(0);
      }
  });
  it("keeps gradients linked and collision-free through cloning, saved projects and all exports", async () => {
    const root = makeIcon("rocket", {
      gradient: true,
      label: "Launch project",
      rotation: 45,
      flipX: true,
    });
    const copy = duplicateNode(root);
    const ids: string[] = [];
    walk(root, (n) => {
      if (n.attributes.id) ids.push(n.attributes.id);
    });
    expect(svgSource(copy)).not.toContain(ids[0]);
    const p = createProject("My vectors");
    p.pages[0].root.children.push(root, copy);
    p.components.push({
      id: "icon-saved",
      name: "Launch",
      root: cloneIcon(root),
      css: "",
    });
    const repo = new IndexedDbRepository("icons-" + crypto.randomUUID());
    await repo.save(p);
    const loaded = parseProject(JSON.stringify(await repo.get(p.id)));
    expect(loaded.components[0].root.tag).toBe("svg");
    expect(
      validateTree(loaded.pages[0].root).filter((d) => d.severity === "error"),
    ).toEqual([]);
    for (const target of ["html", "angular", "nextjs"] as const) {
      const files = await generateExport(loaded, target);
      const source = Object.values(files)
        .filter((v) => typeof v === "string")
        .join("");
      expect(source).toContain("Launch project");
      expect(source).toMatch(/linearGradient/);
      expect(source).toContain("url(#");
    }
  });
  it("rejects executable, linked, malformed and complex SVG before entering the document", () => {
    for (const bad of [
      "<svg><script>alert(1)</script></svg>",
      '<svg onload="alert(1)"></svg>',
      '<svg><image href="https://example.com/pixel.png"/></svg>',
      '<svg><path fill="url(https://evil.example/a)"/></svg>',
      "<svg><foreignObject><div>HTML</div></foreignObject></svg>",
      '<!DOCTYPE svg [<!ENTITY x "hi">]><svg/>',
      '<svg><path fill="url(#missing)"/></svg>',
      "<svg>" +
        Array.from({ length: 201 }, () => '<path d="M1 1"/>').join("") +
        "</svg>",
    ])
      expect(() => parseSvg(bad)).toThrow();
    expect(() =>
      parseSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2 Q12 22 22 2" stroke="#000000" fill="none"/></svg>',
      ),
    ).not.toThrow();
  });
  it("produces parseable standalone React and Angular component source", () => {
    const root = makeIcon("spark", { gradient: true, label: "Creative tools" });
    for (const target of ["react", "angular"] as const) {
      const source = iconComponent(root, target);
      const result = ts.transpileModule(source, {
        fileName: target === "react" ? "custom-icon.tsx" : "custom-icon.ts",
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          experimentalDecorators: true,
        },
        reportDiagnostics: true,
      });
      expect(
        result.diagnostics?.filter(
          (d) => d.category === ts.DiagnosticCategory.Error,
        ),
      ).toEqual([]);
    }
    expect(iconComponent(root, "react")).toContain("useId");
    expect(iconComponent(root, "react")).toContain("{...props}");
  });
  it("migrates exact shipped CSS while retaining user overrides and original element identifiers", () => {
    const p = createProject("Existing settings");
    p.pages[0].css =
      legacyBaseCss +
      "\n" +
      legacyLibraryCss +
      '\n[data-cs-id="my-node"] {color:tomato;}';
    const id = p.pages[0].root.id;
    const updated = upgradeTemplateStyles(p);
    expect(updated.pages[0].css).toContain(baseCss);
    expect(updated.pages[0].css).toContain(libraryCss);
    expect(updated.pages[0].css).toContain("color:tomato");
    expect(updated.pages[0].root.id).toBe(id);
    expect(p.pages[0].css).toContain(legacyBaseCss);
    expect(upgradeTemplateStyles(updated)).toEqual(updated);
    const custom = createProject("Custom import");
    custom.pages[0].css = "main {width:800px}";
    expect(upgradeTemplateStyles(custom)).toEqual(custom);
  });
});

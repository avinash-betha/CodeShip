import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  docArticles,
  docHeadings,
  findDocs,
  resolveDocSection,
} from "../../apps/studio/src/docs-registry";
import { docActions } from "../../apps/studio/src/docs-model";
import { assertSafeCss } from "../../packages/css-engine";
import ts from "typescript";
import { generateExport } from "../../packages/codegen-core/export";
import type { ExportOptions } from "../../packages/codegen-core/selection";
import { canvasDocument } from "../../packages/codegen-core";
import { createProject } from "../../packages/document-model";
import { internalGuideArticles } from "../../docs/internal";
import { renderInternalDocs } from "../../scripts/internal-docs";
describe("offline documentation integrity", () => {
  it("preserves user article addresses and keeps internal guides outside the customer registry", () => {
    const existing =
      "introduction getting-started creating-projects visual-studio drag-drop moving-resizing spacing layout-modes flexbox css-grid html-elements css-studio advanced-css components navigation styles glass templates icons responsive animations projects selective-export angular nextjs html shortcuts troubleshooting faq install-desktop visual-walkthrough fullscreen forms-accessibility modern-workflows document-format import-assets accessibility".split(
        " ",
      );
    for (const id of existing)
      expect(
        docArticles.some((a) => a.id === id),
        id,
      ).toBe(true);
    expect([...new Set(docArticles.map((a) => a.category))]).toEqual([
      "Getting Started",
      "Visual Designer",
      "HTML and CSS Studio",
      "Design Library",
      "Icon Factory",
      "Responsive Lab",
      "Code Export",
      "Projects and Desktop",
    ]);
    for (const a of docArticles) expect(docActions).toContain(a.action);
    expect(docArticles).toHaveLength(37);
    expect(internalGuideArticles).toHaveLength(8);
    for (const a of internalGuideArticles)
      expect(docArticles.some((userGuide) => userGuide.id === a.id)).toBe(
        false,
      );
    expect(JSON.stringify(docArticles)).not.toMatch(/[—–]/);
  });
  it("resolves every article, related guide, heading and local illustration", () => {
    const ids = new Set(docArticles.map((a) => a.id));
    expect(ids.size).toBe(docArticles.length);
    for (const a of docArticles) {
      expect(a.intro.length).toBeGreaterThan(40);
      const headings = docHeadings(a).map((h) => h.id);
      expect(new Set(headings).size).toBe(headings.length);
      for (const id of a.related ?? [])
        expect(ids.has(id), `${a.id} → ${id}`).toBe(true);
      for (const s of a.sections) {
        for (const link of s.links ?? [])
          expect(ids.has(link.id), `${a.id} → ${link.id}`).toBe(true);
        if (s.image)
          expect(existsSync("apps/studio/public" + s.image.src)).toBe(true);
      }
    }
  });
  it("indexes full content, commands and multiple query terms without remote search", () => {
    expect(
      findDocs("WIN_CSC_KEY_PASSWORD").some((a) => a.id === "build-windows"),
    ).toBe(false);
    expect(findDocs("WIN_CSC_KEY_PASSWORD")).toEqual([]);
    expect(findDocs("container query").some((a) => a.id === "responsive")).toBe(
      true,
    );
    expect(findDocs("unlikely-unknown-guide-value")).toEqual([]);
    expect(findDocs("FAQ").some((a) => a.id === "faq")).toBe(true);
    expect(
      findDocs("Visual Studio").some((a) => a.id === "visual-studio"),
    ).toBe(true);
    expect(
      findDocs("Button icon layout").some((a) => a.id === "components"),
    ).toBe(true);
    expect(
      findDocs("my-component.component.ts").some((a) => a.id === "angular"),
    ).toBe(true);
    expect(findDocs("App Router page").some((a) => a.id === "nextjs")).toBe(
      true,
    );
  });
  it("exports every internal chapter, section and code block to standalone HTML", () => {
    const html = renderInternalDocs(internalGuideArticles);
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelectorAll("article[data-article]")).toHaveLength(8);
    for (const article of internalGuideArticles) {
      expect(
        doc.getElementById(article.id)?.querySelector("h2")?.textContent,
      ).toBe(article.title);
      for (const section of article.sections) {
        const target = doc.getElementById(`${article.id}-${section.id}`);
        expect(target?.querySelector("h3")?.textContent).toBe(section.title);
        if (section.code)
          expect(target?.querySelector("code")?.textContent).toBe(
            section.code.text,
          );
      }
    }
    for (const link of doc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      expect(doc.getElementById(link.hash.slice(1)), link.hash).not.toBeNull();
    expect(
      doc.querySelectorAll('script[src],link[rel="stylesheet"]'),
    ).toHaveLength(0);
  });
  it("escapes reference content instead of executing markup from examples", () => {
    const article = structuredClone(internalGuideArticles[0]);
    article.title = '<script>alert("example")</script>';
    const doc = new DOMParser().parseFromString(
      renderInternalDocs([article]),
      "text/html",
    );
    expect(doc.querySelector("article h2")?.textContent).toBe(article.title);
    expect(doc.querySelectorAll("script")).toHaveLength(1);
  });
  it("keeps earlier section links useful after expanding their articles", () => {
    const legacy: Record<string, string[]> = {
      "css-studio": ["surfaces"],
      animations: ["states"],
      angular: ["existing-app", "angular-review"],
      nextjs: ["existing-app", "next-review"],
      html: ["existing-page"],
      "forms-accessibility": ["semantic", "review"],
      "modern-workflows": ["sidebar"],
      "import-assets": ["import", "compatibility"],
    };
    for (const a of docArticles) {
      for (const id of ["steps", "example", "notes", ...(legacy[a.id] ?? [])]) {
        const resolved = resolveDocSection(a, id);
        expect(resolved).not.toBe("introduction");
        expect(docHeadings(a).some((h) => h.id === resolved)).toBe(true);
      }
    }
  });
  it("provides syntactically valid CSS and framework code examples", () => {
    for (const a of docArticles)
      for (const s of a.sections) {
        if (!s.code) continue;
        const { language, text } = s.code;
        expect(text).not.toMatch(/Button →|Form →|Saved block →/);
        if (language === "css")
          expect(() => assertSafeCss(text), a.id).not.toThrow();
        if (["typescript", "tsx"].includes(language)) {
          const result = ts.transpileModule(text, {
            fileName: language === "tsx" ? "example.tsx" : "example.ts",
            compilerOptions: {
              target: ts.ScriptTarget.ES2022,
              jsx: ts.JsxEmit.Preserve,
              experimentalDecorators: true,
            },
            reportDiagnostics: true,
          });
          expect(result.diagnostics, a.id).toEqual([]);
        }
      }
  });
  it("documents the actual reusable exporter names and Angular selector", async () => {
    const project = createProject("Docs fixture");
    const options = {
      scope: "screen",
      mode: "component",
      name: "MyComponent",
      selectedIds: [],
      pageIds: [],
    } satisfies ExportOptions;
    const angular = await generateExport(project, "angular", options);
    const next = await generateExport(project, "nextjs", options);
    const html = await generateExport(project, "html", {
      ...options,
      mode: "snippet",
    });
    for (const [id, files] of [
      ["angular", angular],
      ["nextjs", next],
      ["html", html],
    ] as const) {
      const prose = JSON.stringify(docArticles.find((a) => a.id === id));
      for (const file of Object.keys(files))
        expect(prose, `${id}: ${file}`).toContain(file);
    }
    expect(angular["my-component.component.ts"]).toContain(
      "class MyComponentComponent",
    );
    expect(angular["my-component.component.ts"]).toContain("app-my-component");
    expect(next["MyComponent.tsx"]).not.toContain("use client");
  });
  it("adds the scoped preview exit listener under the existing nonce policy", () => {
    const project = createProject("Preview");
    const html = canvasDocument(project, {
      interactive: true,
      previewExit: true,
      nonce: "testNonce",
    });
    expect(html).toContain("script-src 'nonce-testNonce'");
    expect(html).toContain('script nonce="testNonce"');
    expect(html).toContain("codeship:preview-exit");
    expect(canvasDocument(project)).not.toContain("codeship:preview-exit");
  });
});

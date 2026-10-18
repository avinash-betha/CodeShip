import { describe, it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { IndexedDbRepository } from "../../packages/persistence";
import { demoProject, templates } from "../../packages/component-registry";
import { createProject, element } from "../../packages/document-model";
import { generateExport, zipExport } from "../../packages/codegen-core/export";
import { canvasDocument } from "../../packages/codegen-core";
import { validateTree } from "../../packages/validation";
describe("local persistence and independent exports", () => {
  it("saves, lists, reopens and removes projects with full CSS preserved", async () => {
    const repo = new IndexedDbRepository("test-" + crypto.randomUUID()),
      p = demoProject();
    await repo.save(p);
    expect((await repo.list())[0].name).toBe(p.name);
    expect((await repo.get(p.id))?.pages[0].css).toBe(p.pages[0].css);
    await repo.remove(p.id);
    expect(await repo.list()).toHaveLength(0);
  });
  it("represents every screen as editable and structurally valid elements", () => {
    for (const t of templates) {
      const { root } = t.create();
      expect(root.children.length).toBeGreaterThan(0);
      expect(validateTree(root).filter((d) => d.severity === "error")).toEqual(
        [],
      );
    }
  });
  it("exports HTML with supported interactions and downloadable ZIP content", async () => {
    const p = createProject("Test export");
    const b = element("button", "Toggle <text>", { type: "button" });
    b.interactions = [
      { event: "click", action: "toggle-class", target: b.id, value: "active" },
    ];
    p.pages[0].root.children = [b];
    const files = await generateExport(p, "html");
    expect(files["index.html"]).toContain("&lt;text&gt;");
    expect(files["script.js"]).toContain("toggle-class");
    const zip = unzipSync(zipExport(files));
    expect(strFromU8(zip["index.html"])).toBe(files["index.html"]);
    expect(files["styles.css"]).toBeTruthy();
  });
  it("generates target-native Angular and Next.js sources", async () => {
    const p = demoProject();
    p.pages[0].root.children.push(
      element("label", "Email @ domain {safe}", { for: "email" }),
      element("input", "", {
        id: "email",
        class: "field",
        "aria-label": "Email",
        required: "",
        value: "name@example.com",
      }),
    );
    const angular = await generateExport(p, "angular"),
      next = await generateExport(p, "nextjs");
    expect(angular["src/app.component.html"]).toContain("&#64;");
    expect(angular["src/app.component.ts"]).toContain("standalone: true");
    expect(next["app/page.tsx"]).toContain("className");
    expect(next["app/page.tsx"]).toContain("defaultValue");
    expect(next["package.json"]).toContain("next");
    expect(next["app/layout.tsx"]).toContain('lang="en"');
  });
  it("isolates canvas content with CSP and never includes imported executable code", () => {
    const html = canvasDocument(demoProject());
    expect(html).toContain("script-src 'none'");
    expect(html).not.toContain("<script");
  });
});

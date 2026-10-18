import { describe, expect, it } from "vitest";
import {
  canContain,
  clone,
  createProject,
  element,
} from "../../packages/document-model";
import { makeIcon } from "../../packages/icon-factory";
import { declarations, selectorFor } from "../../packages/css-engine";
import {
  placeButtonIcon,
  iconPlacements,
} from "../../packages/editor-core/icon-placement";
import { parseProject } from "../../packages/validation";
import { generateExport } from "../../packages/codegen-core/export";

describe("existing button icon placement", () => {
  it("keeps HTML controls outside SVG while allowing editable vector layers", () => {
    const icon = makeIcon("rocket");
    expect(canContain(icon, element("button", "Action"))).toBe(false);
    expect(canContain(icon, element("path"))).toBe(true);
    expect(canContain(icon, element("lineargradient"))).toBe(true);
    expect(canContain(element("button"), icon)).toBe(true);
  });
  it.each(iconPlacements)(
    "moves an existing icon $value while preserving identity, text and behavior",
    ({ value }) => {
      const project = createProject(),
        page = project.pages[0];
      const button = element("button", "Create account"),
        icon = makeIcon("rocket");
      button.interactions.push({
        event: "click",
        action: "show-message",
        target: button.id,
        value: "Created",
      });
      page.root.children.push(button, icon);
      page.css = `${selectorFor(icon.id)}{position:absolute;left:20px;top:40px} ${selectorFor(button.id)}{background:green}`;
      placeButtonIcon(project, icon, button.id, value);
      expect(page.root.children).toEqual([button]);
      expect(button.children.find((child) => child.tag === "svg")).toBe(icon);
      expect(button.children.find((child) => child.tag === "span")?.text).toBe(
        "Create account",
      );
      expect(button.interactions[0].value).toBe("Created");
      expect(declarations(page.css, selectorFor(icon.id)).position).toBe(
        "static",
      );
      expect(declarations(page.css, selectorFor(button.id)).background).toBe(
        "green",
      );
      expect(
        button.children[
          value === "after-text" || value === "below-text" ? 1 : 0
        ].id,
      ).toBe(icon.id);
      expect(() => parseProject(JSON.stringify(project))).not.toThrow();
      if (value === "icon-only")
        expect(button.attributes["aria-label"]).toBe("Create account");
      placeButtonIcon(project, icon, button.id, "after-text");
      expect(
        declarations(page.css, selectorFor(button.id) + " > :not(svg)").display,
      ).toBeUndefined();
      expect(
        button.children.filter((child) => child.id === icon.id),
      ).toHaveLength(1);
    },
  );
  it("rejects invalid targets without detaching the existing icon", () => {
    const project = createProject(),
      icon = makeIcon("rocket"),
      target = element("input");
    project.pages[0].root.children.push(icon, target);
    const before = clone(project);
    expect(() =>
      placeButtonIcon(project, icon, target.id, "before-text"),
    ).toThrow();
    expect(project).toEqual(before);
  });
  it("retains inserted SVG and label in all standalone export formats", async () => {
    const project = createProject(),
      button = element("button", "Create account");
    project.pages[0].root.children.push(button);
    placeButtonIcon(
      project,
      makeIcon("rocket", { label: "Launch" }),
      button.id,
      "above-text",
    );
    for (const target of ["html", "angular", "nextjs"] as const) {
      const files = await generateExport(project, target);
      const source = Object.values(files)
        .filter((value) => typeof value === "string")
        .join("\n");
      expect(source).toContain("Create account");
      expect(source).toContain("<svg");
      expect(source).toContain("above-text");
      expect(source).toContain("flex-direction: column");
    }
  });
});

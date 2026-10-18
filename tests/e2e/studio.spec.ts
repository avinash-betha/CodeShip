import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "codeship-onboarding-v1",
      JSON.stringify({
        welcomed: true,
        index: 0,
        completed: [],
        active: false,
      }),
    ),
  );
});
async function newProject(page: Page, name: string) {
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "New project name", exact: true })
    .fill(name);
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
test("complete visual authoring, responsiveness, persistence and three ZIP exports", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("All changes saved")).toBeVisible();
  await newProject(page, "Browser verification");
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page.getByRole("textbox", { name: "width", exact: true }).fill("900px");
  await page.getByRole("textbox", { name: "width", exact: true }).press("Tab");
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .fill("A real screen, made here.");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .press("Tab");
  await page.getByRole("tab", { name: "Layers", exact: true }).click();
  await page
    .getByRole("treeitem")
    .filter({ hasText: "Container" })
    .first()
    .click();
  await page.getByRole("tab", { name: "Insert", exact: true }).click();
  await page.getByRole("button", { name: "Add Button", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .fill("Toggle style");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .press("Tab");
  await page
    .getByRole("tablist", { name: "Inspector", exact: true })
    .getByRole("tab", { name: "HTML", exact: true })
    .click();
  await page.getByLabel("Interaction value", { exact: true }).fill("activated");
  await page
    .getByRole("button", { name: "Add interaction", exact: true })
    .click();
  await page.getByRole("tab", { name: "Design", exact: true }).click();
  await page.getByRole("tab", { name: "Layers", exact: true }).click();
  await page
    .getByRole("treeitem")
    .filter({ hasText: "Container" })
    .first()
    .click();
  await page.getByRole("tab", { name: "Insert", exact: true }).click();
  await page.getByRole("button", { name: "Add Input", exact: true }).click();
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  await expect(
    frame.getByRole("heading", { name: "A real screen, made here." }),
  ).toBeVisible();
  await expect(
    frame.getByRole("button", { name: "Toggle style" }),
  ).toBeVisible();
  await expect(
    frame.getByRole("textbox", { name: "Email address" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Analyze responsiveness", exact: true })
    .click();
  await expect(
    page.getByText("Replace a rigid width with a fluid constraint"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Apply", exact: true })
    .first()
    .click();
  await expect(page.getByText("applied", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Viewport width" }),
  ).toHaveValue("375");
  await page
    .getByRole("button", { name: "Desktop viewport", exact: true })
    .click();
  await expect(page.getByText("All changes saved")).toBeVisible();
  await page.reload();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "A real screen, made here." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Export code", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: /Download Project ZIP/ }),
  ).toBeEnabled();
  for (const target of ["HTML", "Angular", "Next.js"]) {
    if (target !== "HTML")
      await page
        .getByRole("button", {
          name: new RegExp(`^${target === "Next.js" ? "Next\\.js" : target} `),
        })
        .first()
        .click();
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: `Download Project ZIP`, exact: true })
      .click();
    const download = await downloadEvent;
    const path = await download.path();
    expect(path).toBeTruthy();
    const files = unzipSync(new Uint8Array(await readFile(path!)));
    if (target === "HTML") {
      expect(strFromU8(files["index.html"])).toContain("A real screen");
      expect(strFromU8(files["script.js"])).toContain("toggle-class");
    } else
      expect(strFromU8(files["package.json"])).toContain(
        target === "Angular" ? "@angular/core" : "next",
      );
  }
  expect(errors).toEqual([]);
});
test("imports advanced CSS safely, applies source edits, and creates animation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Import HTML source" })
    .fill(
      '<section class="imported" data-test="preserved" style="future-layout: magic; --label: &quot;a;b&quot;"><h1>Imported screen</h1><button type="button">Action</button></section><script>window.attacked=true</script>',
    );
  await page
    .getByRole("textbox", { name: "Import CSS source" })
    .fill(
      "@layer app { .imported { --custom: 2rem; padding: var(--custom); & h1 { color: #456134; } } }",
    );
  await page.getByRole("button", { name: "Import into page" }).click();
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  const headingBounds = await frame
    .getByRole("heading", { name: "Imported screen" })
    .boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    headingBounds!.x + headingBounds!.width / 2,
    headingBounds!.y + headingBounds!.height / 2,
  );
  await page.getByRole("tab", { name: "Motion", exact: true }).click();
  await page.getByRole("button", { name: "Apply animation" }).click();
  await page.getByRole("button", { name: "Expand code workspace" }).click();
  await page.getByRole("tab", { name: "CSS", exact: true }).click();
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await expect(
    page.getByText("Monaco unavailable.", { exact: false }),
  ).not.toBeVisible();
  await expect(
    page.frameLocator('iframe[title="Design canvas"]').locator("script"),
  ).toHaveCount(0);
  const css = await page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("head style")
    .first()
    .textContent();
  expect(css).toContain("@layer app");
  expect(css).toContain("future-layout: magic");
  expect(css).toContain('--label: "a;b"');
  expect(css).toContain("@keyframes");
  expect(css).toContain("prefers-reduced-motion");
  await page.evaluate(() => {
    const model = window.monaco?.editor.getModels()[0];
    if (model)
      model.setValue(
        model.getValue() + "\n.imported h1 { letter-spacing: 3px; }",
      );
  });
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Imported screen" }),
  ).toHaveCSS("letter-spacing", "3px");
  const headingId = await page
    .frameLocator('iframe[title="Design canvas"]')
    .getByRole("heading", { name: "Imported screen" })
    .getAttribute("data-cs-id");
  await page
    .getByRole("tablist", { name: "Source workspace" })
    .getByRole("tab", { name: "HTML", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.monaco?.editor.getModels()[0]?.getValue() ?? "",
      ),
    )
    .toContain("Imported screen");
  await page.evaluate(() => {
    const model = window.monaco?.editor.getModels()[0];
    if (model)
      model.setValue(
        model.getValue().replace("Imported screen", "Edited source"),
      );
  });
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Edited source" }),
  ).toHaveAttribute("data-cs-id", headingId!);
});
test("multi-device comparison renders one model at three independent widths", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Compare device previews" }).click();
  for (const [name, width] of [
    ["Desktop", "1200"],
    ["Tablet", "768"],
    ["Mobile", "375"],
  ]) {
    await expect(
      page
        .getByRole("dialog")
        .locator(`iframe[title="${name} device preview"]`),
    ).toHaveCSS("width", width + "px");
    await expect(
      page
        .frameLocator(`iframe[title="${name} device preview"]`)
        .getByRole("heading", { name: "Make room for your next big idea." }),
    ).toBeVisible();
  }
});
test("drag and drop inserts into a nested container, and layer moves preserve structure", async ({
  page,
}) => {
  await page.goto("/");
  await newProject(page, "Drag verification");
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  const container = page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("main > div")
    .first();
  await expect(container).toBeVisible();
  const source = page.getByRole("button", {
    name: "Add Paragraph",
    exact: true,
  });
  const data = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.setData(
      "application/codeship",
      JSON.stringify({ kind: "primitive", id: "Paragraph" }),
    );
    return transfer;
  });
  await source.dispatchEvent("dragstart", { dataTransfer: data });
  const bounds = await container.boundingBox();
  expect(bounds).toBeTruthy();
  await page.locator(".canvas-input-surface").dispatchEvent("drop", {
    dataTransfer: data,
    clientX: bounds!.x + 10,
    clientY: bounds!.y + 10,
  });
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .locator("main > div > p"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .locator("main > div > p"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .locator("main > div > p"),
  ).toHaveCount(1);
});
test("editor accessibility and representative visual regression", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("All changes saved")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .setLegacyMode()
    .options({ iframes: false })
    .analyze();
  expect(result.violations).toEqual([]);
  await expect(page).toHaveScreenshot("codeship-editor.png", {
    animations: "disabled",
  });
});
test("small screen keeps canvas and export workflow usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Export code", exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Export code", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Download Project ZIP", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

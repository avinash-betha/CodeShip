import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
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
  await page.goto("/");
  await page.getByText("All changes saved").waitFor();
});
test("export configuration wraps, scopes files and exposes a full-screen source preview", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Export code", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Export component name" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Download Project ZIP", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("combobox", { name: "Export scope" })
    .selectOption("selection");
  await expect(
    page.getByRole("textbox", { name: "Export component name" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export HTML Component", exact: true }),
  ).toBeEnabled();
  for (const width of [1200, 900, 560]) {
    await page.setViewportSize({ width, height: 800 });
    expect(
      await page
        .locator(".export-options")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1200, height: 900 });
  await page
    .getByRole("button", { name: "Expand export preview", exact: true })
    .click();
  await expect(page.locator(".export-dialog")).toHaveCSS("width", "1200px");
  await expect(
    page.getByRole("region", { name: "Generated file source" }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/export-fullscreen.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".export-dialog")).not.toHaveClass(
    /export-expanded/,
  );
  await page.screenshot({ path: "docs/screenshots/export-redesign.png" });
});
test("custom CSS declarations reset and button icons retain label and undo history", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Button", exact: true }).click();
  await page.getByText("Custom CSS property", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Custom CSS property", exact: true })
    .fill("float");
  await page
    .getByRole("textbox", { name: "Custom CSS value", exact: true })
    .fill("left");
  await page
    .getByRole("button", { name: "Apply declaration", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "CSS declaration float", exact: true }),
  ).toHaveValue("left");
  await page
    .getByRole("button", { name: "Reset CSS property float", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "CSS declaration float", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "CSS declaration float", exact: true }),
  ).toHaveValue("left");
  await page
    .getByRole("button", { name: "Add icon to selection", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Button icon layout", exact: true })
    .selectOption("before-text");
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const button = page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("button")
    .last();
  await expect(button.locator("svg")).toHaveCount(1);
  await expect(button.locator("span")).not.toHaveText("");
  await expect(button.locator(":scope > :first-child")).toHaveJSProperty(
    "tagName",
    "svg",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(button.locator("svg")).toHaveCount(0);
  await page.getByRole("button", { name: "Add Input", exact: true }).click();
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  const field = frame.locator("input[data-cs-selected]");
  await expect(field).toBeVisible();
  const fieldId = await field.getAttribute("data-cs-id");
  await page
    .getByRole("button", { name: "Add icon to selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const restoredField = frame.locator(`[data-cs-id="${fieldId}"]`);
  await expect
    .poll(() =>
      restoredField.evaluate((input) => {
        const el = input as HTMLElement,
          icon = el.parentElement!.querySelector("svg")!,
          rect = el.getBoundingClientRect(),
          style = getComputedStyle(el),
          scale = rect.width / el.offsetWidth;
        return (
          (rect.left +
            (parseFloat(style.paddingLeft) +
              parseFloat(style.borderLeftWidth)) *
              scale -
            icon.getBoundingClientRect().right) /
          scale
        );
      }),
    )
    .toBeGreaterThanOrEqual(8);
  await expect(restoredField.locator("..").locator("svg")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(frame.locator("[data-cs-icon-field]")).toHaveCount(0);
  await expect(restoredField).toHaveCount(1);
});
test("canvas focus and live full-screen preview preserve the editing workspace", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  const before = await page
    .locator('iframe[title="Design canvas"]')
    .getAttribute("style");
  const selected = await page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("[data-cs-selected]")
    .getAttribute("data-cs-id");
  const leftBefore = await page.locator(".left-panel").isVisible();
  await page.getByRole("button", { name: "Focus canvas", exact: true }).click();
  await expect(page.locator(".left-panel")).toBeHidden();
  await expect(page.locator(".right-panel")).toBeHidden();
  await expect(page.locator(".code-panel")).toBeHidden();
  await expect(page.locator(".canvas-toolbar")).toBeVisible();
  await expect(page.locator(".selection-corner")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Preview full screen", exact: true })
    .click();
  const preview = page.locator(
    'iframe[title="Full-screen interactive preview"]',
  );
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("sandbox", "allow-scripts");
  await page
    .getByRole("combobox", { name: "Preview device" })
    .selectOption("mobile");
  await expect(preview).toHaveCSS("width", "375px");
  await expect(preview).toHaveCSS("height", "812px");
  await page.getByRole("button", { name: "Rotate preview" }).click();
  await expect(preview).toHaveCSS("width", "812px");
  await page
    .getByRole("button", { name: "Hide controls", exact: true })
    .click();
  await expect(page.locator(".preview-studio-toolbar")).toBeHidden();
  await page
    .frameLocator('iframe[title="Full-screen interactive preview"]')
    .locator("body")
    .click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(page.locator('iframe[title="Design canvas"]')).toHaveAttribute(
    "style",
    before!,
  );
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .locator("[data-cs-selected]"),
  ).toHaveAttribute("data-cs-id", selected!);
  expect(await page.locator(".left-panel").isVisible()).toBe(leftBefore);
});
test("maximized Monaco preserves draft, selection, formatting and restore height", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  const height = await page.locator(".code-panel").getAttribute("style");
  await page
    .getByRole("button", { name: "Maximize code workspace", exact: true })
    .click();
  await expect(page.locator(".code-panel")).toHaveCSS("height", "1000px");
  await expect(page.locator(".monaco-editor").first()).toBeVisible();
  await page.evaluate(() => {
    const model = window.monaco!.editor.getModels()[0];
    model.setValue(
      model
        .getValue()
        .replace("Your next great idea", "Unapplied fullscreen draft"),
    );
    window
      .monaco!.editor.getEditors()[0]
      .setPosition({ lineNumber: 1, column: 5 });
  });
  await page
    .getByRole("button", { name: "Restore code workspace", exact: true })
    .click();
  await expect(page.locator(".code-panel")).toHaveAttribute("style", height!);
  await page
    .getByRole("button", { name: "Maximize code workspace", exact: true })
    .click();
  expect(
    await page.evaluate(() => window.monaco!.editor.getModels()[0].getValue()),
  ).toContain("Unapplied fullscreen draft");
  expect(
    await page.evaluate(
      () => window.monaco!.editor.getEditors()[0].getPosition()?.column,
    ),
  ).toBe(5);
  await page
    .getByRole("button", { name: "Format source", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Restore code workspace", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Unapplied fullscreen draft" }),
  ).toBeVisible();
});
test("documentation provides offline search, deep links, bookmarks and accessible reading", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Docs", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Expand documentation", exact: true })
    .click();
  await expect(page.locator(".docs-dialog")).toHaveCSS("width", "1600px");
  await page
    .getByRole("textbox", { name: "Search documentation" })
    .fill("Angular Integration");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Angular Integration", exact: true })
    .click();
  await expect(page.locator(".docs-article h1")).toContainText(
    "Angular Integration",
  );
  await expect(
    page.locator(".docs-nav .docs-search-match").first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bookmark guide", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search documentation" }).fill("");
  await page.getByRole("button", { name: "Bookmarks", exact: true }).click();
  await expect(page.locator(".docs-nav [aria-current=page]")).toContainText(
    "Angular Integration",
  );
  await page
    .getByRole("complementary", { name: "On this page", exact: true })
    .getByRole("button", {
      name: "Render the export from a standalone component",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/#docs\/angular\/example$/);
  await page.getByRole("button", { name: "Guides", exact: true }).click();
  await expect(page.locator(".docs-nav")).toBeHidden();
  const audit = await new AxeBuilder({ page })
    .setLegacyMode()
    .options({ iframes: false })
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({
    path: "docs/screenshots/documentation-fullscreen.png",
  });
  await page.keyboard.press("Escape");
  await expect(page.locator(".docs-dialog")).not.toHaveClass(/docs-expanded/);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.goto("/#docs/angular/example");
  await expect(page.locator(".docs-article h1")).toContainText(
    "Angular Integration",
  );
  await expect(
    page.getByRole("button", { name: "Bookmarked", exact: true }),
  ).toBeVisible();
});
test("documentation fits a narrow window and serves bundled visual walkthroughs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page
    .getByRole("button", { name: "Docs", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search documentation" })
    .fill("visual walkthrough");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", {
      name: "Your first screen: visual walkthrough",
      exact: true,
    })
    .click();
  const image = page.locator('.docs-article img[src="/docs/workflow.svg"]');
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  expect(
    await page
      .locator(".docs-dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({ path: "docs/screenshots/documentation-narrow.png" });
});

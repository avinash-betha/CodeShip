import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    () =>
      !localStorage.getItem("codeship-onboarding-v1") &&
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
test("offline documentation, light appearance and selective component exports work together", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Component category", exact: true })
    .selectOption("Navigation");
  await page
    .getByRole("button", { name: "Preview Classic navigation", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Library design preview"]')
      .getByRole("navigation", { name: "classic navigation", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close library preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Application settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Application theme", exact: true })
    .selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "Docs", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Documentation Center", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("glass");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Glassmorphism", exact: true })
    .click();
  await expect(page.locator(".docs-article")).toContainText(
    "reduced transparency",
  );
  const audit = await new AxeBuilder({ page })
    .setLegacyMode()
    .options({ iframes: false })
    .analyze();
  expect(audit.violations).toEqual([]);
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("selective");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Selective Code Export", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Try in the editor", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Export scope", exact: true })
    .selectOption("selection");
  await page
    .getByRole("button", {
      name: "Next.js App Router. TypeScript.",
      exact: false,
    })
    .click();
  await expect(page.locator(".export-file-list")).toContainText(
    "MyComponent.tsx",
  );
  await expect(page.locator(".export-file-list")).not.toContainText(
    "package.json",
  );
  await page
    .getByRole("button", { name: "MyComponent.tsx", exact: true })
    .click();
  await expect(page.locator(".export-file-content")).toContainText(
    "export default function MyComponent",
  );
  await expect(page.locator(".export-file-content")).not.toContainText(
    "use client",
  );
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("glass surfaces and eight resize controls remain editable and undoable", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page.getByText("Glassmorphism Studio", { exact: true }).click();
  await page
    .getByRole("button", { name: "Apply glass effect", exact: true })
    .click();
  const selected = page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("[data-cs-selected]");
  await expect(selected).toHaveCSS(
    "backdrop-filter",
    "blur(18px) saturate(1.4)",
  );
  await expect(page.locator(".selection-corner")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Visual spacing controls", exact: true })
    .click();
  const spacing = await page
    .getByRole("button", { name: "Drag padding", exact: true })
    .boundingBox();
  expect(spacing).toBeTruthy();
  await page.mouse.move(spacing!.x + 10, spacing!.y + 10);
  await page.mouse.down();
  await page.mouse.move(spacing!.x + 30, spacing!.y + 10, { steps: 4 });
  await page.mouse.up();
  await expect(
    page.getByRole("textbox", { name: "padding", exact: true }),
  ).not.toHaveValue("");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .locator("main > div")
      .last(),
  ).toHaveCSS("backdrop-filter", "blur(18px) saturate(1.4)");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator(".floating-tools")).toHaveCount(0);
  await page.getByRole("button", { name: "Edit design", exact: true }).click();
  await expect(page.locator(".floating-tools")).toBeVisible();
});
test("completed twelve-step tours resume at the first new action after upgrade", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "codeship-onboarding-v1",
      JSON.stringify({
        welcomed: true,
        index: 12,
        active: false,
        completed: [
          "project",
          "container",
          "heading",
          "button",
          "field",
          "content",
          "style",
          "mobile",
          "analyze",
          "icon",
          "save",
          "export",
        ],
      }),
    ),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume guided tour", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Shape the space");
});
test("freeform children move, nudge and resize with a locked aspect ratio", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "New project name" })
    .fill("Freeform geometry");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  for (const [name, value] of [
    ["width", "500px"],
    ["height", "400px"],
  ]) {
    const input = page.getByRole("textbox", { name, exact: true });
    await input.fill(value);
    await input.press("Tab");
  }
  await page
    .getByRole("combobox", { name: "Container layout mode" })
    .selectOption("freeform");
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  const frame = page.frameLocator('iframe[title="Design canvas"]'),
    heading = frame.getByRole("heading");
  await expect(heading).toHaveCSS("position", "absolute");
  await expect(heading).toHaveCSS("left", "24px");
  await page.locator(".canvas-input-surface").focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect(heading).toHaveCSS("left", "34px");
  const box = await heading.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + 30, box!.y + 20);
  await page.mouse.down();
  await page.mouse.move(box!.x + 70, box!.y + 50, { steps: 5 });
  await page.mouse.up();
  await expect
    .poll(() => heading.evaluate((el) => parseFloat(getComputedStyle(el).left)))
    .toBeGreaterThan(34);
  for (const [name, value] of [
    ["width", "200px"],
    ["height", "100px"],
  ]) {
    const input = page.getByRole("textbox", { name, exact: true });
    await input.fill(value);
    await input.press("Tab");
  }
  await page
    .getByRole("button", { name: "Lock aspect ratio", exact: true })
    .click();
  const handle = await page
    .getByRole("button", { name: "Resize selected element", exact: true })
    .boundingBox();
  expect(handle).toBeTruthy();
  await page.mouse.move(handle!.x + 4, handle!.y + 4);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 44, handle!.y + 24, { steps: 5 });
  await page.mouse.up();
  const dimensions = await heading.evaluate((el) => ({
    w: el.getBoundingClientRect().width,
    h: el.getBoundingClientRect().height,
  }));
  expect(dimensions.w).toBeGreaterThan(200);
  expect(dimensions.w / dimensions.h).toBeCloseTo(2, 1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(heading).toHaveCSS("width", "200px");
});

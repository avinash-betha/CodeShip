import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("tour finishes through real styling, mobile, analysis, icon, save and export actions", async ({
  page,
}) => {
  await page.addInitScript(
    () =>
      !localStorage.getItem("codeship-onboarding-v1") &&
      localStorage.setItem(
        "codeship-onboarding-v1",
        JSON.stringify({
          welcomed: true,
          index: 5,
          completed: ["project", "container", "heading", "button", "field"],
          active: false,
        }),
      ),
  );
  await page.goto("/");
  await page.getByText("All changes saved").waitFor();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume guided tour", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  const content = page.getByRole("textbox", {
    name: "Element text",
    exact: true,
  });
  await content.fill("My guided design");
  await content.press("Tab");
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("A little personality");
  const width = page.getByRole("textbox", { name: "width", exact: true });
  await width.fill("90%");
  await width.press("Tab");
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("A smaller screen");
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyze responsiveness", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("One icon, your own style");
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Keep what you create");
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await page.getByText("All changes saved").waitFor();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Shape the space");
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page.getByRole("textbox", { name: "width", exact: true }).fill("180px");
  await page.getByRole("textbox", { name: "width", exact: true }).press("Tab");
  const handle = await page
    .getByRole("button", { name: "Resize selected element", exact: true })
    .boundingBox();
  expect(handle).toBeTruthy();
  await page.mouse.move(handle!.x + 4, handle!.y + 4);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 28, handle!.y + 28, { steps: 5 });
  await page.mouse.up();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Choose how the layout flows");
  await page
    .getByRole("combobox", { name: "Container layout mode" })
    .selectOption("flex");
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Give a surface a clear style");
  await page.getByText("Style presets", { exact: true }).click();
  await page
    .getByRole("button", { name: "Apply Minimalistic style", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Ship only the piece");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Export code", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Export scope", exact: true })
    .selectOption("selection");
  await expect(
    page.getByRole("dialog").locator(".export-file-list"),
  ).toContainText("index.html");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Ready to ship");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Export code", exact: true })
    .click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export HTML Component", exact: true })
    .click();
  await downloading;
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search library", exact: true })
    .fill("Contact form");
  await page
    .getByRole("button", { name: "Insert Contact form", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Tune the breathing room");
  await page
    .getByRole("button", { name: "Visual spacing controls", exact: true })
    .click();
  await expect(
    page.frameLocator('iframe[title="Design canvas"]').locator("form").last(),
  ).toBeVisible();
  const paddingHandle = await page
    .getByRole("button", { name: "Drag padding", exact: true })
    .boundingBox();
  expect(paddingHandle).toBeTruthy();
  await page.mouse.move(paddingHandle!.x + 8, paddingHandle!.y + 8);
  await page.mouse.down();
  await page.mouse.move(paddingHandle!.x + 24, paddingHandle!.y + 8, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toContainText("Give your screen a way around");
  await page
    .getByRole("textbox", { name: "Search library", exact: true })
    .fill("Classic navigation");
  await page
    .getByRole("button", { name: "Insert Classic navigation", exact: true })
    .click();
  await page.getByRole("button", { name: "Focus canvas", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview full screen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await page.getByRole("button", { name: "Docs", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("Angular Integration");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Angular Integration", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("codeship-onboarding-v1")!).index,
      ),
    )
    .toBe(22);
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("codeship-onboarding-v1")!),
  );
  expect(progress.completed).toHaveLength(22);
  expect(progress.index).toBe(22);
  expect(progress.active).toBe(false);
  await page
    .getByRole("button", { name: "Close dialog · Back to editor", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial" }),
  ).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await expect(
    page.getByText("100% of the first-build tour completed"),
  ).toBeVisible();
});

test("welcome, learning and icon factory controls pass automated accessibility checks", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  const audit = async () => {
    const result = await new AxeBuilder({ page })
      .setLegacyMode()
      .options({ iframes: false })
      .analyze();
    expect(result.violations).toEqual([]);
  };
  await audit();
  await page
    .getByRole("button", { name: "Skip welcome and explore", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await audit();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await audit();
});

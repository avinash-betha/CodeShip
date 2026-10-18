import { test, expect } from "@playwright/test";

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

test("existing canvas icons move into buttons, reposition, undo and survive reload", async ({
  page,
}) => {
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose Rocket icon", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const iconId = await frame
    .locator("svg[data-cs-icon]")
    .last()
    .getAttribute("data-cs-id");
  await page.getByRole("button", { name: "Add Button", exact: true }).click();
  const button = frame.locator("button").last();
  const buttonId = await button.getAttribute("data-cs-id");
  const label = await button.innerText();
  const icon = frame.locator(`[data-cs-id="${iconId}"]`);
  const sourceBox = await icon.boundingBox();
  await page.mouse.click(
    sourceBox!.x + sourceBox!.width / 2,
    sourceBox!.y + sourceBox!.height / 2,
  );
  await page
    .getByRole("combobox", { name: "Button for selected icon", exact: true })
    .selectOption(buttonId!);
  await page
    .getByRole("combobox", { name: "Selected icon placement", exact: true })
    .selectOption("after-text");
  await page
    .getByRole("button", { name: "Apply icon placement", exact: true })
    .click();
  await expect(button.locator(`svg[data-cs-id="${iconId}"]`)).toHaveCount(1);
  await expect(button).toHaveText(label);
  await expect(button.locator(":scope > :last-child")).toHaveAttribute(
    "data-cs-id",
    iconId!,
  );
  for (const placement of [
    "above-text",
    "below-text",
    "icon-only",
    "before-text",
  ]) {
    await page
      .getByRole("combobox", { name: "Selected icon placement", exact: true })
      .selectOption(placement);
    await page
      .getByRole("button", { name: "Apply icon placement", exact: true })
      .click();
    await expect(button).toHaveAttribute("data-cs-icon-layout", placement);
    await expect(button.locator("span")).toHaveCSS(
      "display",
      placement === "icon-only" ? "none" : "block",
    );
    if (placement === "icon-only")
      await expect(button).toHaveAttribute("aria-label", label);
  }
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(button.locator("svg")).toHaveCount(0);
  await expect(icon).toHaveCount(1);
  const dropBox = await button.boundingBox();
  await page
    .getByRole("group", { name: "Canvas editing surface", exact: true })
    .evaluate(
      (surface, args) => {
        const transfer = new DataTransfer();
        transfer.setData(
          "application/codeship",
          JSON.stringify({ kind: "move", id: args.id }),
        );
        surface.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
            clientX: args.x,
            clientY: args.y,
          }),
        );
      },
      { id: iconId, x: dropBox!.x + 6, y: dropBox!.y + dropBox!.height / 2 },
    );
  await expect(button.locator(`svg[data-cs-id="${iconId}"]`)).toHaveCount(1);
  await expect(button).toHaveAttribute("data-cs-icon-layout", "before-text");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(button.locator("svg")).toHaveCount(0);
  // Alt-drag exercises the same pointer path used by freely positioned icons.
  const start = await icon.boundingBox(),
    end = await button.boundingBox();
  await page.keyboard.down("Alt");
  await page.mouse.move(
    start!.x + start!.width / 2,
    start!.y + start!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(end!.x + end!.width * 0.75, end!.y + end!.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await page.keyboard.up("Alt");
  await expect(button.locator(`svg[data-cs-id="${iconId}"]`)).toHaveCount(1);
  await expect(button).toHaveText(label);
  await page.getByText("All changes saved").waitFor();
  await page.screenshot({ path: "docs/screenshots/button-icon-placement.png" });
  await page.reload();
  await expect(
    frame.locator(`[data-cs-id="${buttonId}"] > svg[data-cs-id="${iconId}"]`),
  ).toHaveCount(1);
});

test("single Docs entry and new app branding load offline", async ({
  page,
}) => {
  const header = page.getByRole("banner");
  await expect(
    header.getByRole("button", { name: "Docs", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Open documentation", exact: true }),
  ).toHaveCount(0);
  await expect(header.locator(".app-brand-mark img")).toBeVisible();
  expect(
    await header
      .locator(".app-brand-mark img")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBe(64);
  await header.getByRole("button", { name: "Docs", exact: true }).click();
  await expect(page.locator(".docs-brand-symbol img")).toBeVisible();
  expect(
    await page
      .locator(".docs-brand-symbol img")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBe(64);
});

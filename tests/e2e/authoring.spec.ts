import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
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
async function createBlank(page: Page, name: string): Promise<void> {
  await page.goto("/");
  await page.getByText("All changes saved").waitFor();
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page.getByRole("textbox", { name: "New project name" }).fill(name);
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
test("project creation, rename, duplication, deletion and portable JSON stay consistent", async ({
  page,
}) => {
  await createBlank(page, "Project lifecycle");
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Rename current project" })
    .fill("Renamed workspace");
  await page
    .getByRole("textbox", { name: "Rename current project" })
    .press("Tab");
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await page.getByText("All changes saved").waitFor();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Project JSON", exact: true }).click();
  const jsonDownload = await downloadEvent;
  const json = JSON.parse(
    await readFile((await jsonDownload.path())!, "utf8"),
  ) as { name: string; schemaVersion: number };
  expect(json.name).toBe("Renamed workspace");
  expect(json.schemaVersion).toBe(1);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Duplicate project Renamed workspace",
      exact: true,
    })
    .click();
  await page
    .locator(".project-list-name")
    .filter({ hasText: "Renamed workspace (copy)" })
    .click();
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Delete project Renamed workspace (copy)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Delete project Renamed workspace (copy)",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Rename current project" }),
  ).toHaveValue("Untitled project");
  await expect(
    page.getByRole("button", {
      name: "Delete project Renamed workspace",
      exact: true,
    }),
  ).toBeVisible();
});
test("inline text, reusable blocks and pointer resizing edit the shared document", async ({
  page,
}) => {
  await createBlank(page, "Advanced authoring");
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  const heading = frame.getByRole("heading", { name: "Your next great idea" });
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.dblclick(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page
    .getByRole("textbox", { name: "Edit canvas text" })
    .fill("Inline edit verified");
  await page.getByRole("textbox", { name: "Edit canvas text" }).press("Enter");
  await expect(
    frame.getByRole("heading", { name: "Inline edit verified" }),
  ).toBeVisible();
  await page.getByText("Save as reusable block", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Reusable block name" })
    .fill("Title block");
  await page
    .getByRole("button", { name: "Save to blocks", exact: true })
    .click();
  await page.getByRole("button", { name: "Title block", exact: true }).click();
  await expect(
    frame.getByRole("heading", { name: "Inline edit verified" }),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  const width = page.getByRole("textbox", { name: "width", exact: true }),
    height = page.getByRole("textbox", { name: "height", exact: true });
  await width.fill("240px");
  await width.press("Tab");
  await height.fill("120px");
  await height.press("Tab");
  await page.getByRole("button", { name: "Toggle snap grid" }).click();
  const handle = await page
    .getByRole("button", { name: "Resize selected element" })
    .boundingBox();
  expect(handle).toBeTruthy();
  await page.mouse.move(
    handle!.x + handle!.width / 2,
    handle!.y + handle!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    handle!.x + handle!.width / 2 + 40,
    handle!.y + handle!.height / 2 + 24,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect
    .poll(async () => parseInt(await width.inputValue()))
    .toBeGreaterThan(240);
  expect(parseInt(await width.inputValue()) % 8).toBe(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(frame.locator("main > div").last()).toHaveCSS("width", "240px");
  await expect(frame.locator("main > div").last()).toHaveCSS("height", "120px");
});

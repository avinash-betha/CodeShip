import { test, expect } from "@playwright/test";
import { components, baseCss } from "../../packages/component-registry";
import { createProject, element } from "../../packages/document-model";
import { canvasDocument } from "../../packages/codegen-core";
import {
  dataTable,
  chat,
  kanban,
} from "../../packages/component-registry/modern";
import { modernCss } from "../../packages/component-registry/modern-styles";
test("every component fits mobile, tablet and desktop document widths", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const component of components) {
    const p = createProject(component.name),
      content = component.create();
    p.pages[0].root = content.root;
    p.pages[0].css = baseCss + "\n" + content.css;
    for (const width of [320, 768, 1200]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(canvasDocument(p));
      const scroll = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scroll, component.name + " at " + width).toBeLessThanOrEqual(
        width + 1,
      );
    }
  }
});
test("local table, tags, chat, dialogs and kanban interactions operate without services", async ({
  page,
}) => {
  const p = createProject("Local behaviors");
  p.pages[0].root = element("main", "", {}, [
    dataTable(),
    chat(),
    kanban(),
    components.find((c) => c.id === "form-tags")!.create().root,
    components.find((c) => c.id === "feedback-dialog")!.create().root,
  ]);
  p.pages[0].css = baseCss + "\n" + modernCss;
  await page.goto("/");
  await page.setContent(canvasDocument(p, { interactive: true }));
  const table = page.locator(".ui-data-table");
  await expect(table.locator("tbody tr:visible")).toHaveCount(4);
  await table.getByRole("searchbox").fill("Maya");
  await expect(table.locator("tbody tr:visible")).toHaveCount(1);
  await table.getByRole("button", { name: "Next", exact: true }).click();
  await expect(table.locator("tbody tr:visible")).toHaveCount(1);
  await table.getByRole("searchbox").fill("");
  await table.getByRole("button", { name: "Name", exact: true }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Alex Morgan");
  const chatBox = page.locator(".ui-chat");
  await chatBox
    .locator("input[name=message]")
    .fill("Saved only in this preview");
  await chatBox.getByRole("button", { name: "Send", exact: true }).click();
  await expect(chatBox.locator(".ui-chat-messages")).toContainText(
    "Saved only in this preview",
  );
  await page
    .getByRole("textbox", { name: "Add a tag", exact: true })
    .fill("Accessible");
  await page.getByRole("button", { name: "Add tag", exact: true }).click();
  await expect(page.getByRole("list", { name: "Selected tags" })).toContainText(
    "Accessible",
  );
  await page
    .getByRole("button", { name: "Remove Accessible", exact: true })
    .click();
  await expect(
    page.getByRole("list", { name: "Selected tags" }).locator("li"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const board = page.locator(".ui-kanban"),
    first = board.locator(".ui-kanban-card").first(),
    destination = board.locator(".ui-kanban-column").last();
  const id = await first.getAttribute("data-cs-id");
  await first.hover();
  await page.mouse.down();
  await destination.locator("h3").hover();
  await destination.locator("h3").hover();
  await page.mouse.up();
  await expect(destination.locator('[data-cs-id="' + id + '"]')).toHaveCount(1);
});

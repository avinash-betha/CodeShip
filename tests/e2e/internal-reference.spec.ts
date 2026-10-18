import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

test("standalone internal HTML works offline with search, copy, theme and print", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedText = text;
        },
      },
    });
    window.print = () => {
      document.documentElement.dataset.printed = "true";
    };
  });
  await context.setOffline(true);
  await page.goto(
    pathToFileURL(resolve("docs/internal/developer-guide.html")).href,
  );
  await expect(
    page.getByRole("heading", {
      name: "Build, maintain and release CodeShip.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(8);
  await page
    .getByRole("searchbox", { name: "Find an internal guide", exact: true })
    .fill("WIN_CSC_KEY_PASSWORD signing");
  await expect(page.locator("article:visible")).toHaveCount(1);
  await expect(page.locator("#build-windows")).toBeVisible();
  const copy = page.locator("#build-windows button[data-copy]").first();
  const codeId = await copy.getAttribute("data-copy");
  const expected = await page.locator("#" + codeId).textContent();
  await copy.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-copied-text",
    expected!,
  );
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Print reference", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
  await page
    .getByRole("searchbox", { name: "Find an internal guide", exact: true })
    .fill("");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "docs/screenshots/internal-developer-reference.png",
  });
});

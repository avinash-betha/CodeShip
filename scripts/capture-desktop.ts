import { _electron, expect as baseExpect } from "@playwright/test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const expect = baseExpect.configure({ timeout: 15000 });
const fixture = await mkdtemp(join(tmpdir(), "codeship-desktop-capture-"));
const application = await _electron.launch({
  executablePath: resolve("release/win-unpacked/CodeShip.exe"),
  env: {
    ...process.env,
    CODESHIP_DESKTOP_SMOKE: "1",
    CODESHIP_TEST_USER_DATA: join(fixture, "user-data"),
    CODESHIP_TEST_PROJECTS: join(fixture, "projects"),
  },
});
async function capture(name: string) {
  const page = await application.firstWindow();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))),
      ),
  );
  const png = await application.evaluate(async ({ BrowserWindow }) =>
    (
      await BrowserWindow.getAllWindows()[0].webContents.capturePage(
        undefined,
        { stayHidden: true, stayAwake: true },
      )
    )
      .toPNG()
      .toString("base64"),
  );
  await writeFile("docs/screenshots/" + name, Buffer.from(png, "base64"));
}
try {
  const page = await application.firstWindow();
  page.setDefaultTimeout(15000);
  await expect(page.locator(".studio-shell")).toHaveCSS("display", "flex");
  await page
    .getByRole("button", { name: "Skip welcome and explore", exact: true })
    .click();
  await page.getByText("All changes saved").waitFor();
  await page
    .getByRole("button", { name: "Application settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Application theme", exact: true })
    .selectOption("light");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search library", exact: true })
    .fill("Settings");
  await page
    .getByRole("button", { name: "Load Settings template", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await capture("desktop-settings-native.png");
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await expect(page.locator('iframe[title="Design canvas"]')).toHaveJSProperty(
    "clientWidth",
    375,
  );
  await expect(page.locator(".artboard-label")).toContainText("375 × 812");
  await expect
    .poll(() =>
      page
        .frameLocator('iframe[title="Design canvas"]')
        .locator("html")
        .evaluate((el) => el.scrollWidth),
    )
    .toBeLessThanOrEqual(375);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page
    .frameLocator('iframe[title="Interactive preview"]')
    .locator("form")
    .scrollIntoViewIfNeeded();
  await capture("mobile-settings-native.png");
  await page
    .getByRole("button", { name: "Docs", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("glass");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Glassmorphism", exact: true })
    .click();
  await expect(page.locator(".docs-article h1")).toHaveText("Glassmorphism");
  await capture("documentation-native.png");
  console.log(
    "Captured native desktop/mobile Settings and Documentation Center. Fixture: " +
      fixture,
  );
} finally {
  await application
    .evaluate(({ BrowserWindow }) => {
      for (const window of BrowserWindow.getAllWindows()) window.destroy();
    })
    .catch(() => undefined);
  await application.close().catch(() => undefined);
}

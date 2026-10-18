import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { templates, baseCss } from "../packages/component-registry";
import { createProject } from "../packages/document-model";
import { canvasDocument } from "../packages/codegen-core";
const directory = "docs/screenshots";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
  });
  await page.goto("http://127.0.0.1:4200/");
  await page
    .getByRole("heading", { name: "Your next idea starts here.", exact: true })
    .waitFor();
  await page.screenshot({ path: directory + "/welcome.png" });
  await page
    .getByRole("button", { name: "Skip welcome and explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose Rocket icon", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Icon style", exact: true })
    .selectOption("duotone");
  await page.screenshot({ path: directory + "/icon-factory.png" });
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "Load Settings template", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Desktop viewport", exact: true })
    .click();
  await page.screenshot({ path: directory + "/settings-editor.png" });
  const screen = templates.find((t) => t.id === "settings")!.create(),
    p = createProject("Settings");
  p.pages[0].root = screen.root;
  p.pages[0].css = baseCss + "\n" + screen.css;
  const output = await browser.newPage({
    viewport: { width: 1200, height: 900 },
  });
  await output.setContent(canvasDocument(p));
  await output.screenshot({
    path: directory + "/settings-desktop.png",
    fullPage: true,
  });
  const landing = templates[0].create();
  p.pages[0].root = landing.root;
  p.pages[0].css = baseCss + "\n" + landing.css;
  await output.setViewportSize({ width: 375, height: 812 });
  await output.setContent(canvasDocument(p));
  await output.screenshot({
    path: directory + "/landing-mobile.png",
    fullPage: true,
  });
  p.pages[0].root = screen.root;
  await output.setContent(canvasDocument(p));
  await output.screenshot({
    path: directory + "/settings-mobile.png",
    fullPage: true,
  });
  console.log(
    "Saved welcome, factory, editor and standalone responsive screenshots in " +
      directory,
  );
} finally {
  await browser.close();
}

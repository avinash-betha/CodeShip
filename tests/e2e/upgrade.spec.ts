import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { templates, baseCss } from "../../packages/component-registry";
import { createProject } from "../../packages/document-model";
import { canvasDocument } from "../../packages/codegen-core";
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440];
async function skipWelcome(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem("codeship-onboarding-v1"))
      localStorage.setItem(
        "codeship-onboarding-v1",
        JSON.stringify({
          welcomed: true,
          index: 0,
          completed: [],
          active: false,
        }),
      );
  });
  await page.goto("/");
  await page.getByText("All changes saved").waitFor();
}

test("every shipped screen fits eight actual viewport widths with usable form geometry", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const template of templates) {
    const p = createProject(template.name),
      content = template.create();
    p.pages[0].root = content.root;
    p.pages[0].css = baseCss + "\n" + content.css;
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(canvasDocument(p));
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        fields: Array.from(
          document.querySelectorAll(
            "label:has(input:not([type=checkbox]):not([type=radio]):not([type=color]):not([type=range]))",
          ),
        )
          .filter(
            (label) =>
              label.querySelector("input")!.getClientRects().length > 0,
          )
          .map((label) => {
            const input = label.querySelector("input")!,
              span = label.querySelector("span"),
              style = getComputedStyle(label),
              box = input.getBoundingClientRect();
            return {
              gap: parseFloat(style.rowGap),
              height: box.height,
              right: box.right,
              width: box.width,
              labelBottom: span?.getBoundingClientRect().bottom,
              top: box.top,
            };
          }),
      }));
      expect(geometry.width, template.name).toBe(width);
      expect(
        geometry.scroll,
        `${template.name} at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
      expect(
        geometry.body,
        `${template.name} body at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
      for (const field of geometry.fields) {
        expect(field.gap).toBeGreaterThanOrEqual(8);
        expect(field.height).toBeGreaterThanOrEqual(44);
        expect(field.right).toBeLessThanOrEqual(width);
        expect(
          field.width,
          `${template.name} field width at ${width}px`,
        ).toBeGreaterThan(150);
        if (field.labelBottom !== undefined)
          expect(field.top - field.labelBottom).toBeGreaterThanOrEqual(7.9);
      }
    }
  }
});

test("canvas device controls change real layout, preserve zoom semantics and rotate the viewport", async ({
  page,
}) => {
  await skipWelcome(page);
  const frame = page.frameLocator('iframe[title="Design canvas"]');
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await expect(frame.locator(".f-board-columns")).toHaveCSS(
    "grid-template-columns",
    /^[\d.]+px$/,
  );
  const viewport = page.getByRole("spinbutton", { name: "Viewport width" });
  for (const width of widths) {
    await viewport.fill(String(width));
    await viewport.press("Tab");
    await expect(
      page.locator('iframe[title="Design canvas"]'),
    ).toHaveJSProperty("clientWidth", width);
    const actual = await frame.locator("body").evaluate((el) => ({
      width: el.ownerDocument.defaultView!.innerWidth,
      scroll: el.ownerDocument.documentElement.scrollWidth,
    }));
    expect(actual.width).toBe(width);
    expect(actual.scroll).toBeLessThanOrEqual(width + 1);
  }
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect(viewport).toHaveValue("375");
  await page
    .getByRole("button", { name: "Rotate viewport", exact: true })
    .click();
  await expect(viewport).toHaveValue("812");
  await expect(page.locator('iframe[title="Design canvas"]')).toHaveJSProperty(
    "clientHeight",
    375,
  );
  await page
    .getByRole("button", { name: "Rotate viewport", exact: true })
    .click();
  await expect(viewport).toHaveValue("375");
});

test("icons can be customized, vector-edited, saved, reopened and exported", async ({
  page,
}) => {
  await skipWelcome(page);
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose Rocket icon", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Icon style", exact: true })
    .selectOption("duotone");
  await page.getByLabel("Icon primary color", { exact: true }).fill("#577a45");
  await page.getByLabel("Two-color gradient", { exact: true }).check();
  await page
    .getByRole("textbox", { name: "Icon accessible label", exact: true })
    .fill("Launch our product");
  await page
    .getByRole("textbox", { name: "Icon accessible label", exact: true })
    .press("Tab");
  await page.getByRole("tab", { name: "Vector studio", exact: true }).click();
  await page
    .getByRole("button", { name: "Add vector circle", exact: true })
    .click();
  await expect(page.locator(".factory-preview.dark circle")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Undo vector edit", exact: true })
    .click();
  await expect(page.locator(".factory-preview.dark circle")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Redo vector edit", exact: true })
    .click();
  await expect(page.locator(".factory-preview.dark circle")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Icon variant name", exact: true })
    .fill("My launch mark");
  await page
    .getByRole("button", { name: "Save to my icons", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Icon export format", exact: true })
    .selectOption("png");
  const pngEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download icon", exact: true })
    .click();
  const png = await pngEvent;
  const bytes = await readFile((await png.path())!);
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  await page
    .getByRole("combobox", { name: "Icon export format", exact: true })
    .selectOption("svg");
  const svgEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download icon", exact: true })
    .click();
  const svg = await svgEvent;
  expect(await readFile((await svg.path())!, "utf8")).toContain(
    "Launch our product",
  );
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByText("All changes saved").waitFor();
  await page.reload();
  await page.getByText("All changes saved").waitFor();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("img", { name: "Launch our product", exact: true }),
  ).toBeAttached();
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await page.getByRole("tab", { name: "My icons", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Icon browser", exact: true })
      .getByRole("button", { name: "My launch mark", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Icon browser", exact: true })
    .getByRole("button", { name: "My launch mark", exact: true })
    .click();
  await expect(page.locator(".factory-preview.dark circle")).toHaveCount(1);
  await page.getByRole("tab", { name: "Vector studio", exact: true }).click();
  await page
    .getByRole("textbox", { name: "SVG source", exact: true })
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
  await page
    .getByRole("button", { name: "Apply SVG source", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("not allowed");
  await expect(page.locator(".factory-preview.dark circle")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "SVG source", exact: true })
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" stroke="#123456" role="img" aria-label="Orbit mark"><circle cx="12" cy="12" r="8" fill="none"/></svg>',
    );
  await page
    .getByRole("button", { name: "Apply SVG source", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Icon accessible label", exact: true }),
  ).toHaveValue("Orbit mark");
  await expect(
    page.getByRole("spinbutton", { name: "Icon size", exact: true }),
  ).toHaveValue("48");
  await page
    .getByRole("slider", { name: "Icon opacity", exact: true })
    .press("ArrowLeft");
  await expect(page.locator(".factory-preview.dark > svg")).toHaveAttribute(
    "aria-label",
    "Orbit mark",
  );
  await expect(page.locator(".factory-preview.dark > svg")).toHaveAttribute(
    "stroke",
    "#123456",
  );
  await page
    .getByRole("combobox", { name: "Icon export format", exact: true })
    .selectOption("png");
  const importedPngEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download icon", exact: true })
    .click();
  const importedPng = await importedPngEvent;
  const importedBytes = await readFile((await importedPng.path())!);
  expect(importedBytes.readUInt32BE(16)).toBe(144);
  expect(importedBytes.readUInt32BE(20)).toBe(144);
});

test("first-run welcome and action-aware tutorial support skipping, resuming and persisted completion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Your next idea starts here.",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Take the guided tour", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("A fresh place to start");
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "New project name" })
    .fill("My tutorial");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Give your layout a home");
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Say something with a heading");
  await page
    .getByRole("button", { name: "Continue later", exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume guided tour", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Say something with a heading");
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Add your first action");
  await page.getByRole("button", { name: "Add Button", exact: true }).click();
  await page.getByRole("button", { name: "Add Input", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Guided tutorial", exact: true }),
  ).toContainText("Make the words your own");
  await page
    .getByRole("button", { name: "Pause tutorial", exact: true })
    .click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("codeship-onboarding-v1")!),
  );
  expect(saved.completed).toEqual([
    "project",
    "container",
    "heading",
    "button",
    "field",
  ]);
  expect(saved.index).toBe(5);
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search Learning Center", exact: true })
    .fill("Icon Factory");
  await expect(page.locator(".learning-grid article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Try it in the editor", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Icon Factory.", exact: true }),
  ).toBeVisible();
});

test("editor, welcome, learning center and icon factory fit a phone-sized application viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  const noOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      body: document.documentElement.scrollWidth,
      dialog: document.querySelector("dialog")!.scrollWidth,
      client: document.querySelector("dialog")!.clientWidth,
    }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.width + 1);
    expect(dimensions.dialog).toBeLessThanOrEqual(dimensions.client + 1);
  };
  await noOverflow();
  await page
    .getByRole("button", { name: "Skip welcome and explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Icon Factory", exact: true }).click();
  await noOverflow();
  await page
    .getByRole("button", { name: "Choose Home icon", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Insert into canvas", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "Learning Center", exact: true })
    .click();
  await noOverflow();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "Toggle library panel", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add Container", exact: true }),
  ).toBeVisible();
});

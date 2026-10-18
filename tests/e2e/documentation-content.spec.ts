import { test, expect, type Page } from "@playwright/test";
import { docArticles } from "../../apps/studio/src/docs-registry";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "codeship-onboarding-v1",
      JSON.stringify({
        welcomed: true,
        index: 0,
        completed: [],
        active: false,
      }),
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          localStorage.setItem("docs-test-clipboard", text);
        },
      },
    });
  });
  await page.goto("/");
  await page.getByText("All changes saved", { exact: true }).waitFor();
});

async function openArticle(page: Page, id: string, section = "introduction") {
  await page.evaluate((hash) => {
    location.hash = hash;
  }, `#docs/${id}/${section}`);
  await expect(page.locator(".docs-article h1")).toHaveText(
    docArticles.find((a) => a.id === id)!.title,
  );
}

async function storedProjects(page: Page) {
  return page.evaluate(
    () =>
      new Promise<string>((resolve, reject) => {
        const request = indexedDB.open("codeship-studio", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const read = db
            .transaction("projects", "readonly")
            .objectStore("projects")
            .getAll();
          read.onsuccess = () => {
            db.close();
            resolve(JSON.stringify(read.result));
          };
          read.onerror = () => {
            db.close();
            reject(read.error);
          };
        };
      }),
  );
}

test("every bundled article renders its full content and exact copyable examples", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const article of docArticles) {
    await openArticle(page, article.id);
    const content = page.locator(".docs-article");
    await expect(content.locator("section[data-section]")).toHaveCount(
      article.sections.length,
    );
    const code = article.sections.flatMap((s) => (s.code ? [s.code.text] : []));
    await expect(content.locator(".docs-code code")).toHaveText(code);
    for (const section of article.sections) {
      await expect(
        content.locator(`[data-section="${section.id}"] h2`),
      ).toContainText(section.title);
    }
  }
  expect(errors).toEqual([]);
  await openArticle(page, "components");
  await page
    .getByRole("button", { name: "Expand documentation", exact: true })
    .click();
  await page.screenshot({
    path: "docs/screenshots/documentation-components.png",
  });
  await page.locator('[data-section="steps"]').scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "docs/screenshots/documentation-components-tutorial.png",
  });
});

test("documentation search preserves word boundaries, code copy and earlier section links", async ({
  page,
}) => {
  await openArticle(page, "glass");
  const intro = await page.locator(".docs-intro").textContent();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("glass");
  await expect(page.locator(".docs-intro")).toHaveText(intro!);
  await expect(
    page.locator(".docs-article [data-section=where]"),
  ).toContainText("Glassmorphism Studio");
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("my-component.component.ts");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Angular Integration", exact: true })
    .click();
  const expected = docArticles
    .find((a) => a.id === "angular")!
    .sections.find((s) => s.id === "example")!.code!.text;
  await page
    .locator('[data-section="example"]')
    .getByRole("button", {
      name: "Copy code · typescript example",
      exact: true,
    })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("docs-test-clipboard")),
    )
    .toBe(expected);
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("docs-test-clipboard")),
    )
    .toMatch(/#docs\/angular\//);
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("");
  await openArticle(page, "angular", "existing-app");
  await expect(page).toHaveURL(/#docs\/angular\/example$/);
  await expect(page.locator(".docs-toc button.active")).toContainText(
    "Render the export",
  );
  const search = page.getByRole("textbox", {
    name: "Search documentation",
    exact: true,
  });
  const nav = page.getByRole("navigation", { name: "Documentation topics" });
  await search.fill("FAQ");
  await expect(
    nav.getByRole("button", {
      name: "Frequently asked questions",
      exact: true,
    }),
  ).toBeVisible();
  await search.fill("Visual Studio");
  await expect(
    nav.getByRole("button", {
      name: "Understanding the editor and selection",
      exact: true,
    }),
  ).toBeVisible();
});

test("documentation actions open relevant workflows and retain the saved design", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Element name", exact: true })
    .fill("Keep this design");
  await page.getByRole("textbox", { name: "Element name", exact: true }).blur();
  await page.getByText("All changes saved", { exact: true }).waitFor();
  const original = await storedProjects(page);
  const actions = [...new Set(docArticles.map((a) => a.action))];
  for (const action of actions) {
    const article = docArticles.find((a) => a.action === action)!;
    await openArticle(page, article.id);
    await page
      .getByRole("button", { name: "Try in the editor", exact: true })
      .click();
    await expect(page.locator("cs-documentation")).toHaveCount(0);
    if (action === "components" || action === "templates") {
      await expect(
        page.getByRole("tab", { name: "Insert", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByRole("combobox", { name: "Component category", exact: true }),
      ).toHaveValue("All");
    } else if (action === "layers") {
      await expect(
        page.getByRole("tab", { name: "Layers", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
    } else if (["design", "motion", "html-inspector"].includes(action)) {
      await expect(
        page
          .getByRole("tablist", { name: "Inspector", exact: true })
          .getByRole("tab", {
            name:
              action === "html-inspector"
                ? "HTML"
                : action === "motion"
                  ? "Motion"
                  : "Design",
            exact: true,
          }),
      ).toHaveAttribute("aria-selected", "true");
    } else if (action === "icons")
      await expect(
        page.getByRole("textbox", { name: "Search icons", exact: true }),
      ).toBeVisible();
    else if (action === "export")
      await expect(
        page.getByRole("combobox", { name: "Export scope", exact: true }),
      ).toBeVisible();
    else if (action === "projects")
      await expect(
        page.getByRole("textbox", { name: "New project name", exact: true }),
      ).toBeVisible();
    else if (action === "import")
      await expect(
        page.getByRole("textbox", { name: "Import HTML source", exact: true }),
      ).toBeVisible();
    else if (action === "settings")
      await expect(
        page.getByRole("combobox", { name: "Application theme", exact: true }),
      ).toBeVisible();
    else if (action === "tutorial")
      await expect(
        page.getByRole("region", { name: "Guided tutorial", exact: true }),
      ).toBeVisible();
    else if (action === "responsive")
      await expect(
        page.getByText("A better fit, at every size.", { exact: true }),
      ).toBeVisible();
    else if (action === "focus-canvas")
      await expect(page.locator(".studio-shell")).toHaveClass(/canvas-focused/);
    else if (action === "code")
      await expect(
        page.locator("cs-code-workspace .code-content"),
      ).toBeVisible();
    else if (action === "full-preview")
      await expect(
        page.getByRole("region", { name: "Full-screen preview", exact: true }),
      ).toBeVisible();
    expect(await storedProjects(page), action).toBe(original);
    await page.keyboard.press("Escape");
  }
});

test("customer documentation excludes internal guides and app-owned long dashes", async ({
  page,
}) => {
  await openArticle(page, "components");
  await expect(page.locator(".docs-subbar")).toContainText("37 guides");
  await expect(
    page.getByRole("navigation", { name: "Documentation topics" }),
  ).not.toContainText("Developer");
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("WIN_CSC_KEY_PASSWORD");
  await expect(page.locator(".docs-empty")).toContainText("No guides found");
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("");
  expect(await page.locator("cs-documentation").innerText()).not.toMatch(
    /[—–]/,
  );
  await page
    .getByRole("button", { name: "Close dialog · Back to editor", exact: true })
    .click();
  await page.evaluate(() => {
    localStorage.setItem("codeship-docs-last", "build-windows");
    localStorage.setItem(
      "codeship-docs-v1-bookmarks",
      JSON.stringify(["build-windows", "components"]),
    );
  });
  await page.goto("/#docs/build-windows/installer");
  await expect(page.locator(".docs-article h1")).toHaveText(
    "What is CodeShip?",
  );
  await expect(page).toHaveURL(/#docs\/introduction\/introduction$/);
  await page.getByRole("button", { name: "Bookmarks", exact: true }).click();
  await expect(page.locator(".docs-nav button.active")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Documentation topics" })
      .getByRole("button", { name: "Components", exact: true }),
  ).toBeVisible();
});

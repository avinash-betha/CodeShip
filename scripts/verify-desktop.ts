import { _electron, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 15000 });
import { createRequire } from "node:module";
import { mkdtemp, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const require = createRequire(import.meta.url);
const testRoot = await mkdtemp(join(tmpdir(), "codeship-desktop-verify-"));
const executable =
  process.env["CODESHIP_PACKAGED_EXE"] ?? (require("electron") as string);
console.log("Launching Electron verification: " + testRoot);
const application = await _electron.launch({
  timeout: 30000,
  executablePath: executable,
  args: process.env["CODESHIP_PACKAGED_EXE"]
    ? []
    : [resolve("dist/desktop/main.cjs")],
  env: {
    ...process.env,
    CODESHIP_TEST_USER_DATA: join(testRoot, "user-data"),
    CODESHIP_TEST_PROJECTS: join(testRoot, "projects"),
    CODESHIP_DESKTOP_SMOKE: "1",
  },
});
console.log("Electron connected.");
console.log(
  "Window state:",
  await application.evaluate(({ BrowserWindow, app }) => ({
    ready: app.isReady(),
    windows: BrowserWindow.getAllWindows().map((w) => ({
      title: w.title,
      url: w.webContents.getURL(),
    })),
  })),
);
try {
  const page = await application.firstWindow();
  // Hosted Windows desktops can be 1024px wide, where status text is intentionally hidden.
  await page.setViewportSize({ width: 1600, height: 1000 });
  await expect(page.locator(".studio-shell")).toHaveCSS("display", "flex");
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Docs", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Open documentation", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator(".app-brand-mark img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(64);
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: "Skip welcome and explore", exact: true })
    .click();
  await page.getByText("All changes saved").waitFor();
  const security = await application.evaluate(({ BrowserWindow }) => {
    const contents = BrowserWindow.getAllWindows()[0]
      .webContents as unknown as {
      getLastWebPreferences: () => {
        sandbox: boolean;
        nodeIntegration: boolean;
        contextIsolation: boolean;
      };
    };
    const preferences = contents.getLastWebPreferences();
    return {
      sandbox: preferences.sandbox,
      nodeIntegration: preferences.nodeIntegration,
      contextIsolation: preferences.contextIsolation,
    };
  });
  expect(security).toEqual({
    sandbox: true,
    nodeIntegration: false,
    contextIsolation: true,
  });
  await page
    .getByRole("button", { name: "Enter application full screen", exact: true })
    .click();
  await expect
    .poll(() =>
      application.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "Exit application full screen", exact: true })
    .click();
  await expect
    .poll(() =>
      application.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
    )
    .toBe(false);
  await page.getByRole("button", { name: "Focus canvas", exact: true }).click();
  await expect(page.locator(".left-panel")).toBeHidden();
  await page
    .getByRole("button", { name: "Preview full screen", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Preview device", exact: true })
    .selectOption("mobile");
  await expect(
    page.locator('iframe[title="Full-screen interactive preview"]'),
  ).toHaveCSS("width", "375px");
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await page.getByRole("button", { name: "Docs", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator(".docs-brand-symbol img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(64);
  await page
    .getByRole("button", { name: "Expand documentation", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("Button icon layout");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Components", exact: true })
    .click();
  await expect(
    page.locator('.docs-article [data-section="steps"] li'),
  ).toHaveCount(7);
  await expect(page.locator(".docs-article")).toContainText(
    "create-project.component.ts",
  );
  await expect(page.locator(".docs-subbar")).toContainText("37 guides");
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("FAQ");
  await expect(
    page
      .getByRole("navigation", { name: "Documentation topics" })
      .getByRole("button", { name: "Frequently asked questions", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("WIN_CSC_KEY_PASSWORD");
  await expect(
    page.getByRole("navigation", { name: "Documentation topics" }),
  ).toContainText("No guides found");
  await page
    .getByRole("textbox", { name: "Search documentation", exact: true })
    .fill("Angular Integration");
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("button", { name: "Angular Integration", exact: true })
    .click();
  await expect(page.locator(".docs-article h1")).toHaveText(
    "Angular Integration",
  );
  await expect(page.locator(".docs-layout")).toHaveCSS("display", "grid");
  await page
    .getByRole("button", { name: "Close dialog · Back to editor", exact: true })
    .click();
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "New project name" })
    .fill("Desktop offline verification");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  await page.getByRole("textbox", { name: "width", exact: true }).fill("300px");
  await page.getByRole("textbox", { name: "width", exact: true }).press("Tab");
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Element text", exact: true }),
  ).toHaveValue("Your next great idea");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .fill("Native local project");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .press("Tab");
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Native local project", exact: true }),
  ).toBeVisible();
  await page.getByText("All changes saved").waitFor();
  const project = await page.evaluate(async () => {
    const projects = await window.codeshipDesktop!.listProjects();
    return projects.find((p) => p.name === "Desktop offline verification")!;
  });
  expect(project.name).toBe("Desktop offline verification");
  const folders = await readdir(join(testRoot, "projects"));
  const folder = folders.find((f) =>
    f.startsWith("Desktop offline verification"),
  )!;
  const projectPath = join(
    testRoot,
    "projects",
    folder,
    "project.codeship.json",
  );
  await expect
    .poll(() => readFile(projectPath, "utf8"))
    .toContain("Native local project");
  await page.context().setOffline(true);
  await page.reload();
  await page.getByText("All changes saved").waitFor();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Native local project", exact: true }),
  ).toBeVisible();
  const bridge = await page
    .frameLocator('iframe[title="Design canvas"]')
    .locator("body")
    .evaluate(() => ({
      bridge: typeof window.codeshipDesktop,
      node: typeof (globalThis as unknown as Record<string, unknown>)[
        "require"
      ],
    }));
  expect(bridge).toEqual({ bridge: "undefined", node: "undefined" });
  await page
    .getByRole("button", { name: "Expand code workspace", exact: true })
    .click();
  await page.getByRole("tab", { name: "CSS", exact: true }).click();
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 15000,
  });
  await page.evaluate(async () =>
    window.codeshipDesktop!.backupProject(
      (await window.codeshipDesktop!.listProjects()).find(
        (p) => p.name === "Desktop offline verification",
      )!.id,
    ),
  );
  const exportRoot = join(testRoot, "export");
  await mkdir(exportRoot);
  console.log(
    "Offline project, Monaco and backup verified. Stubbing destination picker.",
  );
  await application.evaluate(({ dialog }, path) => {
    Object.defineProperty(dialog, "showOpenDialog", {
      value() {
        return Promise.resolve({ canceled: false, filePaths: [path] });
      },
    });
  }, exportRoot);
  const exported = await page.evaluate(() =>
    window.codeshipDesktop!.exportFolder(
      {
        "index.html": "<h1>Offline export</h1>",
        "assets/readme.txt": "Packaged locally",
      },
      "desktop-fixture",
    ),
  );
  expect(await readFile(join(exported!, "index.html"), "utf8")).toContain(
    "Offline export",
  );
  console.log("Native folder export verified.");
  const denied = await page.evaluate(async () => {
    try {
      await window.codeshipDesktop!.exportFolder(
        { "../escape.txt": "unsafe" },
        "escape",
      );
      return false;
    } catch {
      return true;
    }
  });
  expect(denied).toBe(true);
  await application.evaluate(({ clipboard, dialog }) => {
    Object.defineProperty(clipboard, "writeText", {
      value(text: string) {
        (globalThis as unknown as Record<string, unknown>)[
          "codeshipCopiedText"
        ] = text;
      },
    });
    Object.defineProperty(dialog, "showMessageBox", {
      value() {
        return Promise.resolve({ response: 1, checkboxChecked: false });
      },
    });
  });
  await page.evaluate(() =>
    window.codeshipDesktop!.copyText("Offline component snippet"),
  );
  expect(
    await application.evaluate(
      () =>
        (globalThis as unknown as Record<string, unknown>)[
          "codeshipCopiedText"
        ],
    ),
  ).toBe("Offline component snippet");
  await page.getByRole("button", { name: "Docs", exact: true }).click();
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect
    .poll(() =>
      application.evaluate(
        () =>
          (globalThis as unknown as Record<string, unknown>)[
            "codeshipCopiedText"
          ],
      ),
    )
    .toMatch(/^codeship:\/\/app\/index\.html#docs\//);
  await page
    .getByRole("button", { name: "Close dialog · Back to editor", exact: true })
    .click();
  const recovered = await page.evaluate(async () => {
    const project = (await window.codeshipDesktop!.listProjects()).find(
      (p) => p.name === "Desktop offline verification",
    )!;
    return window.codeshipDesktop!.recoverProject(project.id);
  });
  expect(recovered?.id).not.toBe(project.id);
  expect(recovered?.name).toContain("(recovered)");
  await page
    .getByRole("button", { name: "Application settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Application theme", exact: true })
    .selectOption("light");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByText("All changes saved", { exact: true }).waitFor();
  await application.evaluate(({ ipcMain }) => {
    ipcMain.removeHandler("codeship:projects:save");
    ipcMain.handle("codeship:projects:save", function () {
      throw new Error("Injected disk failure");
    });
  });
  await page.getByRole("button", { name: "Add Heading", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Element text", exact: true }),
  ).toHaveValue("Your next great idea");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .fill("Unsaved failure draft");
  await page
    .getByRole("textbox", { name: "Element text", exact: true })
    .press("Tab");
  await page
    .getByRole("button", { name: "CodeShip. Open projects", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "New project name", exact: true })
    .fill("Must not replace unsaved work");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await expect(page.locator(".project-switch")).toContainText(
    "Desktop offline verification",
  );
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Native local project", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Save failed", { exact: true })).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Design canvas"]')
      .getByRole("heading", { name: "Unsaved failure draft", exact: true }),
  ).toBeVisible();
  expect(await readFile(projectPath, "utf8")).not.toContain(
    "Unsaved failure draft",
  );
  await writeFile(
    join(testRoot, "verified.json"),
    JSON.stringify({ projectPath, exported, security, errors }, null, 2),
  );
  expect(errors).toEqual([]);
  const captured = await application.evaluate(async ({ BrowserWindow }) =>
    (
      await BrowserWindow.getAllWindows()[0].webContents.capturePage(
        undefined,
        {
          stayHidden: true,
          stayAwake: true,
        },
      )
    )
      .toPNG()
      .toString("base64"),
  );
  await writeFile(
    "docs/screenshots/desktop-smoke.png",
    Buffer.from(captured, "base64"),
  );
  console.log(
    "Electron offline launch, sandbox, filesystem save/reload, local Monaco, backup, export and traversal checks passed. Evidence: " +
      testRoot,
  );
} catch (error) {
  console.error("Desktop verification failed:", error);
  throw error;
} finally {
  await application
    .evaluate(({ BrowserWindow }) => {
      for (const window of BrowserWindow.getAllWindows()) window.destroy();
    })
    .catch(() => undefined);
  await application.close().catch(() => undefined);
}

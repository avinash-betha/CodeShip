import { mkdir, readFile, stat, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, sep, extname } from "node:path";
import { createServer } from "node:http";
import { chromium, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import {
  demoProject,
  components,
  baseCss,
} from "../packages/component-registry";
import { element, uid, createProject } from "../packages/document-model";
import { dataTable, kanban, chat } from "../packages/component-registry/modern";
import { modernCss } from "../packages/component-registry/modern-styles";
import { defaultExportOptions } from "../packages/codegen-core/selection";
import { makeIcon, iconComponent, cloneIcon } from "../packages/icon-factory";
import { generateExport } from "../packages/codegen-core/export";
const root = process.cwd();
const project = demoProject();
const fixtureIcon = makeIcon("rocket", {
  color: "#537742",
  gradient: true,
  label: "Independent gradient icon",
});
project.pages[0].root.children.push(fixtureIcon, cloneIcon(fixtureIcon));
project.pages[0].root.children.push(
  element("project-status", "Ready", { "data-mode": "live" }),
);
const fixtureUrl =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
project.assets.push({
  id: "asset-fixture",
  name: "pixel.gif",
  type: "image/gif",
  url: fixtureUrl,
});
project.pages[0].root.children.push(
  element("img", "", {
    src: fixtureUrl,
    alt: "Local fixture asset",
    width: "1",
    height: "1",
  }),
);
project.pages[0].css += `\n.fixture-background { background-image: url("${fixtureUrl}"); }`;
project.pages[0].root.children.push(
  element("label", "Contact @ example {text}", { for: "contact-email" }),
  element("input", "", {
    id: "contact-email",
    class: "field",
    type: "email",
    "aria-label": "Contact email",
    value: "hello@example.com",
  }),
);
const trigger = element("button", "Toggle compact mode", { type: "button" });
trigger.interactions = [
  {
    event: "click",
    action: "toggle-class",
    target: project.pages[0].root.id,
    value: "compact",
  },
];
project.pages[0].root.children.push(trigger);
project.components.push({
  id: uid(),
  name: "Reusable label",
  root: element("p", "A reusable block"),
  css: "p { color: inherit; }",
});
project.pages.push({
  id: uid(),
  name: "About",
  path: "/about",
  root: element("main", "", {}, [element("h1", "About this project")]),
  css: project.pages[0].css,
});
function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      NG_CLI_ANALYTICS: "false",
    },
    timeout: 600000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(" ")} failed (${result.status}).`);
}
for (const target of ["html", "angular", "nextjs"] as const) {
  const destination = resolve(root, ".generated", target);
  await mkdir(destination, { recursive: true });
  for (const folder of ["src", "app", "components", "public"]) {
    const path = resolve(destination, folder);
    if (
      !path.startsWith(destination + sep) ||
      !destination.startsWith(resolve(root, ".generated") + sep)
    )
      throw new Error("Generated output cleanup escaped its workspace.");
    await rm(path, { recursive: true, force: true });
  }
  const files = await generateExport(project, target);
  if (target !== "html") {
    const catalogue = createProject("Library compilation"),
      entries = components.map((c) => c.create());
    catalogue.pages[0].root = element(
      "section",
      "",
      {},
      entries.map((c) => c.root),
    );
    catalogue.pages[0].css = [
      baseCss,
      ...new Set(entries.map((c) => c.css)),
    ].join("\n");
    const catalogueFiles = await generateExport(catalogue, target, {
      ...defaultExportOptions,
      scope: "selection",
      mode: "component",
      name: "LibraryCatalog",
      selectedIds: [catalogue.pages[0].root.id],
    });
    for (const [name, content] of Object.entries(catalogueFiles))
      if (name !== "README.md")
        files[(target === "angular" ? "src/" : "components/") + name] = content;
    const fixture = createProject("Selected component");
    fixture.pages[0].root = element("section", "", {}, [
      dataTable(),
      kanban(),
      chat(),
    ]);
    fixture.pages[0].css = modernCss;
    const selected = await generateExport(fixture, target, {
      ...defaultExportOptions,
      scope: "selection",
      mode: "component",
      name: "TeamTable",
      selectedIds: [fixture.pages[0].root.id],
    });
    for (const [name, content] of Object.entries(selected))
      if (name !== "README.md")
        files[(target === "angular" ? "src/" : "components/") + name] = content;
  }
  if (target === "angular") {
    files["src/custom-icon.component.ts"] = iconComponent(
      fixtureIcon,
      "angular",
    );
    files["src/app.component.ts"] = String(files["src/app.component.ts"])
      .replace(
        "import {",
        "import { LibraryCatalogComponent } from './library-catalog.component';\nimport { TeamTableComponent } from './team-table.component';\nimport { CustomIconComponent } from './custom-icon.component';\nimport {",
      )
      .replace(
        "standalone: true,",
        "standalone: true, imports: [CustomIconComponent,TeamTableComponent,LibraryCatalogComponent],",
      );
    files["src/app.component.html"] =
      String(files["src/app.component.html"]) +
      "<app-custom-icon></app-custom-icon><app-custom-icon></app-custom-icon><app-team-table></app-team-table>@defer (when false) { <app-library-catalog></app-library-catalog> }";
  }
  if (target === "nextjs") {
    files["app/library-catalog/page.tsx"] =
      "import LibraryCatalog from '../../components/LibraryCatalog'; export default function Page(){return <LibraryCatalog />;}";
    files["components/custom-icon.tsx"] =
      "'use client';\n" + iconComponent(fixtureIcon, "react");
    const source = String(files["app/page.tsx"]);
    const directive = source.startsWith('"use client";')
      ? '"use client";\n'
      : "";
    files["app/page.tsx"] =
      directive +
      "import TeamTable from '../components/TeamTable';\nimport CustomIcon from '../components/custom-icon';\n" +
      source
        .replace(/^"use client";\s*/, "")
        .replace("</main>", "<CustomIcon /><CustomIcon /><TeamTable /></main>");
  }
  for (const [path, content] of Object.entries(files)) {
    const full = resolve(destination, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
  }
  console.log(`Generated ${target}: ${Object.keys(files).length} files`);
  if (target === "html") continue;
  if (!existsSync(resolve(destination, "node_modules")) || target === "angular")
    run("npm", ["install", "--no-audit", "--no-fund"], destination);
  run("npm", ["run", "build"], destination);
}
const browser = await chromium.launch();
try {
  for (const [target, directory] of [
    ["html", ".generated/html"],
    ["angular", ".generated/angular/dist/app/browser"],
    ["nextjs", ".generated/nextjs/out"],
  ]) {
    const publicDir = resolve(root, directory);
    const server = createServer(async (req, res) => {
      try {
        const pathname = decodeURIComponent(
          new URL(req.url ?? "/", "http://localhost").pathname,
        );
        let path = resolve(publicDir, "." + pathname);
        if (path !== publicDir && !path.startsWith(publicDir + sep))
          throw new Error("Invalid path");
        if (existsSync(path + ".html")) path += ".html";
        if (existsSync(path) && (await stat(path)).isDirectory())
          path = resolve(path, "index.html");
        if (!existsSync(path) && existsSync(path + ".html")) path += ".html";
        if (!existsSync(path) && target === "angular")
          path = resolve(publicDir, "index.html");
        const mime: Record<string, string> = {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".gif": "image/gif",
          ".json": "application/json",
        };
        res.setHeader(
          "Content-Type",
          mime[extname(path)] ?? "application/octet-stream",
        );
        res.end(await readFile(path));
      } catch {
        res.statusCode = 404;
        res.end("Not found");
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Could not start export verification server");
    try {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const url = `http://127.0.0.1:${address.port}`;
      await page.goto(url);
      await expect(
        page.getByRole("heading", {
          name: "Make room for your next big idea.",
        }),
      ).toBeVisible();
      const image = page.getByRole("img", { name: "Local fixture asset" });
      await expect
        .poll(() =>
          image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBe(1);
      const vectors = page.getByRole("img", {
        name: "Independent gradient icon",
        exact: true,
      });
      await expect(vectors).toHaveCount(target === "html" ? 2 : 4);
      const references = await vectors.evaluateAll((nodes) =>
        nodes.map((node) => {
          const path = node.querySelector("path")!,
            stroke = path.getAttribute("stroke")!,
            id = stroke.slice(5, -1);
          return {
            id,
            found: !!node.querySelector(`[id="${id}"]`),
            namespace: node.querySelector("linearGradient")?.namespaceURI,
          };
        }),
      );
      expect(
        references.every(
          (ref) => ref.found && ref.namespace === "http://www.w3.org/2000/svg",
        ),
      ).toBe(true);
      expect(new Set(references.map((ref) => ref.id)).size).toBe(
        references.length,
      );
      await page.setViewportSize({ width: 375, height: 812 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(375);
      await page.setViewportSize({ width: 1280, height: 900 });
      const button = page.getByRole("button", {
        name: "Toggle compact mode",
        exact: true,
      });
      const rootNode = page.locator(
        `[data-cs-id="${project.pages[0].root.id}"]`,
      );
      await button.click();
      await expect(rootNode).toHaveClass(/compact/);
      await button.click();
      await expect(rootNode).not.toHaveClass(/compact/);
      if (target !== "html") {
        const table = page.locator(".ui-data-table");
        await table
          .getByRole("searchbox", { name: "Filter team records" })
          .fill("Maya");
        await expect(table.locator("tbody tr:visible")).toHaveCount(1);
        await expect(table.locator("tbody tr:visible")).toContainText(
          "Maya Patel",
        );
        await table
          .getByRole("searchbox", { name: "Filter team records" })
          .fill("");
        await table.getByRole("button", { name: "Next", exact: true }).click();
        await expect(table.locator("[data-page-label]")).toContainText(
          "Page 2",
        );
      }
      await page.goto(url + (target === "html" ? "/about.html" : "/about"));
      await expect(
        page.getByRole("heading", { name: "About this project" }),
      ).toBeVisible();
      expect(errors).toEqual([]);
      await page.close();
      console.log(
        `${target}: rendered layout, local asset, repeated interaction, and second page verified.`,
      );
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }
} finally {
  await browser.close();
}
console.log(
  "All exported targets built and rendered independently of CodeShip.",
);

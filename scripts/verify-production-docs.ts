import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
import { docArticles } from "../apps/studio/src/docs-registry";
const root = "dist/studio/browser";
const scripts = (await readdir(root)).filter((name) => name.endsWith(".js"));
if (!scripts.length) throw new Error("Build the production renderer first.");
const source = (
  await Promise.all(scripts.map((name) => readFile(join(root, name), "utf8")))
).join("\n");
for (const marker of [
  "WIN_CSC_KEY_PASSWORD",
  "Building CodeShip for Windows",
  "Maintaining CodeShip",
  "Adding components and screen templates",
  "build-windows",
  "release-checklist",
])
  if (source.includes(marker))
    throw new Error("Internal guide leaked into production: " + marker);
if (!source.includes("Create a button with an icon"))
  throw new Error("Customer documentation is missing from the renderer.");
console.log(
  `Production bundle verified: ${docArticles.length} customer guides; no internal developer guide content.`,
);
if (process.argv.includes("--packaged")) {
  const require = createRequire(import.meta.url);
  const builderRequire = createRequire(require.resolve("electron-builder"));
  const appBuilderRequire = createRequire(
    builderRequire.resolve("app-builder-lib"),
  );
  const asar = appBuilderRequire("@electron/asar") as {
    listPackage(path: string): string[];
    extractFile(path: string, file: string): Buffer;
  };
  const archive = "release/win-unpacked/resources/app.asar";
  const paths = asar.listPackage(archive).map((p) => p.replaceAll("\\", "/"));
  if (
    paths.some(
      (p) => p.includes("/docs/internal") || p.endsWith("developer-guide.html"),
    )
  )
    throw new Error(
      "Internal reference was included in the packaged application.",
    );
  const main = paths.find(
    (p) => p.includes("/studio/browser/main-") && p.endsWith(".js"),
  );
  if (!main) throw new Error("The packaged renderer bundle is missing.");
  const bundled = asar
    .extractFile(archive, join(...main.split("/").filter(Boolean)))
    .toString("utf8");
  for (const marker of [
    "WIN_CSC_KEY_PASSWORD",
    "Building CodeShip for Windows",
    "build-windows",
    "Maintaining CodeShip",
  ])
    if (bundled.includes(marker))
      throw new Error("Internal content in packaged app: " + marker);
  console.log(
    "Packaged ASAR verified: no internal HTML, source or developer article payload.",
  );
}

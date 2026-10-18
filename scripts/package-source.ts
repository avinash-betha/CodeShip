import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { zipSync, unzipSync } from "fflate";
const files: Record<string, Uint8Array> = {};
const excluded = new Set([
  "node_modules",
  ".angular",
  "dist",
  "release",
  ".generated",
  ".git",
  "coverage",
  "playwright-report",
]);
async function collect(directory = "") {
  for (const entry of await readdir(directory || ".", {
    withFileTypes: true,
  })) {
    if (
      excluded.has(entry.name) ||
      entry.name.startsWith("test-results") ||
      entry.name.endsWith(".log") ||
      entry.name.startsWith(".env")
    )
      continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile())
      files[path.replaceAll("\\", "/")] = await readFile(path);
  }
}
await collect();
for (const path of [
  "package.json",
  "pnpm-lock.yaml",
  "apps/studio/src/main.ts",
  "apps/desktop/main.ts",
  "docs/DESKTOP_BUILD_GUIDE.md",
  "docs/internal/developer-guide.html",
])
  if (!files[path]) throw new Error("Missing source artifact: " + path);
const version = JSON.parse(
  new TextDecoder().decode(files["package.json"]),
).version;
await mkdir("release", { recursive: true });
const path = `release/CodeShip-source-${version}.zip`,
  archive = zipSync(files, { level: 6 });
if (Object.keys(unzipSync(archive)).length !== Object.keys(files).length)
  throw new Error("Source archive verification failed.");
await writeFile(path, archive);
console.log(
  `${path}: ${Object.keys(files).length} source/configuration/documentation files, ${archive.length} bytes.`,
);

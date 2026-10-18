import { build } from "esbuild";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
await mkdir("dist/desktop", { recursive: true });
await build({
  entryPoints: {
    main: "apps/desktop/main.ts",
    preload: "apps/desktop/preload.ts",
  },
  outdir: "dist/desktop",
  outExtension: { ".js": ".cjs" },
  platform: "node",
  format: "cjs",
  bundle: true,
  external: ["electron"],
  target: "node22",
  sourcemap: true,
});
await copyFile("apps/desktop/icon.png", "dist/desktop/icon.png");
await copyFile("apps/desktop/icon.ico", "dist/desktop/icon.ico");
await writeFile(
  "dist/desktop/package.json",
  JSON.stringify({
    name: "codeship-desktop",
    productName: "CodeShip",
    version: "0.2.0",
    main: "main.cjs",
  }),
);
await writeFile(
  "dist/package.json",
  JSON.stringify({
    name: "codeship",
    productName: "CodeShip",
    description: "Offline visual UI engineering",
    author: "CodeShip contributors",
    version: "0.2.0",
    main: "desktop/main.cjs",
    dependencies: {},
  }),
);
console.log("Secure Electron main and sandboxed preload bundled.");

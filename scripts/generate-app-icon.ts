import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

// Export approved artwork to platform sizes; the master remains untouched.
const master = "apps/studio/public/brand/codeship-master.png";
const browser = await chromium.launch();
const frames = new Map<number, Buffer>();
try {
  const page = await browser.newPage();
  const source = `data:image/png;base64,${(await readFile(master)).toString("base64")}`;
  for (const size of [16, 24, 32, 48, 64, 128, 180, 256, 512]) {
    const png = await page.evaluate(
      async ({ source, size }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const context = canvas.getContext("2d")!;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, size, size);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { source, size },
    );
    const buffer = Buffer.from(png, "base64");
    frames.set(size, buffer);
    await writeFile(`apps/studio/public/brand/codeship-${size}.png`, buffer);
  }
} finally {
  await browser.close();
}
const sizes = [16, 24, 32, 48, 64, 128, 256];
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
sizes.forEach((size, index) => {
  const start = 6 + index * 16;
  directory[start] = directory[start + 1] = size === 256 ? 0 : size;
  directory.writeUInt16LE(1, start + 4);
  directory.writeUInt16LE(32, start + 6);
  directory.writeUInt32LE(frames.get(size)!.length, start + 8);
  directory.writeUInt32LE(offset, start + 12);
  offset += frames.get(size)!.length;
});
const ico = Buffer.concat([
  directory,
  ...sizes.map((size) => frames.get(size)!),
]);
for (const path of ["apps/desktop/icon.ico", "apps/studio/public/favicon.ico"])
  await writeFile(path, ico);
await writeFile("apps/desktop/icon.png", frames.get(512)!);
await writeFile("apps/studio/public/favicon.png", frames.get(32)!);
await writeFile("apps/studio/public/apple-touch-icon.png", frames.get(180)!);
for (const [path, size] of [
  ["apps/desktop/icon.svg", 512],
  ["apps/studio/public/favicon.svg", 32],
] as const) {
  await writeFile(
    path,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><image width="${size}" height="${size}" href="data:image/png;base64,${frames.get(size)!.toString("base64")}"/></svg>\n`,
  );
}
console.log(
  "Exported CodeShip branding: PNG sizes 16–512 and seven-resolution Windows/favicon ICO.",
);

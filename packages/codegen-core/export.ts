import { strToU8, zipSync } from "fflate";
import { type Project } from "../document-model";
import { type ExportTarget, type ExportFiles, localizeAssets } from "./index";
import { exportHtml } from "../exporter-html";
import { exportAngular } from "../exporter-angular";
import { exportNext } from "../exporter-nextjs";
import { assertSafeCss } from "../css-engine";
import { parseProject } from "../validation";
import { extractDesign, type ExportOptions } from "./selection";
import { exportComponent } from "./component-export";
export async function generateExport(
  project: Project,
  target: ExportTarget,
  options?: ExportOptions,
): Promise<ExportFiles> {
  parseProject(JSON.stringify(project));
  project.pages.forEach((p) => assertSafeCss(p.css));
  const extracted = options ? extractDesign(project, options).project : project;
  if (
    options &&
    ["snippet", "component", "screen"].includes(options.mode) &&
    extracted.pages.length !== 1
  )
    throw new Error(
      "Choose selected elements or a single current screen for this output format. Use Complete project for multiple screens.",
    );
  const componentMode =
    options && ["snippet", "component"].includes(options.mode);
  const { project: local, files: assets } = localizeAssets(
    extracted,
    target !== "html",
  );
  const files = componentMode
    ? exportComponent(local, target, options.name, options.mode === "snippet")
    : target === "html"
      ? exportHtml(local)
      : target === "angular"
        ? exportAngular(local)
        : exportNext(local);
  for (const [path, content] of Object.entries(assets))
    files[target === "html" ? path : `public/${path}`] = content;
  const [prettier, html, typescript, estree, postcss, babel] =
    await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/html"),
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/postcss"),
      import("prettier/plugins/babel"),
    ]);
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== "string") continue;
    const parser = path.endsWith(".html")
      ? target === "angular"
        ? "angular"
        : "html"
      : path.endsWith(".css")
        ? "css"
        : /\.tsx?$/.test(path)
          ? "typescript"
          : path.endsWith(".js")
            ? "babel"
            : path.endsWith(".json")
              ? "json"
              : undefined;
    if (parser)
      files[path] = await prettier.format(content, {
        parser,
        plugins: [html, typescript, estree, postcss, babel],
        printWidth: 100,
      });
  }
  return files;
}
export function zipExport(files: ExportFiles): Uint8Array {
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([k, v]) => [
        k,
        typeof v === "string" ? strToU8(v) : v,
      ]),
    ),
    { level: 6 },
  );
}
export function download(
  data: BlobPart,
  name: string,
  type = "application/octet-stream",
): void {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

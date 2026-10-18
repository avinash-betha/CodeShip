import { type Project, currentPage } from "../document-model";
import {
  type ExportFiles,
  escapeHtml,
  interactionScript,
  projectCss,
  renderNode,
} from "../codegen-core";
export function exportHtml(project: Project): ExportFiles {
  const files: ExportFiles = {};
  for (const page of project.pages) {
    const primary = page.id === currentPage(project).id;
    const slug = primary
      ? "index"
      : page.path.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9_-]/g, "-") ||
        page.id;
    const script = interactionScript(page);
    const cssName = primary ? "styles.css" : `${slug}.css`,
      scriptName = primary ? "script.js" : `${slug}.js`;
    files[`${slug}.html`] =
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(project.name)}: ${escapeHtml(page.name)}</title><link rel="stylesheet" href="${cssName}"></head><body>${renderNode(page.root)}${script ? `<script src="${scriptName}" defer></script>` : ""}</body></html>`;
    files[cssName] = projectCss(project, page);
    if (script) files[scriptName] = script;
  }
  files["README.md"] =
    `# ${project.name}\n\nOpen index.html in a browser. No CodeShip runtime or build step is required. Remote asset URLs need network access. Page styles and supported interactions are independent.\n`;
  return files;
}

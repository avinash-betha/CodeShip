import {
  type ElementNode,
  type Page,
  type Project,
  currentPage,
  voidTags,
  walk,
  svgTagName,
} from "../document-model";
import { safeAttribute } from "../validation";
import { assertSafeCss } from "../css-engine";
import { componentRuntimeFor } from "./runtime";
export const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export function renderNode(node: ElementNode): string {
  const attributes = Object.entries(node.attributes)
    .filter(([k, v]) => safeAttribute(k, v))
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join("");
  const tag = svgTagName(node.tag);
  const open = `<${tag} data-cs-id="${escapeHtml(node.id)}"${attributes}>`;
  return voidTags.has(node.tag)
    ? open
    : `${open}${escapeHtml(node.text)}${node.children.map(renderNode).join("")}</${tag}>`;
}
export function projectCss(
  project: Project,
  page = currentPage(project),
): string {
  assertSafeCss(page.css);
  const tokens = Object.entries(project.tokens)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");
  return `:root {\n${tokens}\n}\n${page.css}`;
}
export function interactionScript(page: Page): string {
  const interactions: {
    id: string;
    event: string;
    action: string;
    target: string;
    value: string;
  }[] = [];
  walk(page.root, (n) =>
    n.interactions.forEach((i) => interactions.push({ id: n.id, ...i })),
  );
  if (!interactions.length) return "";
  const json = JSON.stringify(interactions).replaceAll("<", "\\u003c");
  return `const interactionController = new AbortController();\nconst interactions = ${json};\nfor (const i of interactions) {\n  const source = document.querySelector('[data-cs-id="' + CSS.escape(i.id) + '"]');\n  if (!source) continue;\n  source.addEventListener(i.event, event => {\n    if (i.event === 'submit') event.preventDefault();\n    const target = document.querySelector('[data-cs-id="' + CSS.escape(i.target || i.id) + '"]');\n${componentRuntimeFor(new Set(interactions.map((i) => i.action)))}\n    if (i.action === 'set-text' && target) target.textContent = i.value;\n    if (i.action === 'navigate' && /^(https?:|mailto:|tel:|#|\\/|[^:]+$)/i.test(i.value) && !/^(javascript|vbscript|file):/i.test(i.value)) location.href = i.value;\n  }, {signal: interactionController.signal});\n}`;
}
export function canvasDocument(
  project: Project,
  options: {
    interactive?: boolean;
    css?: string;
    nonce?: string;
    previewExit?: boolean;
  } = {},
): string {
  const page = currentPage(project),
    css =
      options.css === undefined
        ? projectCss(project)
        : projectCss(project, { ...page, css: options.css });
  assertSafeCss(css);
  const script =
    (options.interactive ? interactionScript(page) : "") +
    (options.previewExit
      ? "\nwindow.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();parent.postMessage({type:'codeship:preview-exit'},'*');}});"
      : "");
  const nonce =
    options.nonce && /^[a-zA-Z0-9_-]+$/.test(options.nonce)
      ? options.nonce
      : "codeship-preview";
  const csp = `default-src 'none'; img-src https: http: data: blob:; media-src https: http: blob:; style-src 'unsafe-inline'; font-src https: data:; script-src ${script ? "'nonce-" + nonce + "'" : "'none'"}; form-action 'none'; base-uri 'none'`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(project.name)}</title><style>${css}</style></head><body>${renderNode(page.root)}${script ? `<script nonce="${nonce}">${script}</script>` : ""}</body></html>`;
}
export type ExportTarget = "html" | "angular" | "nextjs";
export type ExportFiles = Record<string, string | Uint8Array>;
export function localizeAssets(
  project: Project,
  publicRoot = false,
): {
  project: Project;
  files: ExportFiles;
} {
  const p = structuredClone(project),
    files: ExportFiles = {};
  for (const asset of p.assets) {
    const match =
      /^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([a-z0-9+/=]+)$/i.exec(
        asset.url,
      );
    if (!match) continue;
    const path = `assets/${asset.id}.${match[1].split("/")[1]}`;
    files[path] = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    const reference = publicRoot ? "/" + path : path;
    for (const page of p.pages) {
      page.css = page.css.replaceAll(asset.url, reference);
      walk(page.root, (n) => {
        for (const [k, v] of Object.entries(n.attributes))
          if (v === asset.url) n.attributes[k] = reference;
      });
    }
    for (const component of p.components) {
      component.css = component.css.replaceAll(asset.url, reference);
      walk(component.root, (n) => {
        for (const [k, v] of Object.entries(n.attributes))
          if (v === asset.url) n.attributes[k] = reference;
      });
    }
    asset.url = reference;
  }
  return { project: p, files };
}

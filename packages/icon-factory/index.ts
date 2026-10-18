import {
  duplicateNode,
  element as e,
  type ElementNode,
  uid,
  walk,
  svgTagName,
} from "../document-model";
import { iconPaths } from "./paths";
export { iconPaths } from "./paths";

// Original CodeShip geometry. No remote icon font or third-party collection.
Object.assign(iconPaths, {
  home: "M3 11 12 3l9 8v10h-6v-7H9v7H3V11Z",
  users:
    "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a7 7 0 0 1 14 0v2m1-16a4 4 0 0 1 0 8m3 8v-3a5 5 0 0 0-2-4",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4 22v-2a8 8 0 0 1 16 0v2",
  chart: "M3 3v18h18M7 16v-5m5 5V7m5 9V4",
  trend: "m3 17 6-6 4 4 8-11m-6 0h6v6",
  bell: "M5 17h14l-2-4V9a5 5 0 0 0-10 0v4l-2 4Zm5 3h4M12 2v2",
  mail: "M3 5h18v14H3V5Zm0 0 9 8 9-8",
  calendar: "M3 5h18v16H3zM7 2v6m10-6v6M3 10h18m-14 4h3m4 0h3m-10 3h3",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v6l4 2",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6",
  heart: "M12 21 3 12C-2 5 7-1 12 6c5-7 14-1 9 6l-9 9Z",
  star: "m12 2 3 6.5 7 1-5 5 1 7-6-3.5L6 21l1-6.5-5-5 7-1L12 2Z",
  cloud: "M7 19a5 5 0 1 1 0-10 7 7 0 0 1 13-1 6 6 0 0 1-1 11H7Z",
  database:
    "M3 6c0-5 18-5 18 0s-18 5-18 0Zm0 0v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0",
  terminal: "m5 6 6 6-6 6m8 0h7M2 2h20v20H2V2Z",
  brush: "m10 12 9-9 3 3-9 9-3-3Zm0 0c-7-2-2 9-8 9 10 2 12-4 11-6",
  pen: "m4 16 12-13 5 5L8 21H3l1-5Zm9-10 5 5",
  crop: "M7 2v15h15M2 7h15v15",
  circle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
  square:
    "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z",
  triangle: "m12 3 10 18H2L12 3Z",
  diamond: "m12 2 10 10-10 10L2 12 12 2Z",
  bolt: "m14 2-10 12h7l-1 8L21 9h-8l1-7Z",
  globe:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-20c-6 6-6 14 0 20 6-6 6-14 0-20ZM2 12h20",
  book: "M12 5C7 2 3 3 2 4v16c5-2 7-1 10 1 3-2 5-3 10-1V4c-1-1-5-2-10 1Zm0 0v16",
  rocket:
    "M9 15 5 11c3-6 9-9 16-8 1 7-2 13-8 16l-4-4Zm-3-5-4 2v6l6-2m6 2 2 4h4l-1-9M5 19l-3 3m13-15h.01",
  wallet: "M21 8H3V4h16v4M3 8v13h18V8Zm18 5h-6v4h6m-3-2h.01",
  filter: "M2 4h20l-8 9v7l-4 2v-9L2 4Z",
  sort: "M8 3v18m-5-5 5 5 5-5M15 4h6m-6 5h4m-4 5h2",
  rotate: "M3 11a9 9 0 1 1 2 7M3 4v7h7",
  flip: "M12 2v20M3 5v14l6-7-6-7Zm18 0v14l-6-7 6-7Z",
  warning: "m12 2 10 19H2L12 2Zm0 6v6m0 3h.01",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-12v7m0-10h.01",
  checkCircle: "M22 11v1a10 10 0 1 1-5-8m-9 7 4 4L22 3",
  chat: "M3 3h18v14H9l-6 5V3Zm4 5h10M7 12h6",
  video: "M3 5h12v14H3zM15 9l7-4v14l-7-4",
  headphones: "M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v9H3zM17 12h4v9h-4z",
  accessibility:
    "M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 9l9 2 9-2m-9 2v5m0 0-5 6m5-6 5 6",
  component:
    "m12 2 5 5-5 5-5-5 5-5ZM2 12l5-5 5 5-5 5-5-5Zm10 0 5-5 5 5-5 5-5-5Zm0 0 5 5-5 5-5-5 5-5Z",
});

const groups: Record<string, string[]> = {
  Navigation: [
    "home",
    "menu",
    "sidebar",
    "arrow",
    "chevron",
    "down",
    "external",
    "link",
    "globe",
  ],
  Layout: ["layout", "grid", "layers", "columns", "panel", "box", "component"],
  Editing: [
    "pointer",
    "hand",
    "undo",
    "redo",
    "copy",
    "trash",
    "brush",
    "pen",
    "crop",
    "rotate",
    "flip",
    "plus",
    "minus",
  ],
  Files: ["folder", "file", "save", "upload", "download", "cloud", "database"],
  People: ["users", "user", "heart", "chat", "accessibility"],
  Forms: ["input", "form", "tag", "filter", "sort", "mail", "calendar", "list"],
  Data: ["table", "chart", "trend", "wallet", "clock"],
  Media: ["image", "play", "music", "video", "headphones"],
  Devices: ["desktop", "tablet", "mobile"],
  Development: [
    "code",
    "terminal",
    "animation",
    "settings",
    "heading",
    "text",
    "type",
  ],
  Status: [
    "check",
    "checkCircle",
    "close",
    "warning",
    "info",
    "help",
    "bell",
    "shield",
    "lock",
    "eye",
    "sun",
  ],
  Shapes: [
    "spark",
    "star",
    "circle",
    "square",
    "triangle",
    "diamond",
    "bolt",
    "rocket",
    "book",
    "more",
  ],
};
export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  tags: string[];
  path: string;
}
export const icons: IconDefinition[] = Object.entries(iconPaths).map(
  ([id, path]) => ({
    id,
    path,
    name: id.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    category:
      Object.entries(groups).find(([, names]) => names.includes(id))?.[0] ??
      "Shapes",
    tags: [id, ...(id === "spark" ? ["magic", "ai", "sparkle"] : [])],
  }),
);
export const iconCategories = ["All", ...Object.keys(groups)];
export type IconVariant =
  "outline" | "rounded" | "sharp" | "duotone" | "tinted";
export interface IconOptions {
  size: number;
  color: string;
  secondary: string;
  stroke: number;
  opacity: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  gradient: boolean;
  variant: IconVariant;
  label: string;
}
export const defaultIconOptions: IconOptions = {
  size: 32,
  color: "#739456",
  secondary: "#7fcfbe",
  stroke: 1.7,
  opacity: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
  gradient: false,
  variant: "outline",
  label: "",
};
export function makeIcon(
  id: string,
  settings: Partial<IconOptions> = {},
): ElementNode {
  const o = { ...defaultIconOptions, ...settings };
  if (
    !Number.isFinite(o.size) ||
    o.size < 12 ||
    o.size > 512 ||
    !Number.isFinite(o.stroke) ||
    o.stroke < 0.25 ||
    o.stroke > 5 ||
    !Number.isFinite(o.rotation) ||
    !Number.isFinite(o.opacity) ||
    o.opacity < 0 ||
    o.opacity > 1
  )
    throw new Error(
      "Icon dimensions, stroke, rotation or opacity are invalid.",
    );
  if (!/^#[\da-f]{6}$/i.test(o.color) || !/^#[\da-f]{6}$/i.test(o.secondary))
    throw new Error("Use six-digit hex colors.");
  const gradientId = uid(),
    name = icons.find((i) => i.id === id)?.name ?? "Custom";
  const root = e("svg", "", {
    viewBox: "0 0 24 24",
    width: String(o.size),
    height: String(o.size),
    fill: "none",
    stroke: o.color,
    "stroke-width": String(o.stroke),
    "stroke-linecap": o.variant === "sharp" ? "square" : "round",
    "stroke-linejoin": o.variant === "sharp" ? "miter" : "round",
    opacity: String(o.opacity),
    "data-cs-icon": id,
    "data-cs-icon-config": JSON.stringify(o),
    ...(o.label
      ? { role: "img", "aria-label": o.label }
      : { "aria-hidden": "true" }),
  });
  root.name = `${name} icon`;
  if (o.gradient)
    root.children.push(
      e("defs", "", {}, [
        e(
          "lineargradient",
          "",
          { id: gradientId, x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
          [
            e("stop", "", { offset: "0%", "stop-color": o.color }),
            e("stop", "", { offset: "100%", "stop-color": o.secondary }),
          ],
        ),
      ]),
    );
  const color = o.gradient ? `url(#${gradientId})` : o.color;
  const group = e("g", "", {
    transform: `translate(12 12) rotate(${o.rotation}) scale(${o.flipX ? -1 : 1} ${o.flipY ? -1 : 1}) translate(-12 -12)`,
  });
  if (o.variant === "duotone")
    group.children.push(
      e("rect", "", {
        x: "1",
        y: "1",
        width: "22",
        height: "22",
        rx: "7",
        fill: o.secondary,
        stroke: "none",
        opacity: ".18",
      }),
    );
  group.children.push(
    e("path", "", {
      d: iconPaths[id] ?? iconPaths["spark"],
      stroke: color,
      fill: o.variant === "tinted" ? o.secondary : "none",
      ...(o.variant === "tinted" ? { "fill-opacity": ".2" } : {}),
      ...(o.variant === "rounded"
        ? { "stroke-width": String(Math.min(5, o.stroke + 0.5)) }
        : {}),
    }),
  );
  root.children.push(group);
  return root;
}
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function svgSource(root: ElementNode, editorIds = false): string {
  const tags: Record<string, string> = {
    lineargradient: "linearGradient",
    radialgradient: "radialGradient",
  };
  const render = (n: ElementNode): string =>
    `<${tags[n.tag] ?? n.tag}${editorIds ? ` data-vector-id="${n.id}"` : ""}${Object.entries(
      n.attributes,
    )
      .filter(([k]) => !k.startsWith("data-cs-"))
      .map(([k, v]) => ` ${k}="${escape(v)}"`)
      .join(
        "",
      )}>${escape(n.text)}${n.children.map(render).join("")}</${tags[n.tag] ?? n.tag}>`;
  return render(root).replace(
    "<svg ",
    '<svg xmlns="http://www.w3.org/2000/svg" ',
  );
}
const svgTags = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "title",
  "desc",
]);
const svgAttrs = new Set([
  "id",
  "viewBox",
  "width",
  "height",
  "d",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "points",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "opacity",
  "transform",
  "offset",
  "stop-color",
  "stop-opacity",
  "gradientUnits",
  "gradientTransform",
  "role",
  "aria-label",
  "aria-hidden",
]);
/** Strict vector-only SVG: rejects executable, linked, styled and unsupported content. */
export function parseSvg(source: string): ElementNode {
  if (source.length > 150_000 || /<!DOCTYPE|<!ENTITY/i.test(source))
    throw new Error(
      "Choose a vector SVG under 150 KB without document entities.",
    );
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  if (doc.querySelector("parsererror") || doc.documentElement.tagName !== "svg")
    throw new Error("Enter valid SVG with one svg root.");
  let count = 0;
  const parse = (node: Element, depth = 0): ElementNode => {
    if (!svgTags.has(node.tagName.toLowerCase()) || depth > 12 || ++count > 200)
      throw new Error(
        "SVG supports up to 200 vector shapes and groups. Scripts, images, links and foreign content are not allowed.",
      );
    const attrs: Record<string, string> = {};
    for (const a of Array.from(node.attributes)) {
      if (a.name === "xmlns") continue;
      if (
        !svgAttrs.has(a.name) ||
        /javascript:|data:|https?:|\/\//i.test(a.value) ||
        (/url\(/i.test(a.value) && !/^url\(#[\w-]+\)$/.test(a.value))
      )
        throw new Error(`Unsupported or unsafe SVG attribute: ${a.name}`);
      attrs[a.name] = a.value;
    }
    return e(
      node.tagName.toLowerCase(),
      ["title", "desc"].includes(node.tagName) ? (node.textContent ?? "") : "",
      attrs,
      Array.from(node.children).map((c) => parse(c, depth + 1)),
    );
  };
  const root = parse(doc.documentElement);
  root.attributes["viewBox"] ??= "0 0 24 24";
  root.attributes["width"] ??= "32";
  root.attributes["height"] ??= "32";
  root.attributes["data-cs-icon"] = "custom";
  root.name = "Custom icon";
  const ids = new Map<string, string>();
  walk(root, (n) => {
    if (n.attributes.id) {
      const id = uid();
      ids.set(n.attributes.id, id);
      n.attributes.id = id;
    }
  });
  walk(root, (n) => {
    for (const [key, value] of Object.entries(n.attributes)) {
      const ref = value.match(/^url\(#([\w-]+)\)$/);
      if (ref) {
        const target = ids.get(ref[1]);
        if (!target) throw new Error("SVG references a missing gradient.");
        n.attributes[key] = `url(#${target})`;
      }
    }
  });
  return root;
}
export function iconComponent(
  root: ElementNode,
  target: "react" | "angular",
): string {
  if (target === "angular") {
    const template = svgSource(root)
      .replaceAll("@", "&#64;")
      .replaceAll("{", "&#123;")
      .replaceAll("}", "&#125;")
      .replace(
        /id="([\w-]+)"/g,
        (_m, id: string) => `[attr.id]="iconId + '-${id}'"`,
      )
      .replace(
        /([\w-]+)="url\(#([\w-]+)\)"/g,
        (_m, key: string, id: string) =>
          `[attr.${key}]="'url(#' + iconId + '-${id})'"`,
      );
    return `import { Component } from '@angular/core';\n\nlet iconSequence = 0;\n@Component({ selector: 'app-custom-icon', standalone: true, template: ${JSON.stringify(template)} })\nexport class CustomIconComponent { readonly iconId = '${root.id}-' + iconSequence++; }\n`;
  }
  const literal = (text: string) =>
    JSON.stringify(text).replaceAll("<", "\\u003c");
  const render = (n: ElementNode): string => {
    const tag = svgTagName(n.tag);
    const attrs = Object.entries(n.attributes)
      .filter(([key]) => !key.startsWith("data-cs-"))
      .map(([key, value]) => {
        const name = /^(aria-|data-)/.test(key)
          ? key
          : key.replace(/-([a-z])/g, (_m: string, c: string) =>
              c.toUpperCase(),
            );
        const ref = value.match(/^url\(#([\w-]+)\)$/);
        const expression =
          key === "id"
            ? `instance + ${literal("-" + value)}`
            : ref
              ? `"url(#" + instance + ${literal("-" + ref[1] + ")")}`
              : literal(value);
        return ` ${name}={${expression}}`;
      })
      .join("");
    return `<${tag}${attrs}${n === root ? " {...props}" : ""}>${n.text ? `{${literal(n.text)}}` : ""}${n.children.map(render).join("")}</${tag}>`;
  };
  const linked = render(root);
  return `import { useId, type SVGProps } from 'react';\n\nexport default function CustomIcon(props: SVGProps<SVGSVGElement>) {\n const instance = useId().replace(/:/g, '');\n return (${linked});\n}\n`;
}
export function cloneIcon(root: ElementNode): ElementNode {
  return duplicateNode(root);
}

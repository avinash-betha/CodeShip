import {
  type Project,
  type ElementNode,
  currentPage,
  voidTags,
  walk,
} from "../document-model";
import {
  type ExportFiles,
  interactionScript,
  projectCss,
} from "../codegen-core";
import { safeAttribute } from "../validation";
const aliases: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  srcset: "srcSet",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  viewbox: "viewBox",
  fillrule: "fillRule",
  cliprule: "clipRule",
  strokeLinecap: "strokeLinecap",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  inputmode: "inputMode",
  minlength: "minLength",
  formaction: "formAction",
  formmethod: "formMethod",
  formtarget: "formTarget",
  formenctype: "formEncType",
  formnovalidate: "formNoValidate",
  novalidate: "noValidate",
  autoplay: "autoPlay",
  playsinline: "playsInline",
  datetime: "dateTime",
  acceptcharset: "acceptCharset",
  "accept-charset": "acceptCharset",
  "http-equiv": "httpEquiv",
  accesskey: "accessKey",
  usemap: "useMap",
  ismap: "isMap",
  referrerpolicy: "referrerPolicy",
  fetchpriority: "fetchPriority",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "fill-opacity": "fillOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "xlink:href": "xlinkHref",
  preserveaspectratio: "preserveAspectRatio",
  gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform",
  markerend: "markerEnd",
  "marker-end": "markerEnd",
};
const booleans = new Set(
  "disabled required checked multiple controls loop muted autoFocus readOnly selected hidden open reversed inert autoPlay playsInline formNoValidate noValidate isMap".split(
    " ",
  ),
);
export function jsx(n: ElementNode): string {
  const svgTags: Record<string, string> = {
    lineargradient: "linearGradient",
    radialgradient: "radialGradient",
    clippath: "clipPath",
    textpath: "textPath",
    foreignobject: "foreignObject",
    fegaussianblur: "feGaussianBlur",
    fecolormatrix: "feColorMatrix",
    feoffset: "feOffset",
    femerge: "feMerge",
    femergenode: "feMergeNode",
  };
  const tag = svgTags[n.tag] ?? n.tag;
  const attrs = Object.entries(n.attributes)
    .filter(([k, v]) => safeAttribute(k, v))
    .map(([key, value]) => {
      let k = aliases[key] ?? key;
      if (k === "value" && ["input", "textarea", "select"].includes(n.tag))
        k = "defaultValue";
      if (k === "checked") k = "defaultChecked";
      if (booleans.has(k) || k === "defaultChecked") return ` ${k}={true}`;
      if (
        [
          "tabIndex",
          "maxLength",
          "minLength",
          "colSpan",
          "rowSpan",
          "size",
          "rows",
          "cols",
          "span",
          "start",
          "aria-colcount",
          "aria-colindex",
          "aria-colspan",
          "aria-level",
          "aria-posinset",
          "aria-rowcount",
          "aria-rowindex",
          "aria-rowspan",
          "aria-setsize",
          "aria-valuemax",
          "aria-valuemin",
          "aria-valuenow",
        ].includes(k) &&
        /^-?\d+(?:\.\d+)?$/.test(value)
      )
        return ` ${k}={${Number(value)}}`;
      return ` ${k}={${JSON.stringify(value).replaceAll("<", "\\u003c")}}`;
    })
    .join("");
  const open = `<${tag} data-cs-id="${n.id}"${attrs}`;
  return voidTags.has(n.tag)
    ? `${open} />`
    : `${open}>${n.text ? `{${JSON.stringify(n.text).replaceAll("<", "\\u003c")}}` : ""}${n.children.map(jsx).join("")}</${tag}>`;
}
export function exportNext(project: Project): ExportFiles {
  const files: ExportFiles = {
    "package.json": JSON.stringify(
      {
        name: "codeship-next-export",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build --webpack",
          start: "next start",
        },
        dependencies: {
          next: "^16.4.2",
          react: "^19.2.0",
          "react-dom": "^19.2.0",
        },
        devDependencies: {
          typescript: "~5.9.3",
          "@types/node": "^22.19.0",
          "@types/react": "^19.2.0",
          "@types/react-dom": "^19.2.0",
        },
      },
      null,
      2,
    ),
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "react-jsx",
          incremental: true,
          plugins: [{ name: "next" }],
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2,
    ),
    "next-env.d.ts":
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />',
    "next.config.ts": `import type { NextConfig } from 'next';\nconst config: NextConfig = { output:'export', images:{unoptimized:true} };\nexport default config;`,
    "app/layout.tsx": `import type { ReactNode } from 'react';\nimport './globals.css';\nexport default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body>{children}</body></html>; }`,
    "app/globals.css": projectCss(project),
    "README.md": `# ${project.name}\n\nNode 20.19+ is required. Run npm install and npm run dev, or npm run build for a standalone static export. Uses the App Router and global CSS. Interactive pages use a client component; static pages remain server components.\n`,
  };
  const customTags = new Set<string>();
  for (const page of project.pages)
    walk(page.root, (n) => {
      if (n.tag.includes("-")) customTags.add(n.tag);
    });
  for (const c of project.components)
    walk(c.root, (n) => {
      if (n.tag.includes("-")) customTags.add(n.tag);
    });
  if (customTags.size)
    files["custom-elements.d.ts"] =
      `import type { DetailedHTMLProps, HTMLAttributes } from 'react';\ndeclare module 'react' {namespace JSX {interface IntrinsicElements {${[...customTags].map((tag) => `${JSON.stringify(tag)}: DetailedHTMLProps<HTMLAttributes<HTMLElement>,HTMLElement> & Record<string, unknown>;`).join("\n")} }}}`;
  for (const page of project.pages) {
    const path =
      page.id === currentPage(project).id
        ? ""
        : page.path
            .replace(/^\/+|\/+$/g, "")
            .replace(/[^a-zA-Z0-9_/-]/g, "-") || page.id;
    const script = interactionScript(page);
    files[`app/${path ? path + "/" : ""}page.tsx`] =
      `${script ? `'use client';\nimport { useEffect } from 'react';\n` : ""}${path ? `import './page.css';\n` : ""}export default function Page() { ${script ? `useEffect(()=>{ ${script} return ()=>interactionController.abort(); },[]);` : ""} return (${jsx(page.root)}); }`;
    if (path) files[`app/${path}/page.css`] = projectCss(project, page);
  }
  for (const component of project.components)
    files[`components/Block${component.id.replaceAll("-", "")}.tsx`] =
      `export default function Block${component.id.replaceAll("-", "")}() { return (${jsx(component.root)}); }`;
  return files;
}

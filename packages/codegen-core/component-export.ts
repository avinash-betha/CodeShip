import postcss from "postcss";
import { currentPage, walk, type Project } from "../document-model";
import {
  type ExportFiles,
  type ExportTarget,
  interactionScript,
  projectCss,
  renderNode,
} from "./index";
import { angularTemplate } from "../exporter-angular";
import { jsx } from "../exporter-nextjs";
import { escapeHtml } from "./index";
export function exportComponent(
  project: Project,
  target: ExportTarget,
  name: string,
  snippet = false,
): ExportFiles {
  const component =
    name.replace(/[^a-zA-Z0-9]/g, "").replace(/^[^a-zA-Z]+/, "") ||
    "MyComponent";
  const className = component[0].toUpperCase() + component.slice(1),
    slug = component.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const page = currentPage(project),
    script = interactionScript(page),
    css = projectCss(project);
  const readme = `# ${className}\n\nThis export contains only the chosen design, its extracted CSS, local assets and supported interactions. No CodeShip runtime or backend is required.\n\n${target === "angular" ? `Angular 21+ standalone component. Copy these files and assets into your app; import ${className}Component and add it to the consuming component's imports. Use <app-${slug}></app-${slug}>. Keep the template/CSS beside the TypeScript file.` : target === "nextjs" ? `React 19 / Next.js App Router: copy ${className}.tsx, its CSS Module and assets. Import ${className} from './${className}' and render <${className} />. The component has a client boundary only when its supported interactions require one. Copy public assets into your application's public directory.` : "Insert the HTML into your page, include styles.css, and load script.js when included. Keep the assets folder next to the HTML."}\n\nResponsive media/container rules are preserved. Review retained advanced selectors and unresolved external URLs in your destination application's context.\n`;
  if (target === "html")
    return {
      "index.html": snippet
        ? renderNode(page.root)
        : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(name)}</title><link rel="stylesheet" href="styles.css"></head><body>${renderNode(page.root)}${script ? '<script src="script.js"></script>' : ""}</body></html>`,
      "styles.css": css,
      ...(script ? { "script.js": script } : {}),
      "README.md": readme,
    };
  if (target === "angular") {
    const scoped = postcss.parse(css);
    scoped.walkRules((rule) => {
      rule.selector = rule.selector.replace(
        /(^|,\s*)(:root|html|body)(?=\s|,|$)/g,
        "$1:host",
      );
    });
    const localScript = script.replaceAll(
      "document.querySelector",
      "this.host.nativeElement.querySelector",
    );
    return {
      [`${slug}.component.ts`]: `import { Component, ElementRef, inject, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';\n@Component({selector:'app-${slug}',standalone:true,schemas:[CUSTOM_ELEMENTS_SCHEMA],templateUrl:'./${slug}.component.html',styleUrl:'./${slug}.component.css'})\nexport class ${className}Component implements AfterViewInit, OnDestroy { private readonly host:ElementRef<HTMLElement>=inject(ElementRef); private controller?:AbortController; ngAfterViewInit():void{${localScript}${script ? "this.controller=interactionController;" : ""}}ngOnDestroy():void{this.controller?.abort();}}`,
      [`${slug}.component.html`]: angularTemplate(page.root),
      [`${slug}.component.css`]: scoped.toString(),
      "README.md": readme,
    };
  }
  const module = postcss.parse(css);
  module.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name))
      return;
    rule.selector = postcss.list
      .comma(rule.selector)
      .map((s) =>
        s === ":root" || s === "body" || s === "html"
          ? ".root"
          : `.root :global(${s})`,
      )
      .join(", ");
  });
  module.prepend(
    postcss.rule({
      selector: ".root",
      nodes: [postcss.decl({ prop: "display", value: "contents" })],
    }),
  );
  const localScript = script.replaceAll(
    "document.querySelector",
    "host.current?.querySelector",
  );
  const custom = new Set<string>();
  walk(page.root, (n) => {
    if (n.tag.includes("-")) custom.add(n.tag);
  });
  return {
    [`${className}.tsx`]: `${script ? `'use client';\nimport { useEffect, useRef } from 'react';\n` : ""}import styles from './${className}.module.css';\nexport default function ${className}(){${script ? `const host=useRef<HTMLDivElement>(null);useEffect(()=>{${localScript}return()=>interactionController.abort();},[]);` : ""}return <div ${script ? "ref={host} " : ""}className={styles.root}>${jsx(page.root)}</div>;}`,
    [`${className}.module.css`]: module.toString(),
    "README.md": readme,
    ...(custom.size
      ? {
          "custom-elements.d.ts": `import type { DetailedHTMLProps, HTMLAttributes } from 'react';declare module 'react' {namespace JSX {interface IntrinsicElements {${[...custom].map((t) => `${JSON.stringify(t)}: DetailedHTMLProps<HTMLAttributes<HTMLElement>,HTMLElement> & Record<string,unknown>;`).join("")}}}}`,
        }
      : {}),
  };
}

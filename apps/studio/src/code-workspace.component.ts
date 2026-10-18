import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type * as Monaco from "monaco-editor";
import { EditorStore } from "../../../packages/editor-core/store";
import { interactionScript, renderNode } from "../../../packages/codegen-core";
import { parseCss } from "../../../packages/css-engine";
import { importHtml } from "../../../packages/editor-core/import";
import { IconComponent } from "./ui/icon.component";
import { PreferencesService } from "./preferences.service";
import { copyText } from "../../../packages/desktop-bridge";
import { exportComponent } from "../../../packages/codegen-core/component-export";
interface AmdRequire {
  (
    deps: string[],
    callback: () => void,
    error?: (error: unknown) => void,
  ): void;
  config(config: { paths: Record<string, string> }): void;
}
declare global {
  interface Window {
    require?: AmdRequire;
    monaco?: typeof Monaco;
  }
}
let monacoPromise: Promise<typeof Monaco> | undefined;
function loadMonaco(): Promise<typeof Monaco> {
  return (monacoPromise ??= new Promise((resolve, reject) => {
    const init = () => {
      const req = window.require;
      if (!req) {
        reject(new Error("Code editor loader unavailable."));
        return;
      }
      req.config({ paths: { vs: "/monaco/vs" } });
      req(
        ["vs/editor/editor.main"],
        () =>
          window.monaco
            ? resolve(window.monaco)
            : reject(new Error("Code editor failed to start.")),
        reject,
      );
    };
    if (window.monaco) resolve(window.monaco);
    else if (typeof window.require === "function") init();
    else {
      const script = document.createElement("script");
      script.src = "/monaco/vs/loader.js";
      script.onload = init;
      script.onerror = () =>
        reject(new Error("Monaco unavailable. Plain-text editing is active."));
      document.head.append(script);
    }
  }));
}
@Component({
  selector: "cs-code-workspace",
  imports: [FormsModule, IconComponent],
  templateUrl: "./code-workspace.component.html",
})
export class CodeWorkspaceComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(EditorStore);
  readonly collapsed = input(true);
  readonly toggle = output<void>();
  readonly maximized = input(false);
  readonly maximize = output<void>();
  readonly export = output<void>();
  readonly tab = signal("html");
  readonly text = signal("");
  readonly dirty = signal(false);
  readonly error = signal("");
  readonly fallback = signal(false);
  readonly tabs = [
    ["html", "HTML"],
    ["css", "CSS"],
    ["media", "Media queries"],
    ["animation", "Keyframes"],
    ["script", "JavaScript"],
    ["typescript", "TypeScript"],
    ["problems", "Diagnostics"],
  ];
  @ViewChild("editorHost") host?: ElementRef<HTMLDivElement>;
  private editor?: Monaco.editor.IStandaloneCodeEditor;
  private suppress = false;
  private destroyed = false;
  readonly source = computed(() => {
    const page = this.store.page();
    if (this.tab() === "html") return renderNode(page.root);
    if (this.tab() === "typescript")
      return String(
        exportComponent(this.store.project(), "angular", "Screen")[
          "screen.component.ts"
        ],
      );
    if (this.tab() === "script")
      return (
        interactionScript(page) ||
        "// Configure supported interactions in HTML → Interactions.\n// No JavaScript is required by this page."
      );
    if (this.tab() === "media" || this.tab() === "animation") {
      const root = parseCss(page.css).root;
      const parts: string[] = [];
      root?.walkAtRules((at) => {
        if (
          this.tab() === "media"
            ? ["media", "container"].includes(at.name)
            : at.name.includes("keyframes")
        )
          parts.push(at.toString());
      });
      return (
        parts.join("\n\n") ||
        "/* No rules yet. Create them in Responsive studio or Motion. */"
      );
    }
    return page.css;
  });
  constructor() {
    const preferences = inject(PreferencesService);
    effect(() => {
      window.monaco?.editor.setTheme(
        preferences.resolvedTheme() === "light" ? "vs" : "vs-dark",
      );
    });
    effect(() => {
      const value = this.source();
      if (!this.dirty()) {
        this.text.set(value);
        if (this.editor && this.editor.getValue() !== value) {
          this.suppress = true;
          this.editor.setValue(value);
          this.suppress = false;
        }
      }
    });
    effect(() => {
      this.collapsed();
      queueMicrotask(() => {
        this.editor?.layout();
        if (!this.collapsed()) void this.initialize();
      });
    });
  }
  ngAfterViewInit(): void {
    if (!this.collapsed()) void this.initialize();
  }
  private async initialize(): Promise<void> {
    if (this.editor || !this.host?.nativeElement || this.destroyed) return;
    try {
      const monaco = await loadMonaco();
      if (this.editor || this.destroyed) return;
      this.editor = monaco.editor.create(this.host.nativeElement, {
        value: this.text(),
        language:
          this.tab() === "html"
            ? "html"
            : this.tab() === "typescript"
              ? "typescript"
              : this.tab() === "script"
                ? "javascript"
                : "css",
        theme:
          document.documentElement.dataset["theme"] === "light"
            ? "vs"
            : "vs-dark",
        fontSize: 12,
        fontFamily: "Consolas, monospace",
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        wordWrap: "on",
        tabSize: 2,
        readOnly: !["html", "css"].includes(this.tab()),
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
      });
      this.editor.onDidChangeModelContent(() => {
        if (!this.suppress) {
          this.text.set(this.editor!.getValue());
          this.dirty.set(true);
        }
      });
    } catch (error) {
      this.fallback.set(true);
      this.error.set(error instanceof Error ? error.message : String(error));
    }
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    const model = this.editor?.getModel();
    this.editor?.dispose();
    model?.dispose();
  }
  select(tab: string): void {
    if (this.dirty()) {
      this.error.set(
        "Apply or discard your source changes before switching tabs.",
      );
      return;
    }
    this.tab.set(tab);
    this.error.set("");
    if (this.collapsed()) this.toggle.emit();
    const monaco = window.monaco;
    const model = this.editor?.getModel();
    if (monaco && model)
      monaco.editor.setModelLanguage(
        model,
        tab === "html"
          ? "html"
          : tab === "typescript"
            ? "typescript"
            : tab === "script"
              ? "javascript"
              : "css",
      );
    this.editor?.updateOptions({ readOnly: !["html", "css"].includes(tab) });
  }
  discard(): void {
    this.dirty.set(false);
    this.error.set("");
  }
  async copy() {
    try {
      await copyText(this.text());
      this.store.notify("Source copied.");
    } catch (error) {
      this.error.set(String(error));
    }
  }
  async format() {
    try {
      const prettier = await import("prettier/standalone");
      const html = await import("prettier/plugins/html");
      const postcss = await import("prettier/plugins/postcss");
      const babel = await import("prettier/plugins/babel");
      const estree = await import("prettier/plugins/estree");
      const typescript = await import("prettier/plugins/typescript");
      const value = await prettier.format(this.text(), {
        parser:
          this.tab() === "html"
            ? "html"
            : this.tab() === "script"
              ? "babel"
              : this.tab() === "typescript"
                ? "typescript"
                : "css",
        plugins: [html, postcss, babel, estree, typescript],
      });
      if (this.editor)
        this.editor.executeEdits("format", [
          { range: this.editor.getModel()!.getFullModelRange(), text: value },
        ]);
      else {
        this.text.set(value);
        this.dirty.set(["html", "css"].includes(this.tab()));
      }
      this.error.set("");
    } catch (error) {
      this.error.set(String(error));
    }
  }
  apply(): void {
    try {
      if (this.tab() === "css") {
        const parsed = parseCss(this.text());
        if (parsed.error) throw new Error(parsed.error);
        if (!this.store.setCss(this.text()))
          throw new Error(
            "CSS could not be applied. Your source edits are preserved for correction.",
          );
      } else if (this.tab() === "html") {
        const imported = importHtml(
          this.text(),
          this.store.page().css,
          this.store.page().root,
        );
        const applied = this.store.transact("Apply HTML source", (p) => {
          const page = p.pages.find((pg) => pg.id === p.activePageId)!;
          page.root = imported.root;
          page.css = imported.css;
        });
        if (!applied)
          throw new Error(
            "HTML could not be applied. Your source edits are preserved for correction.",
          );
        this.store.selected.set([]);
        if (imported.warnings.length)
          this.store.notify(imported.warnings.join(" "));
      }
      this.dirty.set(false);
      this.error.set("");
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    }
  }
}

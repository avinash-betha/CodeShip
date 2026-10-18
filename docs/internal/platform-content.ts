import {
  type DocArticle,
  section as s,
} from "../../apps/studio/src/docs-model";

export const internalArticles: DocArticle[] = [
  {
    id: "architecture",
    title: "CodeShip architecture",
    category: "Internal developer guides",
    group: "Maintaining CodeShip",
    action: "code",
    intro:
      "Trace a document change from Angular controls through the shared model, canvas, persistence and exporters. This guide is for maintainers changing CodeShip itself; installing generated UI components uses the separate Code Export guides.",
    related: [
      "development-setup",
      "document-format",
      "extending-library",
      "testing",
    ],
    sections: [
      s("modules", "Find the module that owns the change", [
        "apps/studio/src contains the Angular shell, canvas, library, inspector, documentation and code workspace. packages/document-model defines Project/Page/ElementNode and migrations. packages/editor-core/store.ts owns selection, immutable document transactions, history, validation and save coordination; geometry.ts contains placement/resize helpers and import.ts converts sanitized source.",
        "packages/css-engine uses PostCSS for parsing and scoped declaration edits. packages/responsive-engine derives recommendations from measured layouts. packages/animation-engine generates motion CSS. packages/component-registry supplies primitive entries, component factories, screen factories, presets and shared styles; packages/icon-factory supplies the original vector system.",
        "packages/codegen-core renders common markup, extracts selections/dependencies, formats files and creates ZIPs. exporter-html, exporter-angular and exporter-nextjs specialize target syntax and project scaffolding. packages/persistence chooses browser or native storage through packages/desktop-bridge. apps/desktop owns main, preload and filesystem storage.",
      ]),
      s("document", "Keep the universal model authoritative", [
        "Project stores pages, tokens, assets, component snapshots and metadata. Each Page has root and CSS source. ElementNode stores id/tag/name/attributes/text/children/interactions. IDs join style selectors and interaction targets; cloning/reusable insertion remaps them rather than sharing mutable nodes.",
        "Use store transactions for applied document mutations so validation/history/autosave remain coordinated. UI-only state such as panel visibility or a source draft belongs outside the document. Inspector edits commit immediately; HTML/CSS source application validates and commits a replacement in one operation. Saved blocks are snapshots, not live linked definitions.",
      ]),
      s("canvas", "Separate editable rendering from live behavior", [
        "canvas.component renders the active document in an iframe and owns parent-surface pointer, keyboard, selection and geometry handling. The editing frame permits same-origin access for measurement but no scripts. Live preview uses supported generated scripts in a sandbox without same-origin privileges. Keep those capabilities separate when changing preview behavior.",
        "Responsive measurement renders seven sample widths before recommendations are reviewed. Zoom transforms the visible stage, while viewport dimensions affect CSS. A pointer gesture needs coordinate conversion through zoom and a single final history transaction, not dozens of autosaved micro-edits.",
      ]),
      s("desktop", "Respect main, preload and renderer boundaries", [
        "Electron main creates a sandboxed/context-isolated BrowserWindow, registers codeship://app and owns native file/menu/window APIs. preload exposes a frozen explicit bridge; the renderer does not receive filesystem or Node access. Validate IPC payloads, the top-level sender and authorized project/export paths in the host.",
        "The local protocol confines files to the renderer bundle and serves correct MIME/CSP headers. Navigation, popups and permissions are restricted. Keep script CSP strict and Angular critical-CSS inlining disabled: the optimized inline onload stylesheet switch is incompatible with that policy. Do not weaken the host to solve an asset-path error.",
      ]),
      s("persistence", "Follow a save and an export separately", [
        "Native persistence serializes writes, externalizes content-hashed assets, flushes/replaces JSON atomically and retains backups. Settings/recent references use userData; projects use their own folders. Switching/closing must preserve an unsaved draft if persistence fails. Browser IndexedDB remains a development fallback.",
        "generateExport validates the applied project, extracts scope, localizes assets, selects a target exporter and formats resulting files. Source output is independent of editor metadata. Component export differs from complete-project scaffolding; changes to either path need real target build/runtime fixtures, not only string snapshots.",
      ]),
      s("change", "Make a focused change safely", [], {
        steps: [
          "Locate the model/engine that owns the behavior and reproduce it with a minimal project.",
          "Change the shared operation rather than adding a renderer-only workaround when state must persist/export.",
          "Add meaningful regression coverage for the failure, then run lint, typecheck and affected unit/browser/export/native checks.",
          "Build the renderer and test the packaged boundary if changing CSP, assets, preload, persistence or startup. Record which exact artifact was checked.",
        ],
      }),
    ],
  },
  {
    id: "extending-library",
    title: "Adding components and screen templates",
    category: "Internal developer guides",
    group: "Maintaining CodeShip",
    action: "components",
    intro:
      "Extend the bundled library with factories that create fresh universal-model nodes and safe CSS. A new entry must work in the editor, mobile preview and independent framework exports, rather than depending on Angular editor components at runtime.",
    related: ["architecture", "testing", "components", "templates"],
    sections: [
      s("entry", "Use the existing factory contract", [
        "LibraryEntry is declared in packages/component-registry/index.ts with id, name, description, category, icon and create(). create returns a fresh {root, css}; use element() so every insertion gets new IDs. modern.ts contains modern component entries, screens.ts contains complete modern screens, and index.ts exports the combined components/templates arrays.",
        "Add scoped CSS beside the appropriate existing style system. A factory's icon field names a CodeShip UI symbol, while an SVG inside the design is an actual model node. Categories are derived from entries by the library, so choose an existing category unless the pattern warrants another one.",
      ]),
      s("example", "Create a small editable notice factory", [], {
        code: {
          language: "typescript",
          text: `// Example module beside packages/component-registry/index.ts:
import { element } from '../document-model';
import type { LibraryEntry } from './index';

export const noticeEntry: LibraryEntry = {
  id: 'project-notice', name: 'Project notice', category: 'Feedback',
  icon: 'box', description: 'A labeled status notice with editable text.',
  create: () => ({
    root: element('aside', '', { class: 'project-notice' }, [
      element('h2', 'Project saved'),
      element('p', 'Your latest changes are available locally.'),
    ]),
    css: '.project-notice { padding: 24px; border: 1px solid #d7dfd6; border-radius: 12px; }',
  }),
};`,
          caption:
            "Import noticeEntry and include it in the exported components array. Do not reuse a previously created root across insertions.",
        },
      }),
      s("steps", "Verify the complete insertion workflow", [], {
        steps: [
          "Register the entry in components, or in templates if it is a replacement screen. Use a stable unique id and meaningful name/description for local search.",
          "Preview it through the library eye button at 375px and 1200px. Insert it twice and confirm independent IDs, editable text and styles.",
          "Test insertion into a valid parent, nested selection, copy/paste, save/reopen and Undo.",
          "Check long labels and intermediate widths. Use flexible tracks and field wrappers rather than fixed desktop dimensions.",
          "Export it as HTML, Angular and Next.js. Build and serve the generated fixtures to detect template syntax, CSS Module, asset and runtime failures.",
        ],
      }),
      s("interactions", "Use supported declarative interactions", [
        "Interaction events/actions are defined in packages/document-model. Common runtime behavior is emitted by packages/codegen-core/runtime.ts. Target actual node IDs and ensure cloning/extraction remaps or warns about those dependencies. Avoid editor-only event handlers or arbitrary imported scripts inside the design.",
        "A new action requires model validation, preview/runtime behavior, target export cleanup and tests. It should degrade accessibly and document what data it does or does not persist. A new screen using a demo authentication form must not imply that it provides a remote authentication service.",
      ]),
      s("maintain", "Keep documentation and tests aligned", [
        "Update the relevant library guide when labels, categories or supported controls change. Counts in articles are release inventory and should be checked against the registry. The documentation content modules are typed DocArticle arrays; retain stable article/section links, add related references and verify offline search after editing.",
      ]),
    ],
  },
  {
    id: "testing",
    title: "Testing and packaged-app verification",
    category: "Internal developer guides",
    group: "Maintaining CodeShip",
    action: "code",
    intro:
      "Choose checks according to the boundary that changed, then record results against the exact source or artifact. A successful Angular build does not prove generated applications or native project storage work.",
    related: [
      "architecture",
      "run-locally",
      "build-windows",
      "release-checklist",
    ],
    sections: [
      s("local", "Run fast checks from the repository root", [], {
        code: {
          language: "powershell",
          text: `corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm docs:build`,
          caption:
            "Lint, strict TypeScript, Vitest and Angular compilation cover different failure classes. docs:build generates the separate HTML developer reference and Windows Markdown guide from docs/internal sources.",
        },
      }),
      s("browser", "Exercise real renderer workflows", [
        "pnpm test:e2e uses Playwright with Chromium, Firefox and WebKit, one worker and a local 127.0.0.1:4200 server. A running development server can be reused. Use a focused file/grep/project selection during iteration, then broaden when a shared behavior changed. Do not overlap runners writing the same test-results directory.",
        "Failures retain traces/screenshots. Inspect the first relevant failure and its UI state; do not update visual baselines merely to remove a difference. Documentation checks should load every article, resolve internal links, verify search/copy/deep links and exercise editor actions without changing the project.",
      ]),
      s("exports", "Build independent generated applications", [], {
        code: {
          language: "powershell",
          text: `corepack pnpm test:exports`,
          caption:
            "scripts/verify-exports.ts installs/builds/serves generated HTML, Angular and Next.js fixtures, including component catalogues. It needs network/cache access and takes longer than a string-level unit test.",
        },
      }),
      s("native", "Check the trusted desktop boundary", [
        "After desktop:build, test:desktop launches an isolated Electron profile and exercises offline startup, real styles/Monaco, clipboard, files, save failure, backup/recovery, export confinement and window modes. CODESHIP_PACKAGED_EXE selects an unpacked or installed executable instead of the local host bundle. Use an absolute verified path.",
        "test:installer performs an isolated Windows install, installed-app smoke and uninstall with project retention. It guards existing installs/shortcuts and active CodeShip processes. Run it sequentially with other native helpers: an NSIS uninstaller can close matching app processes. test:portable checks extraction, launch and native initial save of the portable artifact; use test:desktop on unpacked/installed builds for the broader control suite.",
      ]),
      s("evidence", "Record evidence without overstating coverage", [], {
        steps: [
          "Record source changes, commands, pass/fail/skip counts and any focused follow-up after a fix. A failed broad run plus focused reruns is not an unchanged-source full-suite pass.",
          "Rebuild packages after source edits before assigning results to an installer. Record artifact size/hash/version and the path used by native tests.",
          "Keep logs/screenshots under the existing generated/evidence locations and update DEVELOPMENT_PROGRESS.md with completed work and remaining release gates.",
          "Treat clean-VM upgrades, signing and manual assistive-technology review as explicit gates until they have actually been performed. Do not substitute a prior artifact's evidence for a new package.",
        ],
      }),
    ],
  },
];

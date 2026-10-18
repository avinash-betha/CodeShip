# Testing

Use the commands in README.md. Test outcomes and the latest exact counts belong in DEVELOPMENT_PROGRESS.md.

The desktop upgrade adds five real-filesystem tests, selected-style/dependency extraction and geometry coverage. Enterprise browser cases cover offline articles, light appearance, selected component files, glass effects, spacing, freeform movement and aspect locking. Library cases validate 134 components at three widths and execute local table, tags, chat, dialogs and kanban pointer movement. Forty screens are measured at eight widths in every configured browser engine.

`test:desktop` uses a real Electron process with isolated temporary preferences and project folders. Set `CODESHIP_PACKAGED_EXE` to test the packaged binary. The smoke checks sandbox isolation, offline native save/reload, local Monaco, backups, recovered-copy identities, theme persistence, filesystem export, path traversal and bounded clipboard IPC. Native dialog and clipboard endpoints are stubbed inside this test process to avoid writing to the user's clipboard or requiring manual folder choices. This is not an installer install/uninstall test.

## Unit and integration coverage

Vitest uses jsdom and fake-indexeddb. Tests exercise pure tree operations, rejection of invalid operations, history, schema serialization/migration, import security, accessibility diagnostics, a 1,500-element operation budget, AST CSS preservation, contextual declarations, duplicated style selectors, import round trips, tracked source identities, generated animations, measured responsive rule inputs, derived queries, alternatives, project persistence, every screen's editable structure, target generation, ZIP content, and preview CSP.

## Browser coverage

Playwright runs authoring, property changes, interactions, analysis and individual application, mobile/desktop viewports, IndexedDB save/reload, three downloadable ZIPs, safe HTML/CSS import, working Monaco, source changes reflected in canvas, animation creation, identity preservation, simultaneous device previews, cross-frame drag/drop, undo/redo, mobile usability, an axe accessibility audit, and representative screenshots.

The editor's axe audit includes color contrast and uses legacy execution with `iframes:false`: the user-created application is intentionally sandboxed without script permission during editing. User documents receive semantic diagnostics and independent exported-output browser checks; they are not treated as trusted editor UI. Passing axe is not a complete manual WCAG audit.

Browser projects include Chromium, Firefox, and WebKit. Screenshots are separate per engine and OS. The initial Windows baselines are reviewed artifacts, not snapshots generated on every CI run. CI compares them without `--update-snapshots`.

The UI upgrade adds all eleven templates at eight actual widths (320–1440px), overflow/form geometry, iframe width vs zoom and rotation, icon customization/vector history/persistence/SVG and decoded PNG downloads, strict SVG rejection, first-run welcome, tutorial pause/resume/action completion, phone-sized editor dialogs, and accessibility audits of the new entry points. Original-icon variant geometry, saved gradients, all-target serialization and exact legacy CSS migration have unit fixtures. `scripts/capture-upgrade.ts` writes reviewable UI and responsive screenshots under `docs/screenshots/` while the development server is running.

## Export verification

Generated Angular and Next.js projects are installed and production-built independently, rather than parsed or compiled inside the editor. After all builds, a local HTTP fixture serves each output and Playwright verifies rendering, asset resolution, repeated class toggling, a second page, and uncaught runtime errors. `.generated` source folders are safely replaced on subsequent runs; dependency/build caches are retained. No publishing or external services are involved.

The upgrade fixture also renders duplicated inline gradient icons and two instances of each standalone icon component. It checks actual SVG namespaces, locally resolving gradient references, unique per-instance IDs, and absence of page overflow at 375px in HTML, Angular and Next.js output.

## Practical limits

The performance assertion is a practical smoke test, not an enterprise-scale benchmark. Browser layout measurements and screenshots depend on fonts, assets, engine versions, OS, and available resources. The baseline editor's accessibility is audited; every inspector state and arbitrary generated project still needs contextual testing. No load, penetration, or independent security audit has been claimed.

The exporter fixture now compiles all 134 factory outputs in an Angular deferred catalogue and a statically generated Next.js catalogue route. This catches framework attribute types (including numeric ARIA values), CSS Module purity and listener typing across the shipped library. The native smoke also injects a failed save and verifies that project switching cannot discard the unsaved draft.

Final continuation adds documentation registry/link/asset integrity, CSS punctuation/priority, full-screen state preservation, responsive export layout, button/input icon geometry, native copy-links and portable startup/native-save verification. `pnpm test:portable` uses a private temporary profile and stops only its own process tree. Exact broad-run/follow-up counts are recorded in DEVELOPMENT_PROGRESS.md.

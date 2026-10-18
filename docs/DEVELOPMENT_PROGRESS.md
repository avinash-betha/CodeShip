# Development progress

## October 18: final branding, Docs entry and existing button icons

- Kept one Docs action in the application header and removed the adjacent duplicate book action.
- Tuned the supplied neon artwork with built-in imagegen into a square transparent master. Exported PNG sizes 16 through 512, seven-resolution Windows ICO, favicon/touch assets and compatible legacy SVG image wrappers. App/window, executable, installer/uninstaller, portable launcher, main header and Docs header share this artwork. Functional editor icons remain editable vectors. APP_BRANDING.md records the source, prompt and export workflow.
- Existing canvas SVGs can be dragged into buttons/links or placed using Button icon placement in the inspector. Before/after/above/below/icon-only preserve vector identity, button text and interactions. Returning from icon-only restores the label. Each placement is one Undo transaction. Icon Factory insertion uses the same shared helper. Fixed HTML button insertion accidentally targeting a selected SVG namespace while retaining valid vector layers.
- Updated the customer Icon Factory tutorial. Internal developer guides remain separate offline HTML, excluded from the production renderer and packaged ASAR. Existing saved user content is retained.
- Final checks passed: **63 unit/integration tests**, strict typecheck, lint and production renderer/main/preload builds. Placement, pointer dragging, drag/drop payloads, Undo, save/reload, retained labels and branding passed in Chromium, Firefox and WebKit. Existing CSS reset/button/field-icon regressions passed in all three. Four customer-documentation regressions passed in Chromium, covering every customer article, code copy/search/links, workflow actions preserving the project, internal exclusion and app-owned punctuation.
- Final installer passed isolated install, offline Electron/runtime checks, native save/reload, local Monaco, backup/export, sandbox/path checks, uninstall and project retention. Evidence: `%TEMP%/codeship-desktop-verify-ss72mF`; installer fixture: `.generated/installer-80d4533b65904796addb8b714526cc7f`. Portable launch/native save passed in `%TEMP%/codeship-portable-verify-NdGcRY`. New icons were visually inspected from application, installer and portable executable resources.
- Installer, portable executable and complete editable source archive are refreshed in release/. Current hashes and checks are in release/release-manifest.json. Existing signing, clean-VM/upgrade and independent review gates still apply.

## October 18: customer documentation and internal reference separation

This follow-up supersedes the previous mixed-documentation delivery. Production customers receive only user-facing help; internal engineering content remains available to maintainers as a separate HTML file.

- Moved all eight internal articles from the Angular source to `docs/internal/platform-content.ts` and `desktop-content.ts`. The customer registry contains **37 guides across eight navigation areas**, with no developer category, internal links or internal search payload. Old internal-guide URLs and remembered selections safely fall back to the introduction; customer bookmarks and article IDs remain usable.
- `pnpm docs:build` generates **docs/internal/developer-guide.html**, a standalone offline reference containing all eight internal chapters with search, copyable commands, theme switching and printing. Its companion Windows Markdown guide is maintained outside the application as well. Neither is a renderer/public asset or part of the installer payload.
- Replaced app-authored em/en dashes with ordinary punctuation or words in titles, labels, help text, new default/template names, future generated project-folder separators and generated HTML page titles. Existing project names/content and existing file locations are retained.
- Added production bundle verification (`pnpm docs:verify-production`) to detect accidental reintroduction of internal guide content. The production renderer passes that check. Updated documentation tests to exercise public guides, removed-guide URL/preferences handling and the standalone reference.
- Verification completed so far: **55 unit/integration tests**, lint, strict typecheck and production renderer/main/preload compilation. Customer documentation and standalone HTML were verified across Chromium/Firefox/WebKit: 23/24 broad cases passed, with one WebKit stability timeout passing separately on the unchanged source (1/1). All 24 distinct cases are covered, including offline HTML search/copy/theme/print, customer search/navigation/bookmarks/accessibility, all 37 articles, internal-guide exclusion and saved-design preservation. Production renderer and packaged ASAR checks both confirm internal content is absent.

### Updated desktop delivery

The rebuilt installer passed its isolated install, installed native/offline smoke, uninstall and retained-project/registry checks. Evidence: `release/install-verification.json`, fixture `.generated/installer-d5b77c06f01b428dbfae1747ec05c5b5`, native profile `%TEMP%/codeship-desktop-verify-6TiTDj`. The rebuilt portable EXE extracted, launched and saved through native IPC in `%TEMP%/codeship-portable-verify-xByHx6`. App guides show 37 customer topics; the internal search phrase returns no results.

- Installer: `release/CodeShip-0.2.0-x64.exe`; 116,905,784 bytes; SHA-256 **1E064FEAFD39DB1C20A6193E7F52534EE918048445D2E687776E468B47654564**.
- Portable: `release/CodeShip-0.2.0-x64-portable.exe`; 116,667,227 bytes; SHA-256 **E818A668B007C1E14B9843F27FD17655074FCB55EDA74F8DEE48832C4F95E5EF**.

The separate HTML reference is `docs/internal/developer-guide.html`. The refreshed source ZIP includes it for maintainers; customer EXEs exclude it. Builds remain unsigned; existing signing and clean-VM/upgrade release gates remain. Final source/reference hashes are recorded in `release/release-manifest.json`.

## Earlier October 18: documentation content overhaul

The active brief is `docs/specs/documentation-content-overhaul.md`. The existing documentation layout and editor engines are preserved. Content ownership and maintenance instructions are in `docs/DOCUMENTATION_CONTENT.md`.

- Replaced all 29 shallow shared help articles and rewrote the eight supplementary user guides with feature-specific tutorials, real controls/options, expected results, saving/export behavior and troubleshooting. Components now teaches a complete button/form/block/export workflow, including editing nested labels, replacing the button's existing SVG and closing the factory before returning to the canvas.
- Audited and expanded the five desktop development guides; added architecture, library-extension and testing guides. All **42 existing article IDs** remain available; the registry now has **45 guides** in the nine requested navigation areas. All user articles and internal guides are complete for this brief; **no next unfinished documentation section remains**.
- Added practical HTML/CSS, Angular standalone and Next.js App Router examples matching actual exporter files, class/selector names, asset locations, supported versions and lifecycle behavior. Documented current limitations explicitly, including sample backend behavior, snapshot blocks, measured responsive widths and unapplied source drafts.
- Removed the obsolete generic article registry/supplement mapping. Retained the shared safe syntax tokenizer. Full-text search includes stable-ID aliases (retaining FAQ/Visual Studio queries), code captions, illustrations, callouts and link labels. Existing bookmarks/article addresses survive; aliases retain earlier section fragments. Related reading prioritizes deliberate links. Highlighting no longer splits words with unwanted whitespace.
- Typed documentation actions open Insert/Layers, Design/HTML/Motion, source, projects/settings/import/export, factory, analysis, tutorial or view modes. Every used action was exercised while comparing saved project data; none inserted content, replaced a page or changed the saved design.
- Validation completed: **53/53 unit/integration tests**, lint, strict TypeScript and production renderer build. **18/18 focused documentation browser checks** passed across Chromium/Firefox/WebKit, including every article and exact rendered code, search/copy, legacy links, bookmarks, expanded/narrow views, accessibility and existing export integration. After the final control-location and icon-replacement wording review, all 45 article render/code checks passed again in all three engines (3/3 focused follow-ups). Final search compatibility/copy/deep-link checks also passed 3/3 across the engines. `pnpm docs:build` regenerated the canonical Windows build guide.
- Screenshots: `docs/screenshots/documentation-components.png` and `documentation-components-tutorial.png`. Production renderer/main/preload and Windows x64 NSIS/portable packaging passed using Node 22. Native local-host smoke passed with the expanded Components tutorial/45-guide inventory, as well as its existing offline/CSP/styles/Monaco/file/backup/recovery/clipboard/export/save-failure/window-mode checks. Evidence fixture: `%TEMP%/codeship-desktop-verify-wMdgXs`. The final NSIS also passed its isolated install, expanded Components/FAQ search/native app smoke, uninstall, registry cleanup and project retention checks (`release/install-verification.json`, fixture `.generated/installer-aaa093b8242d45e493ae489222eeea5d`). Installed native evidence: `%TEMP%/codeship-desktop-verify-JOQnIA`.

The broader pre-existing signing, clean-VM/existing-install upgrade and independent audit release gates remain separate from the completed documentation scope. Earlier release evidence below applies to its named builds; regenerated executables require their own hashes/checks.

### Refreshed documentation delivery artifacts

Both Windows packages contain the final documentation/search changes and remain unsigned beta artifacts. The earlier complete browser/export evidence below is historical; this documentation delivery ran the focused documentation suites and current installed native smoke. No exporter or persistence implementation was changed.

- Installer: `release/CodeShip-0.2.0-x64.exe` — 116,915,243 bytes; SHA-256 **824FCC14C5E0FBC6C065CD40B530E5A80AB74DF1447687EFDD4B77273057BFDC**.
- Portable: `release/CodeShip-0.2.0-x64-portable.exe` — 116,676,687 bytes; SHA-256 **B8D03516BEB4987B0AC6FDAE06E80B9BCC2E041E2A349EB12F7C9C3F9636CD77**.

The final portable EXE also extracted, launched offline and completed a valid native save in the isolated `%TEMP%/codeship-portable-verify-bbjdhw` profile.

The source ZIP is regenerated after this record with `pnpm source:package`; its final size/hash/integrity are in `release/release-manifest.json`.

## Earlier October 18 — final continuation and verified handoff

This earlier delivery used the active extensions are `docs/specs/fullscreen-documentation.md` and `docs/specs/final-quality.md`; the existing project schema, native storage, exports and editor engines are preserved.

- Reworked export configuration into responsive labeled fields; component naming is conditional. Scoped statistics use accurate plural labels, framework controls have clear keyboard/selected states, and source preview has a file tree, syntax tokens, line numbers, selection copy, vertical resizing, full-window expansion and contextual ZIP/component/screen actions.
- Fixed the shared stylesheet entry so all tools receive base/enterprise styles through the existing Angular entry. Improved preset cards, inspector fields, property reset controls, dialog spacing, phone toolbars and narrow Icon Factory controls. Added the visible Docs action directly beside the existing book action.
- Added native full screen through validated preload methods and native state events, canvas focus, live isolated preview with Desktop/Laptop/Tablet/Mobile/custom/rotation, maximized persistent Monaco and documentation reading mode. Native F11, visible exits and appropriate Escape handling are retained. Mode changes preserve project, selection, viewport, zoom and panel layout.
- Added 42 structured offline guides with collapsible navigation, full-text search/highlighting, breadcrumbs, heading navigation, bookmarks, deep links, local illustrations, copy controls, printing, related links and versioning. The Windows build guide is generated from the same article bundled in the application. Documentation close cancels pending navigation work and clears its fragment before reload.
- Extended onboarding to 22 persisted action-aware steps, including component insertion, direct spacing, navbar, focus, full-screen preview and integration guides. Existing twelve/sixteen-step progress remains compatible. Next, Back, Skip, Pause, Resume and Restart are available.
- Preserved unfamiliar CSS and added AST validation for quoted punctuation/important priority in individual declarations. Added property/section/draft reset and autocomplete. Undo/Redo preserve a selection when the node still exists. Spacing handles stay reachable inside a tall canvas selection.
- Button icons support before/after/above/below/icon-only arrangements while keeping label content and behavior. Inputs retain their identities and labels inside a safe icon wrapper with sufficient padding. Original collection now contains 93 SVG symbols. Existing component, screen, animation, responsive and local-file functionality remains available.

Verification: **49 unit/integration tests**, strict TypeScript and ESLint passed. The broad three-engine run passed **78/81** cases and exposed one phone-toolbar collision in each engine. That collision was fixed and **3/3** phone follow-ups passed. All **18** focused workspace cases have passed after polish, including the enhanced button/input icon test in **3/3** engines. Together the 81 distinct browser scenarios are verified across the broad run and focused corrections; the last broad run itself is not reported as 81/81. Desktop visual baselines were intentionally updated after inspection and then compared in the broad run.

Actual HTML, Angular and Next.js production builds and served runtime checks passed, including all **134** component factories in Angular and Next.js catalogues. The actual development command built the development renderer/main/preload, launched hidden Electron and saved its initial native project in an isolated profile. Production Angular/main/preload builds and NSIS/portable packaging passed.

The latest NSIS installer completed an isolated per-user install, installed offline/native smoke and uninstall with project retention and registry cleanup. A separate unpacked smoke also verified native documentation copy-links. The portable EXE extracted, launched the bundled renderer and completed a native save in a private profile. Native smoke includes actual BrowserWindow full-screen state, focus/mobile preview, styles, Monaco, clipboard IPC, recovery, export confinement and injected save-failure protection. Evidence: `release/install-verification.json`, `release/release-manifest.json` and `docs/screenshots/`.

Artifacts are unsigned beta builds. Signing/public distribution, clean-VM/existing-install upgrade coverage and broader independent audits remain release gates. Source ZIP creation is repeatable with `pnpm source:package`; it excludes dependencies, generated fixtures and environment files.

Installer SHA-256: **55B7D3AE1A4116D55E646D615DA0BB282A150B93656D1BE1E712916CC093ED4C**. Portable SHA-256: **2DDEB28A8FE6CF5B294584D4018B76DAFDDCBA454F757893033B47E878404E8E**.

## Earlier desktop implementation — October 17 baseline

This section supersedes the earlier browser-only delivery notes below. The latest user attachment is the active specification saved as PROJECT_SPEC.md. No Supabase, SQL database, mandatory account, cloud persistence or expiry worker is required or configured.

- Implemented the sandboxed Electron main/preload boundary, local protocol/CSP, Windows menus and native file tools. Main requests validate the top-level sender and authorized paths. Angular critical-CSS inlining is disabled so its inline stylesheet `onload` cannot conflict with the desktop CSP. Native smoke now checks that actual layout styles are applied.
- Added permanent project folders, readable JSON, immutable raster assets, serial atomic writes, retained backups, explicit backup/recovered copies, storage preferences and native folder export. Recovery uses a new identifier; mixed external folders survive project deletion. Save failures protect the close operation.
- Added light/dark/system appearance, persistent panel/window/tutorial settings, 134 categorized components including 25 new navigation layouts, 40 screens, actual library previews, sixteen presets, configurable glass and working local data/tag/chat/dialog/kanban behavior.
- Added eight resize handles, aspect/min/max constraints, percentage constraints, freeform/flex/grid/flow, direct movement, independent nudging, alignment/ungroup, grid/sibling snapping, guides, insertion indicators and spacing drags. A regression caught and fixed a release-click selecting the parent after a freeform drag.
- Added selected/current/chosen/all-screen export, dependency warnings, reusable Angular TS/template/CSS and Next.js TSX/CSS Modules, conditional client boundaries, copy/ZIP/native-folder output and integration READMEs. Multiple-screen output cannot silently drop pages into a single component.
- Added 29 bundled articles with search/sidebar/TOC/code-copy/related/previous-next/context actions and sixteen action-aware tour steps. Documentation, code editor, icons and formatting work offline.
- Checks: 45 unit/integration cases, strict typecheck and ESLint passed. Real generated HTML/Angular/Next.js builds and served runtime checks passed, including an extracted table/kanban/chat fixture. All components passed three-width checks and all forty screens passed eight-width checks in each browser engine during the expanded run. Final unchanged-source results are recorded below.
- Windows x64 NSIS and unpacked artifacts are generated locally. Unused production dependencies are excluded from ASAR because the desktop processes and renderer are bundled; the archive shrank from about 169 MB to about 29 MB. Artifacts are unsigned. Public distribution, remote CI execution, code signing, other OS installers and independent exhaustive audits are not claimed.

The expanded browser run exposed the freeform bug before its fix and a Chromium artifact collision from overlapping Playwright invocations. A focused freeform rerun passed. The final full run uses one runner and unchanged source.

### Final verification and installer evidence

The unsigned Windows x64 installer completed an isolated per-user install and launched its installed binary with sandbox/CSS/offline/Monaco/native-file/backup/recovery/theme/clipboard/export checks. Uninstall removed the application and registration while preserving a project marker. Evidence: release/install-verification.json and docs/screenshots/desktop-smoke.png. Installer SHA-256: F4D09A04006E616166855DC4145567F106FE5EB14B3B68720327ACD5697C8DAB.

The full browser run passed **60/60 cases** across Chromium, Firefox and WebKit (8.8 minutes), comparing existing Windows screenshots without updating baselines. After small compatibility fixes, **12/12 focused enterprise cases** passed across all three engines, including old-tour migration and hiding editing tools in live preview. Four final Chromium lifecycle/library regressions also passed after strengthening failed-save handling and sort/pagination coordination. All 134 component factories compile as a reusable Angular catalogue and a Next.js CSS Module catalogue route; generated production builds and served runtime checks passed.

Final native smoke injects a save failure, attempts to switch projects, and verifies that the unsaved draft stays open and the prior disk file remains intact. Save as can rescue that draft to a new folder. Final release gates remain: signing/public distribution, clean-VM/upgrade coverage and broader independent accessibility/security audits. No backend service is required.

## Earlier browser delivery history

## October 17 UI upgrade — direct user priorities

The screenshots identified fixed desktop template tracks inside a correctly sized mobile iframe and inline form labels without a shared field rhythm. This delivery focuses on the user's direct request: responsive previews/templates, form spacing and UI quality, an original icon factory, and first-use guidance. The attached enterprise roadmap remains context; external account/database integration and cloud deletion have not been configured or represented as operational.

- **Implemented and tested:** shared v2 responsive/form CSS, polished Settings and form components, original SVG decorations, intrinsic layouts, mobile navigation/board stacking, internal table scrolling, actual viewport dimensions/custom widths/rotation, and exact legacy-default style migration that preserves user overrides and node IDs.
- **Implemented and tested:** 91 original SVG symbols across twelve categories; five treatments; colors, stroke, sizing, opacity, flips, rotation, gradients and accessibility; dark/light/multiple-size previews; vector layers/shapes/groups/path source/transforms/alignment/history; strict SVG import; saved project variants; canvas insertion/update; standalone SVG, PNG, HTML, CSS, Angular and React output. Verification is representative; center-alignment and every per-layer attribute are not separately automated.
- **Implemented and tested:** first-launch welcome, six starting actions, twelve action-aware tutorial steps with live highlighting/back/skip/pause/resume/restart, local progress and ten searchable Learning Center topics.
- **Final verification:** 35 unit/integration tests and **45/45 browser cases passed** across Chromium, Firefox and WebKit, comparing reviewed screenshot baselines without updating them in the final run. Coverage includes eleven templates at eight widths, real iframe width/zoom/rotation, icon editing/save/reopen/SVG and PNG, full tutorial completion and persisted progress, phone dialog sizing, and automated contrast/accessibility checks for welcome, Learning Center and factory.
- **Post-run import correction:** imported SVG controls now derive labels and dimensions from the imported vector; changing opacity preserves its paint attributes. The expanded icon workflow passed **3/3 focused cases** across all engines, including a labeled 48px imported icon and a decoded 144×144 PNG. All 35 unit tests, lint, strict typecheck and production build passed again afterward. The final build has approximately **151 KB compressed initial application** with Monaco/formatters loaded separately.
- **Independent exports:** HTML, Angular and Next.js built and rendered successfully with local assets, forms, two routes, repeated interactions, duplicated inline gradient vectors and two standalone icon component instances. Browser checks confirmed correct SVG namespaces, local gradient references, unique IDs and no page overflow at 375px.

Browser testing also fixed a queued dialog-close race and a backdrop expression that unintentionally prevented native checkbox default actions. A development reload interrupted one earlier Firefox authoring case; the complete unchanged-source final run passed it. The new factory's low-contrast caption was corrected and all new-dialog audits passed. No deployment or cloud service was enabled.

Review screenshots are available in `docs/screenshots/`. Design, icon, responsive and tutorial details are documented in DESIGN_SYSTEM.md, ICON_FACTORY.md, RESPONSIVE_ENGINE.md and TUTORIALS.md.

## Starting point and milestones

Read PROJECT_SPEC.md and the attached build request in full. The repository contained only the specification, with no application or Git metadata. CodeShip follows the authoritative product name. All phases below integrate into one application.

1. **Foundation:** Angular 21/strict TypeScript/Signals, modular packages, universal model, immutable operations/history, schema validation/migration, swappable IndexedDB repository, lint/build/test tooling.
2. **Visual builder:** real DOM canvas, parent-owned input surface, insertion/nesting/drag/reparent/reorder, selection/multi-selection, inline text, resize/grid/parent-edge guidance, zoom/fit/pan/background, layers, history/keyboard/context menu.
3. **HTML/CSS:** semantic/custom tags, safe attributes/ARIA, diagnostics, registry-driven properties, interactive states/queries, real lazy Monaco, explicit source application, stable identity and AST preservation, efficient copied styles.
4. **Responsive studio:** seven real measured widths; constraint/overflow/layout recommendations, confidence and alternatives, CSS review, preview/apply/reject, manual overrides/re-analysis, safe existing-code import and simultaneous device previews.
5. **Motion:** transitions, visible easing curve/control points, keyframes, draggable timeline, transform/opacity, duration/delay/iterations/direction/fill, replay and reduced-motion CSS.
6. **Libraries/projects:** 26 primitives, five components, 11 editable screens, assets, reusable snapshots; create/rename/open/save/autosave/duplicate/delete/import/JSON export/recent restore.
7. **Exports:** formatted HTML/CSS/JS, standalone routed Angular, and Next.js App Router ZIPs with target-specific assets, attributes, escaping, configuration and interaction cleanup. Exported projects run independently.
8. **Hardening:** security boundaries/import limits, contrast/accessibility, cross-browser workflows, screenshots, independent builds and rendered export behavior, architecture/testing documentation and CI configuration. Exhaustive enterprise hardening remains in progress.

## Verification evidence — initial implementation

- **30 unit/integration tests passed**, including operations/history/schema migration/security, advanced CSS/source/animation preservation, responsive rules, persistence/templates/export ZIPs and a 1,500-element operation budget.
- Strict typecheck, ESLint and the production Angular build passed. Initial build: approximately **133 KB compressed initial application**; Monaco and formatting plugins load separately. The UI upgrade's final build is recorded above.
- Six principal browser workflows passed separately in Chromium, Firefox and WebKit, including authoring, responsive application/save/reload/downloads, actual Monaco source changes, animation CSS, device comparison, drag/history, mobile usability, baseline axe including contrast, and visual comparison without baseline updates.
- Final expanded run: **24/24 cases passed** (eight workflows × Chromium, Firefox and WebKit), adding portable project lifecycle and inline/reusable/pointer-resize authoring. This run compared existing screenshot baselines without updating them.
- A final HTML-inline-style preservation correction replaced browser CSSOM extraction with PostCSS, retaining unknown declarations, quoted semicolons and !important. Its unit test passed and **3/3 focused import/source/animation browser cases passed** across all engines after the change; lint, typecheck, unit tests and production build also passed again.
- Independent Angular and Next.js npm installation and production builds passed with two pages, forms, escaped text, a reusable definition, a custom tag and local assets. Independently served **HTML, Angular and Next.js** all passed visible layout, decoded local image, repeatable toggle, second-page and no-uncaught-error checks.
- Windows screenshot baselines were visually inspected. Remote GitHub Actions execution, a full manual WCAG audit, penetration testing and deployment have not been claimed.

## Decisions and substantive fixes

- A custom canvas keeps the framework-independent model and exporters under architectural control. Angular 21 supports the installed Node 20.19.1; Angular 22 requires a newer runtime. [Official compatibility reference](https://angular.dev/reference/versions).
- CSS remains authoritative preserved source, with isolated AST edits. Imported unsupported safe syntax is retained and unsafe content fails explicitly.
- WebKit exposed stale srcdoc on restore and blocked callbacks within a script-disabled frame. Canvas nodes are now keyed by snapshot; pointer/drag/keyboard/inline editing live in a parent surface. The sandbox stays script-disabled.
- Restore is indicated as saving until IndexedDB completes. A stale autosave cannot replace the current recent-project pointer. Deleting an active project no longer resurrects it through a pending save.
- CSS property reads exclude nested state declarations. Copied blocks merge only required styles, avoiding exponential stylesheet duplication or stale global overwrites.
- The final authoring case found that insertion while a text element was selected could choose an invalid parent. Insertion now chooses a compatible container/ancestor and only selects successfully inserted nodes.
- Dependency auditing prompted a Monaco 0.57 update and DOMPurify 3.4.17 dependency override. `pnpm audit --prod` reports **No known vulnerabilities found**. The scope caveat for upstream vendored code is recorded in LIMITATIONS.md.

## Exact continuation and remaining scope

This is a functional integrated beta, not a verified exhaustive enterprise implementation. FEATURE_MATRIX.md maps requirements and evidence; LIMITATIONS.md details the boundaries.

1. Add override-aware linked definition propagation with atomic undo and export fixtures.
2. Refine responsive failure boundaries adaptively and show captured computed-value diffs for inherited rules.
3. Expand target fixtures for uncommon SVG/form/custom attributes, preserve canvas view state through structural edits, and perform sustained large-project and manual assistive-technology validation.

## Handoff

The development server is running at http://127.0.0.1:4200. An app browser panel was requested (the desktop tool returned queued). Source is under apps/studio and packages; the production artifact is dist/studio/browser. Verified independent samples remain under .generated/html, .generated/angular and .generated/nextjs. Run instructions and repeatable checks are in README.md. No deployment, Git commit, pull request, or remote CI run was performed.

No backend behavior, layout analysis, or downloadable export has been fabricated. Remaining boundaries are explicit.

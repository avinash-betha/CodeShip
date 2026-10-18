# CodeShip

An offline desktop visual development studio built with Angular and Electron. Design editable screens, author CSS, create original icons, measure responsive layouts, and export independent HTML, Angular and Next.js source.

## Run

Requires Node **22.12+** and Corepack for desktop development. Windows x64 is the packaged target.

```sh
corepack pnpm install
node node_modules/electron/install.js
corepack pnpm desktop:build
corepack pnpm desktop:start
```

Native projects live in `Documents/CodeShip Projects/` by default, with readable `project.codeship.json`, `assets/` and retained `backups/`. Choose another default folder in Application settings or open an existing project through the native picker. Files do not expire. Deletion requires confirmation and uses the Recycle Bin. No account or backend is required.

To build the Windows installer:

```sh
corepack pnpm desktop:package
```

Outputs are placed in `release/`. The beta installer is unsigned. See [desktop architecture](docs/DESKTOP_ARCHITECTURE.md), [storage](docs/LOCAL_PROJECT_STORAGE.md) and [release checks](docs/RELEASE_CHECKLIST.md).

## Download Windows and Mac builds from GitHub

After a push to `main`, a `v*` tag, or a manual run, **Actions > CodeShip desktop builds** packages Windows x64, Apple Silicon Mac and Intel Mac in separate native runners. Open the completed workflow run and download its **Artifacts**:

- `CodeShip-windows-x64`: the Windows installer and portable EXE.
- `CodeShip-macos-arm64`: DMG and ZIP for Apple Silicon Macs.
- `CodeShip-macos-x64`: DMG and ZIP for Intel Macs.

Extract the downloaded artifact ZIP to find the application packages inside. Artifacts are retained for 14 days; rerun the workflow when fresh downloads are needed. The workflow uploads build downloads without creating a GitHub Release. Windows packages are unsigned; Mac packages use ad-hoc signing and are not notarized for public distribution. Initial Mac runtime validation must be completed on a Mac.

For a local Mac build, install dependencies fresh on macOS and run `pnpm desktop:mac`. The macOS configuration uses the same app identity and production files as Windows. Instructions and troubleshooting: [GitHub build guide](docs/GITHUB_BUILDS.md).

Use `corepack pnpm dev:desktop` for a development build with native storage and DevTools. Use `corepack pnpm desktop:portable` for the optional portable EXE. Full instructions: [Windows build guide](docs/DESKTOP_BUILD_GUIDE.md).

For browser development:

```sh
corepack pnpm start
```

Open [CodeShip](http://127.0.0.1:4200). The browser adapter keeps its existing IndexedDB projects; use portable JSON to move them into the desktop app.

## Workflows

- Click or drag library elements into the canvas. Use Layers to inspect, reorder, or reparent. Shift-click selects multiple elements. Double-click leaf text to edit it.
- First launch offers a welcome screen and a live guided tour. Reopen, resume or restart the tour from the book icon's searchable Learning Center.
- Twenty-two action-aware tutorial steps and a bundled Documentation Center provide offline guidance, searchable articles, examples, integration guides and contextual editor actions.
- Browse 40 complete screens and a categorized component collection with 25 navigation layouts. Tables filter, sort and paginate; local chat, tags, dialogs, tabs and kanban demonstrate working behaviors.
- Use eight resize handles, aspect locking, grid snapping, nudging, freeform/flex/grid/flow layouts and on-canvas padding/margin/gap controls. Apply editable style presets or configure a glass surface in Design properties.
- Icon Factory contains an original SVG icon collection, five treatments, customization, vector editing, saved project variants, and SVG/PNG/HTML/CSS/Angular/React downloads. Insert icons as editable vectors or select one and choose Edit in Icon Factory.
- The templates adapt from 320px through desktop. Device controls change the actual viewport; zoom changes display scale. Rotate to check landscape layouts. Settings and form templates include consistent labels, fields, helper text and native validation styles.
- Design exposes a property registry, interactive states, responsive contexts, and arbitrary declarations. HTML exposes tags, classes, attributes, accessibility metadata, and permitted interactions.
- Open CSS in the bottom workspace for full Monaco editing. Apply source changes explicitly; invalid or unsafe input produces an error and preserves your draft. Source HTML keeps the identities and interactions of existing tracked elements.
- Analyze responsiveness to measure the real browser layout at seven widths. Review explanations, confidence, current declarations, alternatives, and proposed CSS. Preview, apply, or reject each suggestion. Analyze again after applying changes to find unresolved issues.
- Use Motion to author transitions, editable keyframes, duration, delay, easing, iteration, direction, and reduced-motion behavior. Drag timeline markers or edit their values. The easing curve has numeric control points and a visible preview.
- Use the comparison button beside the device controls to render Desktop, Tablet, and Mobile simultaneously. Preview mode enables permitted interactions in an isolated frame.
- Export selected elements, a screen, chosen screens or the entire project. Generate snippets, reusable components or complete projects; review dependencies and warnings, copy files, download ZIP or write a native folder. Angular uses standalone components. Next.js reusable components use CSS Modules and add a client boundary only when needed.

Canvas focus, live full-screen preview, expanded source editing and documentation reading modes restore the existing workspace. The header supports native full screen (F11) and a visible Docs action. Customer documentation bundles 37 searchable guides, local illustrations, bookmarks, deep links and framework/build integration instructions.

## Checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm exec playwright install chromium firefox webkit
corepack pnpm test:e2e
corepack pnpm test:exports
corepack pnpm desktop:build
corepack pnpm test:desktop
```

Export verification generates projects under `.generated/`, installs their own dependencies, runs real production builds, then opens every target in a browser to verify rendering, packaged assets, interactions, and a second page. Generated folders are disposable and ignored. Visual baselines currently target Windows; review new baselines when changing operating systems or browser revisions.

The project has no backend, paid AI service, or mandatory account. Exported form/authentication screens are editable interfaces; connect your own application services for authentication, submission, and data operations. Arbitrary imported JavaScript is deliberately excluded. See [feature coverage](docs/FEATURE_MATRIX.md), [progress](docs/DEVELOPMENT_PROGRESS.md), and [limitations](docs/LIMITATIONS.md) for the verified scope. This release is a tested beta, not a claim of complete enterprise production readiness.

Final deliverables and boundaries: [handoff](docs/FINAL_HANDOFF.md). Run `corepack pnpm source:package` to create a source ZIP, and `corepack pnpm test:portable` after building the portable EXE.

Internal engineering reference: open [the standalone developer guide](docs/internal/developer-guide.html). Regenerate it with `pnpm docs:build`; it is excluded from the production application. Run `pnpm docs:verify-production` after a renderer build to check that separation.

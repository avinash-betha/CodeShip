# CodeShip handoff

The final follow-up applies the supplied neon identity across desktop/browser branding, keeps one header Docs action, and lets existing SVGs move into buttons/links by drag/drop or inspector placement. Before, after, above, below and icon-only retain the same SVG, button label and behavior; Undo restores the previous structure. APP_BRANDING.md records the approved master, built-in imagegen prompt and size export script. The customer Icon Factory guide includes this workflow.

Final checks passed 63 unit tests, lint/typecheck, production builds, focused Chromium/Firefox/WebKit placement and icon regressions, four customer-documentation regressions, packaged content exclusion, native installer lifecycle checks and portable native save. Source, installer and portable artifacts were refreshed together; current hashes are in release/release-manifest.json.

The customer app contains 37 documentation guides. Eight internal engineering guides are kept separately in docs/internal/developer-guide.html, a self-contained offline HTML reference with search, copy, themes and printing. Internal sources live outside the app source, and the production bundle excludes their content. App-authored long dashes have been replaced with ordinary punctuation or words while existing saved project data is retained.

The complete editable source is the existing repository. `pnpm source:package` creates `release/CodeShip-source-0.2.0.zip` with source, lockfile, configurations, documentation, local documentation assets and browser baselines. It excludes dependencies, build outputs, temporary projects, test traces and environment files.

The renderer retains the visual canvas, original SVG factory, local component interactions, 134 component factories, 40 screens, responsive analysis, animation authoring, CSS/HTML source editing and three independent export targets. Export configuration now has responsive fields, scoped statistics, accessible framework buttons, a file browser with highlighted source and contextual actions. Component naming appears for component output. Individual CSS declarations and style sections can be reset; Undo keeps a selection when that node still exists.

Five workspace experiences are available: native application full screen (F11), canvas focus, live full-screen preview with real device/custom dimensions, maximized Monaco and expanded documentation reading. Source editors remain mounted when resized. The documentation contains 37 offline guides with local search, bookmarks, section links, code copy, diagrams and screenshots. The guided tour contains 22 action-aware steps with skip, next, back, pause, resume and restart.

Use Node 22.12+ and pnpm 10.11.0:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev:desktop
```

For a production build and installer:

```powershell
corepack pnpm desktop:package
corepack pnpm test:desktop
corepack pnpm test:installer
corepack pnpm desktop:portable
corepack pnpm source:package
```

The assisted installer is `release/CodeShip-0.2.0-x64.exe`; the optional portable executable is `release/CodeShip-0.2.0-x64-portable.exe`. Both are development/beta artifacts until a signing and distribution process is supplied. Portable packaging does not make the settings profile USB-contained. Neither artifact requires Node, a development server, an account, a backend or a network connection to run.

Exact verification outcomes and artifact hashes are recorded in DEVELOPMENT_PROGRESS.md and release/release-manifest.json. The Windows build guide and standalone HTML reference are generated from internal sources and excluded from the app. Clean-VM and existing-install upgrade coverage, signing and broader independent accessibility/security review remain release gates; automated checks are not a claim of exhaustive enterprise production certification.

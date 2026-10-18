import {
  type DocArticle,
  section as s,
} from "../../apps/studio/src/docs-model";

export const buildWindowsArticle: DocArticle = {
  id: "build-windows",
  title: "Building CodeShip for Windows: From Source Code to EXE Installer",
  category: "Internal developer guides",
  group: "Desktop development",
  action: "code",
  intro:
    "Build the actual Angular renderer, secure Electron host and Windows installer in this repository. Commands below run from the CodeShip repository root in PowerShell.",
  related: [
    "development-setup",
    "run-locally",
    "install-desktop",
    "build-troubleshooting",
    "release-checklist",
  ],
  sections: [
    s(
      "requirements",
      "Requirements and toolchain",
      [
        "Target Windows 10/11 x64. This repository produces x64 builds; Windows ARM64 and other operating systems have not been validated. Use a maintained Windows version for distribution.",
        "Use Node.js 22.12.0 or a compatible later Node 22 release, pnpm 10.11.0 and the checked-in pnpm-lock.yaml. The pinned desktop dependencies are Electron 44.9.0, electron-builder 26.15.3 and esbuild 0.28.1. Node is a developer prerequisite; installed users do not need it.",
        "Use native Windows PowerShell or a PowerShell terminal in your editor. Git is optional when opening a supplied source archive. No Visual Studio C++ workload is required by the current JavaScript-only dependencies. Reserve several GB for dependencies, framework export fixtures, Electron downloads and release artifacts; the exact total varies by cache.",
        "Dependency installation and initial packaging download tools from the network. The built application and its documentation work offline.",
      ],
      {
        code: {
          language: "powershell",
          text: "Set-Location C:\\Projects\\CodeShip\nnode --version\ncorepack --version\ncorepack pnpm --version\nGet-Content package.json\nGet-Content electron-builder.yml",
          caption:
            "Verify Node 22.12+ and pnpm 10.11.0 before installing. Install Node from the official Node.js distribution if the commands are missing. Corepack uses packageManager in package.json.",
        },
      },
    ),
    s(
      "source",
      "Open the source and install dependencies",
      [
        "Open the source checkout or extract the source archive into a writable folder such as C:\\Projects\\CodeShip. This workspace has no configured public Git remote, so no clone URL is assumed. If your team supplies one, clone that URL first.",
        "package.json defines scripts, angular.json builds apps/studio, apps/desktop holds the Electron host and preload, packages contains shared engines, and scripts/build-desktop.ts bundles the main process. No .env file, account or remote database is required.",
      ],
      {
        code: {
          language: "powershell",
          text: "Set-Location C:\\Projects\\CodeShip\ncorepack pnpm install --frozen-lockfile\ncorepack pnpm exec electron --version\ncorepack pnpm exec electron-builder --version",
          caption:
            "Install the locked dependency tree. If the Electron binary is missing after a restricted install, run node node_modules/electron/install.js, then repeat the version check.",
        },
      },
    ),
    s(
      "development",
      "Run Angular and the desktop application",
      [
        "pnpm start runs Angular CLI on http://127.0.0.1:4200 with development source maps and live rebuilds. Read build errors in the terminal and renderer errors in browser developer tools. Ctrl+C stops the server.",
        "pnpm dev:desktop builds Angular in development configuration, bundles main/preload and launches Electron against the local codeship://app protocol. DevTools open automatically. This command intentionally uses a local build rather than exposing native IPC to an HTTP dev server. After changing sources, stop it and run it again; there is no Electron hot reload. Closing the window or pressing Ctrl+C ends the launcher and its own child process.",
      ],
      {
        code: {
          language: "powershell",
          text: "corepack pnpm start\n# Stop with Ctrl+C before choosing the desktop workflow.\ncorepack pnpm dev:desktop",
          caption:
            "Choose browser development for live renderer updates or desktop development to exercise native file storage, menus and full-screen APIs.",
        },
      },
    ),
    s(
      "production",
      "Build the production application",
      [
        "desktop:build first runs ng build, then bundles main.ts and preload.ts into dist/desktop/main.cjs and preload.cjs. Angular emits dist/studio/browser. The host loads codeship://app/index.html; an installed app never needs the development server.",
        "Angular bundles the original SVG icon code, component factories, themes and structured documentation. Public documentation images and the local Monaco vs tree are copied as assets. Typography uses local system fonts. Production renderer source maps are disabled; Electron bundle maps are for local diagnostics and excluded from packaging.",
        "Script/style optimization is enabled and font inlining disabled. Critical CSS inlining is disabled deliberately: strict CSP blocks Angular's inline onload stylesheet switch. Preserve this configuration to keep packaged styles working without weakening script security.",
      ],
      {
        code: {
          language: "powershell",
          text: "corepack pnpm check\ncorepack pnpm desktop:build\ncorepack pnpm test:desktop\ncorepack pnpm desktop:start",
          caption:
            "check runs lint, strict type checking, unit tests and Angular production compilation. test:desktop uses isolated projects and checks the built Electron host.",
        },
      },
    ),
    s(
      "installer",
      "Generate the Windows EXE installer",
      [
        "electron-builder.yml declares studio.codeship.desktop, product CodeShip, ASAR packaging, the local main entry, the original application icon, and an NSIS x64 target. Only desktop bundles, renderer assets and the minimal package manifest are included. Dependency trees, source maps, tests and source files are excluded.",
        "The assisted, per-user installer allows an installation directory and shortcut choices. Its artifact is release/CodeShip-0.2.0-x64.exe. Unpacked output is release/win-unpacked/CodeShip.exe. Keep the version in root package.json and the bundled manifest synchronized when releasing.",
      ],
      {
        code: {
          language: "powershell",
          text: "corepack pnpm desktop:package\nGet-Item release\\CodeShip-0.2.0-x64.exe\nGet-FileHash release\\CodeShip-0.2.0-x64.exe -Algorithm SHA256\n$env:CODESHIP_PACKAGED_EXE = (Resolve-Path release\\win-unpacked\\CodeShip.exe).Path\ncorepack pnpm test:desktop\nRemove-Item Env:CODESHIP_PACKAGED_EXE",
          caption:
            "Packaging rebuilds the application before creating the installer. Record the actual artifact size, hash and test results for each release; do not reuse a previous build's hash.",
        },
      },
    ),
    s(
      "portable",
      "Optional portable build",
      [
        "The portable target creates release/CodeShip-0.2.0-x64-portable.exe without an installer. It uses the same packaged renderer and secure host. Portable refers to installation only: settings still use the Windows user-data location, and projects use the chosen permanent folder. It is not a USB-contained profile.",
      ],
      {
        code: {
          language: "powershell",
          text: "corepack pnpm desktop:portable\nGet-Item release\\CodeShip-0.2.0-x64-portable.exe",
          caption:
            "Use the explicit portable script. Run pnpm test:portable to verify extraction, launch and native initial save. Use test:desktop against unpacked or installed output for the broader native suite.",
        },
      },
    ),
    s(
      "installation",
      "Install, launch and uninstall",
      [
        "Run the generated installer interactively, choose a writable destination and select shortcuts. The default per-user installation needs no administrative permission; protected destinations can require elevation. CodeShip starts independently of Node or a browser server.",
        "Settings and recent project locations live under Electron's Windows userData directory, normally %APPDATA%/CodeShip. Projects default to Documents/CodeShip Projects; choose another directory in Application settings. Save as makes an independent copy in a new empty directory.",
        "Uninstall through Windows Installed apps or the generated uninstaller. deleteAppDataOnUninstall is false and project directories are outside the application bundle. Installing an updated EXE is a manual update; there is no background updater. Back up projects before testing an upgrade.",
      ],
      {
        callout: {
          kind: "info",
          title: "Project retention",
          text: "The installer test creates its own project marker and verifies that uninstall retains it. It refuses to run if CodeShip is already installed or running, so it cannot replace a user's installation.",
        },
      },
    ),
    s(
      "verification",
      "Verify the packaged and installed application",
      [
        "Run the browser regression suite against the renderer, then the native smoke against unpacked and installed EXEs. The native smoke verifies strict isolation, loaded styles, offline documentation, saving/reopening, recovery, export confinement, local Monaco, themes and save-failure protection. Full-screen tests must also assert native BrowserWindow state, not just a CSS class.",
        "test:installer performs an actual silent install into a new workspace fixture, runs the installed application smoke, uninstalls, and checks project retention and registration cleanup. Close any CodeShip windows first. Read scripts/verify-installer.ps1 before running on a release machine.",
        "A successful automated run on this account does not establish clean-VM or existing-install upgrade coverage. Record those manual results separately in docs/RELEASE_CHECKLIST.md.",
      ],
      {
        code: {
          language: "powershell",
          text: "corepack pnpm test:e2e\ncorepack pnpm test:exports\ncorepack pnpm test:installer",
          caption:
            "Run test:installer after desktop:package. Do not run two browser test runners with the same output directory concurrently or run installer tests beside another CodeShip session.",
        },
      },
    ),
    s(
      "signing",
      "Signing and distribution",
      [
        "Development installers are unsigned because this repository has no signing certificate. Windows may show an unknown publisher or SmartScreen warning. A signature identifies the publisher and protects integrity; it does not guarantee instant SmartScreen reputation.",
        "For public releases obtain an appropriate Authenticode certificate or a supported managed signing service. The current config sets win.signExecutable: false for unsigned development builds. A signing pipeline must override that to true, supply the provider credentials securely, and verify both executable and installer signatures.",
        "For electron-builder 26, use WIN_CSC_LINK (or CSC_LINK) and WIN_CSC_KEY_PASSWORD (or CSC_KEY_PASSWORD) as secret environment variables for supported certificate workflows. Hardware-backed and managed services need their provider's signing integration. Never commit a certificate, password or private key.",
      ],
      {
        code: {
          language: "powershell",
          text: "# In a trusted release environment with signing credentials already supplied:\ncorepack pnpm exec electron-builder --config electron-builder.yml --win nsis --x64 --config.win.signExecutable=true\nGet-AuthenticodeSignature release\\CodeShip-0.2.0-x64.exe\nGet-AuthenticodeSignature release\\win-unpacked\\CodeShip.exe",
          caption:
            "This command requires a fresh desktop:build and valid signing credentials. Signing is a release gate, not a capability claimed for the unsigned development artifact.",
        },
      },
    ),
  ],
};

export const desktopArticles: DocArticle[] = [
  buildWindowsArticle,
  {
    id: "development-setup",
    title: "Development setup",
    category: "Internal developer guides",
    group: "Desktop development",
    intro:
      "Prepare a reproducible environment for the existing CodeShip workspace.",
    action: "code",
    related: [
      "architecture",
      "run-locally",
      "testing",
      "build-troubleshooting",
    ],
    sections: [
      s("prepare", "Open a writable source workspace", [], {
        steps: [
          "Extract the supplied source ZIP or open your team's checkout in a local writable directory. Work from the root containing package.json, pnpm-lock.yaml and angular.json.",
          "Use a PowerShell terminal with Node 22.12+ available on PATH. Check Corepack and its pinned pnpm version before installing the lockfile.",
          "Install dependencies using --frozen-lockfile. The initial dependency/Electron/browser downloads need internet; the installed editor does not.",
          "Run typecheck and unit tests to establish a baseline, then choose the browser or native workflow in Run CodeShip locally.",
        ],
      }),
      s(
        "toolchain",
        "Use the repository toolchain",
        [
          "Install Node 22.12+ and use pnpm 10.11.0 through Corepack. Keep pnpm-lock.yaml unchanged for a release build. Current dependencies require no C++ native addon compilation.",
        ],
        {
          code: {
            language: "powershell",
            text: "node --version\ncorepack pnpm --version\ncorepack pnpm install --frozen-lockfile\ncorepack pnpm typecheck\ncorepack pnpm test",
            caption:
              "Run from the directory containing package.json. A supported Node runtime avoids engine mismatch warnings.",
          },
        },
      ),
      s(
        "workspace",
        "Find the relevant source",
        [
          "apps/studio owns Angular components. apps/desktop owns the trusted host, protocol and preload. packages contains the document, CSS, canvas, export, icon and persistence engines. tests/e2e exercises real browser engines. No runtime credentials are needed.",
        ],
        {
          links: [
            { id: "run-locally", label: "Run CodeShip locally" },
            { id: "build-windows", label: "Build Windows EXE" },
          ],
        },
      ),
      s("baseline", "Confirm the development environment", [
        "A working baseline reports no TypeScript errors and passing Vitest results. pnpm build emits dist/studio/browser; pnpm desktop:build also emits dist/desktop/main.cjs and preload.cjs. Source maps/Monaco assets are configured locally; no .env file, remote database or credentials are required for startup.",
        "If Electron's binary was not downloaded, run node node_modules/electron/install.js and retry its version check. If browser binaries are absent, use pnpm exec playwright install before browser tests. Diagnose the first reported toolchain error rather than changing the lockfile or disabling validation.",
      ]),
    ],
  },
  {
    id: "run-locally",
    title: "Run CodeShip locally",
    category: "Internal developer guides",
    group: "Desktop development",
    intro:
      "Choose live browser iteration or the native desktop workflow according to the feature you are changing.",
    action: "code",
    related: [
      "development-setup",
      "architecture",
      "testing",
      "build-troubleshooting",
    ],
    sections: [
      s("choose", "Choose the boundary you need to debug", [
        "Complete Development setup first. Use browser development for live Angular renderer changes, desktop development for menus/window state/preload/filesystem behavior, and a production local build for CSP and bundled asset verification. Browser IndexedDB data and native project folders are separate; opening one environment does not transfer projects from the other.",
      ]),
      s(
        "browser",
        "Angular development server",
        [
          "pnpm start serves 127.0.0.1:4200 and rebuilds the renderer. Browser projects use IndexedDB, while the Electron application uses permanent project folders. Keep that distinction in mind when testing saving.",
        ],
        {
          code: {
            language: "powershell",
            text: "corepack pnpm start",
            caption:
              "Use Ctrl+C to stop. If the port is occupied, inspect the owning process before stopping anything. Restart Angular after editing angular.json.",
          },
        },
      ),
      s(
        "desktop",
        "Native desktop debugging",
        [
          "pnpm dev:desktop builds the local renderer and host, opens DevTools, and keeps native IPC restricted to codeship://app. Re-run after source changes. The launcher forwards errors and owns only its spawned Electron process.",
        ],
        {
          code: {
            language: "powershell",
            text: "corepack pnpm dev:desktop",
            caption:
              "Close the application or press Ctrl+C to stop. Production desktop:start loads an already built renderer without opening DevTools.",
          },
        },
      ),
      s("production", "Check the production local host", [], {
        code: {
          language: "powershell",
          text: "corepack pnpm desktop:build\ncorepack pnpm desktop:start",
          caption:
            "Build before starting. The main process loads the renderer from codeship://app rather than the HTTP development server.",
        },
      }),
      s("debug", "Inspect failures and stop your session", [
        "Use the terminal for Angular/esbuild diagnostics and desktop DevTools for renderer/CSP/protocol requests. The development desktop command rebuilds once and opens DevTools; stop it and rerun after source changes because native hot reload is not included. The launcher closes its own spawned process tree on Ctrl+C.",
        "If startup is blank, check dist paths, stylesheet requests and local Monaco assets. If the browser port is busy, identify its owner before choosing another session; do not kill unrelated processes. Save any manual design experiments or use an isolated profile/fixture for native verification.",
      ]),
    ],
  },
  {
    id: "build-troubleshooting",
    title: "Build troubleshooting",
    category: "Internal developer guides",
    group: "Desktop development",
    intro:
      "Diagnose the first failing layer before retrying a complete package build.",
    action: "code",
    sections: [
      s(
        "tools",
        "Node, package manager and dependencies",
        [
          "Command not found: install Node and reopen the terminal. Unsupported engine: verify Node >=22.12. Package manager mismatch: use corepack pnpm, which reads the pinned version. Missing modules: install with --frozen-lockfile. Missing Electron executable: run its install.js script.",
        ],
        {
          code: {
            language: "powershell",
            text: "Get-Command node\nnode --version\ncorepack pnpm --version\ncorepack pnpm install --frozen-lockfile\nnode node_modules/electron/install.js",
            caption:
              "Do not delete user projects or globally replace package managers to repair a local build.",
          },
        },
      ),
      s(
        "compiler",
        "TypeScript or Angular failures",
        [
          "Run typecheck to isolate TypeScript errors; ng build also checks Angular templates. Correct the first file/line error before packaging. If styles are missing only in an old dev session, restart ng serve after configuration changes.",
        ],
        {
          code: {
            language: "powershell",
            text: "corepack pnpm typecheck\ncorepack pnpm build\nGet-Content angular.json",
            caption:
              "Production scripts should exit nonzero on compilation failure. Packaging stale dist output can hide a broken renderer.",
          },
        },
      ),
      s(
        "blank",
        "Blank window, missing assets or Monaco",
        [
          "Confirm dist/desktop/main.cjs, preload.cjs and dist/studio/browser/index.html exist. Use dev:desktop DevTools to inspect CSP errors and codeship://app resource requests. Keep critical CSS inlining disabled. Monaco must load local /monaco/vs/loader.js; check the asset glob in angular.json.",
        ],
        {
          code: {
            language: "powershell",
            text: "Get-Item dist\\desktop\\main.cjs, dist\\desktop\\preload.cjs\nGet-Item dist\\studio\\browser\\index.html\nGet-Item dist\\studio\\browser\\monaco\\vs\\loader.js\ncorepack pnpm dev:desktop",
            caption:
              "Do not enable nodeIntegration or weaken CSP to fix an asset path. Inspect the protocol MIME map and bundled files instead.",
          },
        },
      ),
      s(
        "packaging",
        "Packaging, branding and permissions",
        [
          "A missing icon must be fixed at apps/desktop/icon.png. The Windows packager converts this original high-resolution asset into executable/installer icon resources. Inspect electron-builder.yml paths and ensure the output EXE is not still running or locked. Build in a writable source folder.",
        ],
        {
          code: {
            language: "powershell",
            text: "Get-Item apps\\desktop\\icon.png\nGet-Process CodeShip -ErrorAction SilentlyContinue\ncorepack pnpm desktop:unpacked\nGet-Item release\\win-unpacked\\CodeShip.exe",
            caption:
              "Close only your own test session before repackaging. Permission failures in project saving require repairing the selected project folder, not reinstalling CodeShip.",
          },
        },
      ),
      s(
        "warnings",
        "Signing warnings and filesystem errors",
        [
          "An unsigned installer shows an unknown publisher. Distribute signed releases through a trusted channel; do not claim development builds are signed. If a save fails, leave the application open, correct disk space/permissions and retry; Save as to a new empty writable folder can preserve the current draft.",
        ],
        {
          links: [
            { id: "build-windows", label: "Signing and release build steps" },
            { id: "projects", label: "Saving, backups and recovery" },
          ],
        },
      ),
    ],
  },
  {
    id: "release-checklist",
    title: "Release checklist",
    category: "Internal developer guides",
    group: "Desktop development",
    intro:
      "Treat release readiness as evidence recorded against an exact installer, not a successful compile alone.",
    action: "code",
    related: ["testing", "build-windows", "build-troubleshooting", "projects"],
    sections: [
      s("candidate", "Prepare the exact release candidate", [
        "Start from a reviewed source state with Node 22.12+ and the locked pnpm toolchain. Synchronize version/branding in package.json and the bundled desktop manifest. Update user guides for changed controls and regenerate DESKTOP_BUILD_GUIDE.md with pnpm docs:build. Keep source ZIPs free of dependencies, generated fixtures and credentials using pnpm source:package.",
      ]),
      s("checks", "Automated checks", [], {
        steps: [
          "Run lint, typecheck, unit tests and the production build.",
          "Run browser regressions in Chromium, Firefox and WebKit, plus actual HTML/Angular/Next.js export builds.",
          "Package the installer; run native smoke against unpacked and installed executables.",
          "Record the SHA256 hash, size, version and test results for that exact artifact.",
        ],
      }),
      s(
        "manual",
        "Distribution gates",
        [
          "Verify on a clean Windows VM, test an upgrade over an existing installation, inspect accessibility with keyboard and assistive technology, sign the release and verify signatures. Check that uninstall leaves projects and backups intact. No auto-update mechanism is included.",
        ],
        {
          links: [
            { id: "build-windows", label: "Build and verify the EXE" },
            { id: "build-troubleshooting", label: "Resolve build failures" },
          ],
        },
      ),
      s("artifacts", "Record candidate artifacts", [], {
        code: {
          language: "powershell",
          text: "Get-Item release\\CodeShip-0.2.0-x64.exe\nGet-FileHash release\\CodeShip-0.2.0-x64.exe -Algorithm SHA256\nGet-AuthenticodeSignature release\\CodeShip-0.2.0-x64.exe",
          caption:
            "Use the current version's actual paths. Record hash, size, signature status and test results for that exact candidate in the release evidence.",
        },
      }),
      s("decision", "Decide whether to distribute or repair", [
        "If packaging passes but native startup, save, offline assets or installer retention fails, fix the cause and rebuild/retest the new candidate. Do not attach old test results to a replacement EXE. A content-only source delivery must clearly distinguish its rebuilt renderer/source archive from previously packaged executables.",
        "Public distribution still requires the release's signing, clean-VM/upgrade and manual review gates. If any gate is incomplete, state that boundary explicitly and label the artifact accordingly. Retain prior installer/project backups for a deliberate recovery plan; there is no background auto-update or automatic project rollback service.",
      ]),
    ],
  },
];

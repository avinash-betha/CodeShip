# Building CodeShip for Windows: From Source Code to EXE Installer

Build the actual Angular renderer, secure Electron host and Windows installer in this repository. Commands below run from the CodeShip repository root in PowerShell.

Internal engineering reference. This guide is not bundled in the customer application. Update docs/internal/desktop-content.ts and run pnpm docs:build. Open docs/internal/developer-guide.html for the complete standalone reference.

## Requirements and toolchain

Target Windows 10/11 x64. This repository produces x64 builds; Windows ARM64 and other operating systems have not been validated. Use a maintained Windows version for distribution.

Use Node.js 22.12.0 or a compatible later Node 22 release, pnpm 10.11.0 and the checked-in pnpm-lock.yaml. The pinned desktop dependencies are Electron 44.9.0, electron-builder 26.15.3 and esbuild 0.28.1. Node is a developer prerequisite; installed users do not need it.

Use native Windows PowerShell or a PowerShell terminal in your editor. Git is optional when opening a supplied source archive. No Visual Studio C++ workload is required by the current JavaScript-only dependencies. Reserve several GB for dependencies, framework export fixtures, Electron downloads and release artifacts; the exact total varies by cache.

Dependency installation and initial packaging download tools from the network. The built application and its documentation work offline.

```powershell
Set-Location C:\Projects\CodeShip
node --version
corepack --version
corepack pnpm --version
Get-Content package.json
Get-Content electron-builder.yml
```

Verify Node 22.12+ and pnpm 10.11.0 before installing. Install Node from the official Node.js distribution if the commands are missing. Corepack uses packageManager in package.json.

## Open the source and install dependencies

Open the source checkout or extract the source archive into a writable folder such as C:\Projects\CodeShip. This workspace has no configured public Git remote, so no clone URL is assumed. If your team supplies one, clone that URL first.

package.json defines scripts, angular.json builds apps/studio, apps/desktop holds the Electron host and preload, packages contains shared engines, and scripts/build-desktop.ts bundles the main process. No .env file, account or remote database is required.

```powershell
Set-Location C:\Projects\CodeShip
corepack pnpm install --frozen-lockfile
corepack pnpm exec electron --version
corepack pnpm exec electron-builder --version
```

Install the locked dependency tree. If the Electron binary is missing after a restricted install, run node node_modules/electron/install.js, then repeat the version check.

## Run Angular and the desktop application

pnpm start runs Angular CLI on http://127.0.0.1:4200 with development source maps and live rebuilds. Read build errors in the terminal and renderer errors in browser developer tools. Ctrl+C stops the server.

pnpm dev:desktop builds Angular in development configuration, bundles main/preload and launches Electron against the local codeship://app protocol. DevTools open automatically. This command intentionally uses a local build rather than exposing native IPC to an HTTP dev server. After changing sources, stop it and run it again; there is no Electron hot reload. Closing the window or pressing Ctrl+C ends the launcher and its own child process.

```powershell
corepack pnpm start
# Stop with Ctrl+C before choosing the desktop workflow.
corepack pnpm dev:desktop
```

Choose browser development for live renderer updates or desktop development to exercise native file storage, menus and full-screen APIs.

## Build the production application

desktop:build first runs ng build, then bundles main.ts and preload.ts into dist/desktop/main.cjs and preload.cjs. Angular emits dist/studio/browser. The host loads codeship://app/index.html; an installed app never needs the development server.

Angular bundles the original SVG icon code, component factories, themes and structured documentation. Public documentation images and the local Monaco vs tree are copied as assets. Typography uses local system fonts. Production renderer source maps are disabled; Electron bundle maps are for local diagnostics and excluded from packaging.

Script/style optimization is enabled and font inlining disabled. Critical CSS inlining is disabled deliberately: strict CSP blocks Angular's inline onload stylesheet switch. Preserve this configuration to keep packaged styles working without weakening script security.

```powershell
corepack pnpm check
corepack pnpm desktop:build
corepack pnpm test:desktop
corepack pnpm desktop:start
```

check runs lint, strict type checking, unit tests and Angular production compilation. test:desktop uses isolated projects and checks the built Electron host.

## Generate the Windows EXE installer

electron-builder.yml declares studio.codeship.desktop, product CodeShip, ASAR packaging, the local main entry, the original application icon, and an NSIS x64 target. Only desktop bundles, renderer assets and the minimal package manifest are included. Dependency trees, source maps, tests and source files are excluded.

The assisted, per-user installer allows an installation directory and shortcut choices. Its artifact is release/CodeShip-0.2.0-x64.exe. Unpacked output is release/win-unpacked/CodeShip.exe. Keep the version in root package.json and the bundled manifest synchronized when releasing.

```powershell
corepack pnpm desktop:package
Get-Item release\CodeShip-0.2.0-x64.exe
Get-FileHash release\CodeShip-0.2.0-x64.exe -Algorithm SHA256
$env:CODESHIP_PACKAGED_EXE = (Resolve-Path release\win-unpacked\CodeShip.exe).Path
corepack pnpm test:desktop
Remove-Item Env:CODESHIP_PACKAGED_EXE
```

Packaging rebuilds the application before creating the installer. Record the actual artifact size, hash and test results for each release; do not reuse a previous build's hash.

## Optional portable build

The portable target creates release/CodeShip-0.2.0-x64-portable.exe without an installer. It uses the same packaged renderer and secure host. Portable refers to installation only: settings still use the Windows user-data location, and projects use the chosen permanent folder. It is not a USB-contained profile.

```powershell
corepack pnpm desktop:portable
Get-Item release\CodeShip-0.2.0-x64-portable.exe
```

Use the explicit portable script. Run pnpm test:portable to verify extraction, launch and native initial save. Use test:desktop against unpacked or installed output for the broader native suite.

## Install, launch and uninstall

Run the generated installer interactively, choose a writable destination and select shortcuts. The default per-user installation needs no administrative permission; protected destinations can require elevation. CodeShip starts independently of Node or a browser server.

Settings and recent project locations live under Electron's Windows userData directory, normally %APPDATA%/CodeShip. Projects default to Documents/CodeShip Projects; choose another directory in Application settings. Save as makes an independent copy in a new empty directory.

Uninstall through Windows Installed apps or the generated uninstaller. deleteAppDataOnUninstall is false and project directories are outside the application bundle. Installing an updated EXE is a manual update; there is no background updater. Back up projects before testing an upgrade.

> **Project retention** The installer test creates its own project marker and verifies that uninstall retains it. It refuses to run if CodeShip is already installed or running, so it cannot replace a user's installation.

## Verify the packaged and installed application

Run the browser regression suite against the renderer, then the native smoke against unpacked and installed EXEs. The native smoke verifies strict isolation, loaded styles, offline documentation, saving/reopening, recovery, export confinement, local Monaco, themes and save-failure protection. Full-screen tests must also assert native BrowserWindow state, not just a CSS class.

test:installer performs an actual silent install into a new workspace fixture, runs the installed application smoke, uninstalls, and checks project retention and registration cleanup. Close any CodeShip windows first. Read scripts/verify-installer.ps1 before running on a release machine.

A successful automated run on this account does not establish clean-VM or existing-install upgrade coverage. Record those manual results separately in docs/RELEASE_CHECKLIST.md.

```powershell
corepack pnpm test:e2e
corepack pnpm test:exports
corepack pnpm test:installer
```

Run test:installer after desktop:package. Do not run two browser test runners with the same output directory concurrently or run installer tests beside another CodeShip session.

## Signing and distribution

Development installers are unsigned because this repository has no signing certificate. Windows may show an unknown publisher or SmartScreen warning. A signature identifies the publisher and protects integrity; it does not guarantee instant SmartScreen reputation.

For public releases obtain an appropriate Authenticode certificate or a supported managed signing service. The current config sets win.signExecutable: false for unsigned development builds. A signing pipeline must override that to true, supply the provider credentials securely, and verify both executable and installer signatures.

For electron-builder 26, use WIN_CSC_LINK (or CSC_LINK) and WIN_CSC_KEY_PASSWORD (or CSC_KEY_PASSWORD) as secret environment variables for supported certificate workflows. Hardware-backed and managed services need their provider's signing integration. Never commit a certificate, password or private key.

```powershell
# In a trusted release environment with signing credentials already supplied:
corepack pnpm exec electron-builder --config electron-builder.yml --win nsis --x64 --config.win.signExecutable=true
Get-AuthenticodeSignature release\CodeShip-0.2.0-x64.exe
Get-AuthenticodeSignature release\win-unpacked\CodeShip.exe
```

This command requires a fresh desktop:build and valid signing credentials. Signing is a release gate, not a capability claimed for the unsigned development artifact.

Primary references for release maintainers: [Electron distribution](https://www.electronjs.org/docs/latest/tutorial/distribution-overview), [electron-builder 26 Windows signing](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/). The application's built-in documentation is fully offline.

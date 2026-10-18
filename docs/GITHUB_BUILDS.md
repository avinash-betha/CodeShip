# Build CodeShip with GitHub Actions

Repository: https://github.com/avinash-betha/CodeShip

The `.github/workflows/desktop-builds.yml` workflow runs after a push to `main`, a tag beginning with `v`, or a manual **Run workflow** action. It uses Windows x64, macOS Apple Silicon and macOS Intel runners. You can trigger and download all builds from a Windows computer.

## Download the applications

1. Open the repository's **Actions** tab.
2. Select **CodeShip desktop builds**. To build manually, choose **Run workflow**, select `main`, and confirm the run.
3. Wait for all three package jobs to finish. The existing **CodeShip verification** workflow runs separately and provides broader test coverage.
4. Open the completed desktop build run and scroll to **Artifacts**.
5. Download `CodeShip-windows-x64`, `CodeShip-macos-arm64` or `CodeShip-macos-x64`. Extract GitHub's artifact ZIP to access the EXE, DMG or application ZIP inside it.

| Artifact             | Application packages                                           |
| -------------------- | -------------------------------------------------------------- |
| CodeShip-windows-x64 | `CodeShip-0.2.0-x64.exe`, `CodeShip-0.2.0-x64-portable.exe`    |
| CodeShip-macos-arm64 | `CodeShip-0.2.0-mac-arm64.dmg`, `CodeShip-0.2.0-mac-arm64.zip` |
| CodeShip-macos-x64   | `CodeShip-0.2.0-mac-x64.dmg`, `CodeShip-0.2.0-mac-x64.zip`     |

Downloads are retained for 14 days, subject to repository policy. These are workflow artifacts; the workflow does not publish a GitHub Release. Repository access is required to download artifacts. GitHub-hosted usage and storage follow the repository owner's Actions plan.

## Build scope and signing

Every platform installs the committed lockfile, builds the renderer and Electron host, and checks that internal documentation stays outside the app. The Windows job also runs lint, typecheck, unit tests, packaged-document exclusion, the isolated installer/native smoke/uninstall check and portable native save check. Each Mac architecture is packaged on its matching architecture.

Windows artifacts are unsigned beta packages. Mac artifacts use ad-hoc signing, without an Apple Developer certificate or notarization. A successful packaging job confirms package creation; it does not replace native Mac runtime, permission and upgrade checks. Distribution signing can be configured later using GitHub secrets rather than committing certificates.

The workflow has read-only repository permissions and does not require a personal access token or signing secrets. Checkout credentials are not retained for build scripts. Build outputs, dependencies, environment files and signing certificates are excluded from source control by `.gitignore`.

## Run locally

Use Node.js 22.12+ and pnpm 10.11.0, then run `pnpm install --frozen-lockfile` in a fresh checkout on each machine. Do not transfer `node_modules` between Windows and Mac.

```powershell
# Windows
pnpm desktop:package
pnpm desktop:portable
```

```sh
# macOS, both Apple Silicon and Intel packages
pnpm desktop:mac
```

If a job fails, open that job's red step in Actions and read the error before rerunning it. A queued job is waiting for a hosted runner; a completed artifact appears only after successful packaging and checks for that job.

# Windows beta release checks

The supported packaging target is Windows x64. The installer is unsigned; signing credentials and public distribution have not been configured. Do not describe this beta as a fully audited enterprise release.

Run on Node 22.12+:

```sh
corepack pnpm install --frozen-lockfile
node node_modules/electron/install.js
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm test:exports
corepack pnpm desktop:package
corepack pnpm test:desktop
```

Then set `CODESHIP_PACKAGED_EXE` to the absolute `release/win-unpacked/CodeShip.exe` path and rerun `test:desktop`. That launches the packaged application against temporary project/preferences directories. It checks offline save/reload, isolation, local Monaco, backup, native folder export and traversal rejection. Folder selection is stubbed only inside the smoke process.

Before public release: review a clean VM and upgrades over existing installations; confirm existing user projects survive upgrades/uninstall; review signing and update distribution; perform broader manual keyboard/screen-reader and import/security audits. macOS/Linux installers, automatic updates, simultaneous multi-process document editing and exhaustive visual/interaction coverage remain outside this beta's verified scope.

Exact completed runs and artifacts belong in DEVELOPMENT_PROGRESS.md. A passing unpacked executable is evidence for packaged runtime behavior; it does not by itself prove installer lifecycle behavior.

`corepack pnpm test:installer` passed an isolated per-user installation, styled offline runtime, uninstall, retained-project marker and registry cleanup on this Windows host. The script refuses to overwrite an existing CodeShip installation or shortcut. Evidence: `release/install-verification.json`. This is not a clean-VM or existing-installation upgrade test.

October 18 continuation: 49 units, three-engine browser coverage with focused phone/icon corrections, independent exporter builds, actual development launch, native full-screen/docs checks, fresh NSIS lifecycle and portable launch/save were verified. Artifact hashes are in release/release-manifest.json. The source archive is generated with `pnpm source:package`. These checks do not remove the signing and clean-VM/upgrade gates above.

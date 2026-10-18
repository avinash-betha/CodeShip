# Desktop architecture

The current desktop request supersedes the browser-only roadmap archived under `docs/specs/`. Angular is the renderer; Electron owns native files, dialogs, menus and window lifecycle. No database, authentication service, cloud storage or project-expiry worker is present.

| Boundary         | Source                             | Responsibility                                                                        |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| Main             | `apps/desktop/main.ts`             | Trusted app protocol, native actions, sender validation, menus and window preferences |
| Preload          | `apps/desktop/preload.ts`          | Frozen, explicitly enumerated bridge methods and command subscription                 |
| Contract         | `packages/desktop-bridge/index.ts` | Typed requests; renderer receives project data rather than filesystem access          |
| Storage          | `apps/desktop/storage.ts`          | Validated JSON, atomic replacement, assets, backups and authorized paths              |
| Renderer adapter | `packages/persistence/desktop.ts`  | Existing repository interface using the native bridge                                 |
| Browser adapter  | `packages/persistence/index.ts`    | Preserves browser development projects in IndexedDB                                   |

The window enables context isolation, renderer sandboxing and web security, and disables Node integration and webviews. Native requests accept only the trusted top-level `codeship://app` frame. External windows, permission prompts and external navigation are denied. Protocol paths and their resolved filesystem locations must remain under the packaged renderer root.

Editing frames allow DOM measurement and disable scripts. Preview frames have an opaque origin and run only the fixed nonced interaction runtime. The main CSP omits unsafe eval and permits bundled Monaco and formatters offline. These boundaries follow Electron's [security guidance](https://www.electronjs.org/docs/latest/tutorial/security/) and [context isolation model](https://www.electronjs.org/docs/latest/tutorial/context-isolation).

`scripts/build-desktop.ts` bundles main and preload independently. `electron-builder.yml` packages the production renderer, local Monaco, original app icon and a minimal manifest into ASAR and a Windows NSIS installer. Runtime development dependencies are not required after installation.

`scripts/verify-desktop.ts` launches real Electron with isolated user data and project directories. `CODESHIP_PACKAGED_EXE` selects the packaged binary. Its hidden test window uses native capture for evidence. OS folder selection is stubbed in the test process; production retains native dialogs. macOS/Linux packaging and code signing are not claimed.

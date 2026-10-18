# Permanent project storage

Default: `Documents/CodeShip Projects/<human name> — <identifier>/`. Each project contains `project.codeship.json`, `assets/` and `backups/`. The file is the source of truth; renderer memory and browser storage are not the native persistence boundary.

Saves validate the document tree and CSS before writing. Each project has a serial write queue. A unique exclusive temporary file is written, synced, closed and renamed over the document. Unchanged snapshots are skipped. Settings use a separate serial queue.

Raster data URLs become local asset references on disk and hydrate back into renderer data URLs. Content-derived asset filenames preserve prior bytes for retained backups. Resolved asset paths and directories cannot escape their authorized project root. A file or asset-directory symbolic link cannot redirect a save.

Meaningful edits retain a prior complete document at most once per minute. Explicit Backup creates an additional copy. No backup or project expiry runs. Invalid prior content is preserved rather than silently discarded. Recovery scans newest to oldest for a valid backup, then opens a new project identifier and name; the original document is preserved.

Open authorizes a user-selected `.codeship.json` path. Save as requires a new empty folder and creates a separate identifier. Native deletion confirms its destination and uses the Recycle Bin. A mixed external folder is preserved: only its project document is removed. Projects containing dedicated assets/backups can be removed as an isolated folder after confirmation.

Tests: `tests/unit/desktop-storage.test.ts`, browser lifecycle tests for the shared store, and `scripts/verify-desktop.ts` for real save/reload/backup/export. Power-loss guarantees across every filesystem, network drive locking, and simultaneous editing from separate app processes are outside the verified scope. Keep independent backups of important work.

Switching projects stops when the active snapshot cannot be saved. Save as can write an independent rescue copy and open it without requiring the failing original destination. The real Electron smoke injects an IPC save error and confirms that an unsaved heading remains in memory while the previous disk document is unchanged. Installer testing also refuses to run while any CodeShip process is active.

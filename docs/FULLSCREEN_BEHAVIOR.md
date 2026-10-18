# Workspace and full-screen behavior

Application full screen uses BrowserWindow.setFullScreen through two explicit, main-frame-authorized IPC methods. Native enter/leave events update the renderer; F11 is registered once in the Electron View menu. The renderer uses the browser Fullscreen API only in browser development. Full screen is transient and never forced at startup.

Canvas focus hides the existing chrome through the workspace view state; it does not rewrite persisted panel widths, visibility, code height, project, selection, viewport or zoom. Device controls, selection, pan, snapping, undo and redo remain available. Exit or Esc restores the editor.

The dedicated preview renders canvasDocument in an opaque sandbox with scripts enabled for audited declarative interactions. Desktop dimensions follow available space; Laptop, Tablet, Mobile and custom dimensions use actual iframe CSS widths. Display scaling is separate. Rotation swaps width/height. Escape inside the iframe sends a fixed exit message; the parent verifies its source against that exact iframe. No desktop API is exposed to a preview.

Expanded code editing keeps the existing Monaco instance mounted. Its cursor, draft and undo stack survive size changes. HTML/CSS are editable with explicit Apply/Discard and formatting; JavaScript and exported Angular TypeScript are read-only generated source. Arbitrary executable code is not run. Source exports have a separate resizable file preview with a full-window reading mode.

Documentation has independent expanded state in the modal top layer. Reading width stays bounded; navigation and TOC can be collapsed. Esc restores the expanded documentation/export preview before closing its modal. In the editor, Esc restores a workspace mode before leaving application full screen. Existing canvas Escape behavior runs after these higher-level modes.

Browser regressions cover preservation of canvas and Monaco state, real responsive preview dimensions, iframe Escape and documentation restore/deep links. Native smoke asserts BrowserWindow.isFullScreen, visible exit state, canvas focus, mobile preview and offline documentation. Exact final results are recorded in DEVELOPMENT_PROGRESS.md.

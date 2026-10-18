# Offline documentation architecture

DocumentationComponent owns the reading shell and transient navigation/search/TOC state. Its stylesheet is component-scoped so the article columns do not depend on a separate Angular global stylesheet configuration. The main style entry also imports studio-base.css then enterprise.css, preserving the original cascade while ensuring shared tool styles are available to older running dev configurations.

docs-model.ts defines typed articles, sections, code blocks, local images, callouts and internal links. docs-registry.ts combines the preserved 29 stable article IDs with thirteen installation, workflow, accessibility, advanced and desktop-development guides. docs-guides-content.ts supplies feature-specific sections; docs-desktop-content.ts owns repository-specific build instructions. Content is data, not HTML in Angular templates.

Search uses a bundled full-text index over titles, introductions, steps, code and notes. Query words are matched locally; highlighted output is escaped Angular text. No network, Markdown HTML injection, eval or remote search is involved. Code examples render escaped tokens through DocsCodeComponent with explicit copy status. SourcePreviewComponent reuses tokenization for export file reading.

The navigation tree groups categories and a nested Desktop development section. Category expansion and bookmarks use versioned local preferences; the last article is remembered. Article/heading links use #docs/article/section fragments. Opening a valid fragment at startup opens the real documentation modal. Heading lists are extracted from content; scroll position updates the active TOC entry. Closing clears the transient fragment. Tests validate all article IDs, internal links, headings and local image paths.

All imagery is bundled under apps/studio/public/docs. The workflow diagram is an original local SVG; workspace screenshots show the real editor. Reading mode preserves a maximum text width. Narrow windows use collapsible navigation and a TOC menu. Print styles remove editor chrome and expose the selected article without clipping its scroll container.

Run `pnpm docs:build` after changing desktop build content. It generates docs/DESKTOP_BUILD_GUIDE.md from the same source used by the app, avoiding conflicting command instructions. The rendered document version currently follows the 0.2 application line. Update docsVersion and package/manifests together for later releases.

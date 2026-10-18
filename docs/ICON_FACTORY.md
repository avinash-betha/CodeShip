# Icon Factory

The factory is available from the workspace toolbar and Learning Center. A selected SVG icon also offers **Edit in Icon Factory** in the inspector.

## Original collection

CodeShip contains 91 local, code-authored SVG symbols across navigation, layout, editing, files, people, forms, data, media, devices, development, status and shapes. Search matches names, categories and tags. The same registry drives editor controls, template decorations and canvas icons. No third-party icon collection or remote font is being represented as a proprietary asset library.

Five treatments are available: outline, rounded, sharp, duotone and tinted. Customize primary/accent colors, size, line weight, opacity, rotation, flips, a two-color stroke gradient and an accessible label. The factory previews dark/light backgrounds and 16/24/32/48px sizes.

## Vector studio

The studio supports rectangles, circles, lines, quadratic/Bézier SVG paths and groups. Select a layer using the vector preview or layer list. Edit SVG attributes, coordinates, fills, strokes and transforms. Add shapes inside a selected group; center rectangles/circles on either axis; remove layers; undo and redo. It is a focused icon editor, not a general-purpose Bézier handle manipulation or boolean-path design package.

After manual geometry edits, the icon becomes a custom vector. Whole-icon size, opacity and accessibility controls remain available. Per-layer colors, transforms and geometry are edited in Vector studio. Collection-only controls are disabled to avoid silently replacing custom geometry.

SVG source can be inspected, edited or imported. A strict allowlist rejects scripts, images, links, external references, styles, document entities and unsupported content. Imports are limited to 150KB, 200 vector nodes and 12 nested levels. Gradient IDs are remapped to prevent collisions.

## Persistence and document model

Inserted icons are ordinary SVG `ElementNode` trees, not raster images or runtime widgets. Factory metadata lives in `data-cs-icon` and `data-cs-icon-config`. Saved icons reuse the existing project component definition format, so schema v1 files remain compatible. Save/reopen, portable project JSON, copy/paste and exports preserve geometry. Cloning refreshes gradient identifiers and their paint references.

## Outputs

- Standalone SVG and inline HTML.
- Transparent PNG at 3× the configured output size, rendered in the browser.
- A CSS background-image asset.
- Standalone Angular and React TypeScript components.
- Inline SVG within full HTML, Angular and Next.js project exports.

Standalone framework components generate per-instance gradient IDs. React exposes native SVG props. Exported applications render their own vectors and do not load CodeShip. Unit, browser and independent generated-application checks cover these boundaries; see TESTING.md and DEVELOPMENT_PROGRESS.md for actual results.

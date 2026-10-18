# Export architecture

The desktop upgrade adds codegen-core/selection.ts for selected/current/chosen/all-page scope and component-export.ts for reusable files. Extraction filters dependencies, retains media/keyframe/token/asset references, and reports external interaction targets or uncertain ancestor selectors. Angular emits standalone TS/template/CSS files with host-scoped listeners. Next.js emits TSX/CSS Modules and uses a client boundary only for supported interactions. Full projects retain the independent target adapters. Generated READMEs explain integration.

`codegen-core` supplies escaping, canonical HTML rendering, token/CSS composition, permitted interaction generation, asset localization, formatting, and ZIP/download utilities. It does not translate one framework into another. `exporter-html`, `exporter-angular`, and `exporter-nextjs` consume the model independently.

- **HTML:** index.html, styles.css, optional script.js, other page documents/styles/scripts, assets, and README. Uses a deferred ordinary script so the exported entry opens directly from disk. Local data-image assets become relative files.
- **Angular:** complete Angular 21 configuration, strict TypeScript, standalone page and reusable components, a RouterOutlet shell, and generated routes. Templates escape Angular control-flow/interpolation metacharacters in user text. Interaction listeners abort on component destruction. Local files are copied to public/assets and referenced at /assets.
- **Next.js:** a complete Next 16 / React 19 App Router application, layout, page components, global CSS, additional routes, and reusable component sources. Attribute names, booleans, input defaults, JSX escaping, and custom-element typings are target-specific. Static pages remain server components; configured interactions create client components with effect cleanup. Static output is configured, and local assets go in public/assets.

Prettier standalone plugins format actual files before ZIP packaging. Parse or validation errors stop the export and surface to the user. Assets not present in the project (remote URLs) stay remote; they are never silently fetched or redistributed. Uploaded raster assets can be exported without network access.

`scripts/verify-exports.ts` generates a shared representative fixture with two pages, forms, text requiring escaping, a reusable definition, local image/CSS assets, a custom element, and a toggling interaction. It installs/builds independent framework projects and serves each output without the editor. Browser assertions check the visible page, decoded local image, repeatable interaction, second page, and uncaught errors. Unit tests additionally check ZIP content, source conventions, CSS, and security boundaries.

See LIMITATIONS.md for unsupported application logic, HTML constructs needing additional target adapters, and deployment constraints. Build verification covers representative samples rather than every possible imported document.

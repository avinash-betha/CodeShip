# CSS engine

PostCSS owns parsing, declaration edits, cloning and safe round trips. Unknown safe syntax is retained. Design controls write selectors based on stable `data-cs-id` attributes, optionally within media, container or feature queries. Custom properties and vendor-prefixed declarations are permitted after value validation.

The code workspace keeps a draft until Apply succeeds. Invalid input preserves the project and draft. HTML imports extract safe style declarations through PostCSS rather than normalizing away unsupported syntax through CSSOM. Duplicated subtrees remap scoped selectors and SVG references.

`style-presets.ts` provides 16 appearance presets and Glassmorphism Studio values. Presets modify appearance without replacing content. Glass settings generate blur, saturation, tint, border opacity, radius, shadow and optional gradient; opaque feature fallbacks and reduced transparency/motion alternatives are included. The actual background still needs a contrast review.

Theme tokens live in `styles.css` and `enterprise.css`. Light/dark/system preferences persist locally; resolved appearance also changes Monaco. The design canvas retains its own document styles rather than inheriting the editor theme.

Tests: CSS preservation/security unit cases, selective extraction cases, and browser glass/spacing/appearance checks. The visual inspector is a curated property registry; source editing supports additional safe CSS.

# CodeShip design system

The desktop layer adds light/dark/system appearance tokens in enterprise.css, a shared 4/8/12/16/24/32px spacing scale, native project/export controls, eight canvas handles, spacing controls, preset swatches and the Documentation Center. Original SVG geometry stays local. Appearance and Monaco follow the same resolved theme.

The editor uses a dark neutral workspace with a pale green accent, original SVG icons, visible focus states and a consistent 8px spacing rhythm. The welcome screen, Learning Center and Icon Factory share these materials. The exported screen system uses a light botanical palette and has no editor runtime dependency.

## Forms

`packages/component-registry/template-styles.ts` is the shared source for canvas and export defaults. Forms use `--form-gap: 8px`, `--form-row-gap: 22px`, `--control-height: 46px` and `--control-radius: 10px`. Each field is a grid with its own visible label, full-width control and optional helper. The Settings template uses two columns when there is enough room and a single column on narrow screens.

The baseline includes focus, placeholder, disabled, `aria-invalid`, `:user-invalid`, required-field and helper/error styles. HTML inputs retain native validation; templates do not imply server-side form submission or settings persistence. Importing a third-party form does not silently replace its custom CSS.

## Screen layouts

Use `minmax(0, 1fr)` for shrinking grid tracks. Sidebars become wrapping navigation when their minimum content budget no longer fits. The Forma board stacks its columns at 740px; the application shell moves its 208px sidebar above its content at 800px. Wider data tables have a labeled, keyboard-focusable internal scrolling region rather than widening the document.

Typography uses system fonts, fluid heading sizes and readable body text. The shared icon registry uses a 24-unit grid, consistent line treatment and local SVG geometry. No remote icon font is required.

## Existing projects

`upgradeTemplateStyles` replaces only exact copies of the previously shipped baseline and template stylesheet. It preserves node identifiers, project timestamps, custom scoped overrides and modified third-party styles. A user-edited copy of those default blocks is left unchanged. New screen markup, including helper text and SVG navigation icons, is available by loading a fresh template; existing DOM content is preserved.

# Component library

The original five components remain available. `modern.ts` adds categorized navigation, buttons, forms, cards, layouts, data, feedback and advanced patterns. Each factory returns ordinary editable document nodes and shared CSS, rather than an opaque third-party widget.

- 25 navigation layouts: classic, minimal, centered, split, transparent, glass, floating, pill, sticky, fixed, dropdown, mega, search, profile, dashboard, sidebar, collapsible, rail, mobile, bottom, tabs, breadcrumbs, steps, enterprise and announcement.
- 16 button treatments, 21 form patterns, 15 card patterns and 16 layout patterns.
- 16 data patterns, 12 feedback patterns and advanced kanban/calendar/chat/forms/filter/file/developer presentations.

Search names/descriptions and filter Components or Screen templates by category. Insert into a valid selection or drag to a container. IDs are unique across registry entries, and factories produce fresh node identities.
The preview button renders actual factory output in an isolated frame at 375px or 1200px before insertion. A preview does not modify the project; insertion creates fresh editable nodes.

Native HTML controls implement input, date/time, file, radio, checkbox, range, select, datalist suggestions and validation. Declarative local behaviors provide filtering, sorting, pagination, panels, dialogs, dismissals, range output, tag creation/removal, local chat messages and kanban reordering. The exported runtime includes only required action handlers and cleans up framework listeners.

Authentication, payments, analytics data and persistence of preview-only chat/kanban changes require application integration. Chart, calendar and file-manager examples provide editable layouts and sample data; they are not full domain services. These distinctions are shown in the UI and offline documentation.

Tests validate every factory's HTML tree, identifiers and interaction targets. `library.spec.ts` checks document widths and representative local behaviors. `upgrade.spec.ts` measures complete screens and field geometry. Generated Angular/Next.js component builds check framework compatibility.

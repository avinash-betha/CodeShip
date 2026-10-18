# CODESHIP — FINAL LOW-CREDIT CONTINUATION & PRODUCTION QUALITY PROMPT

## ROLE & OBJECTIVE

Act as a Principal Software Architect, Senior Angular/Electron Engineer, UI/UX Design Lead, CSS Engine Specialist, and QA Engineer.

Continue developing the existing **CodeShip** application from its current repository state.

Read `PROJECT_SPEC.md`, `docs/DEVELOPMENT_PROGRESS.md`, and `docs/FEATURE_MATRIX.md` if available. Inspect existing implementation and unfinished changes.

The previous Codex session stopped because credits ran out. **Resume development; do not restart or rebuild completed features.**

Your objective is to finish the existing application, correct UI/UX problems throughout the product, preserve functionality, and reach a verified production-ready state.

Use a **low-token, implementation-first workflow**: inspect relevant code, make focused changes, test, and continue. Avoid long explanations and repeated analysis.

---

## 1. FIX THE EXPORT UI — IMMEDIATE PRIORITY

Inspect the attached CodeShip export dialog screenshot.

The current export interface is too congested and lacks consistent spacing, alignment, and hierarchy.

### A. Export configuration layout

Currently these controls are crowded together:

- Export Scope
- Output Format
- Component Name

Redesign this area professionally.

Requirements:

- Proper horizontal and vertical spacing.
- Labels clearly separated from inputs.
- Consistent input heights.
- Appropriate control widths.
- Balanced left/right padding.
- Consistent top/bottom spacing.
- Responsive Grid/Flexbox layout.
- No overlapping labels or controls.
- No awkward wrapping.
- Proper alignment at different Electron window sizes.

Use a responsive layout:

- Wide dialog: organized columns.
- Medium dialog: intelligently wrap controls.
- Narrow dialog: vertically stacked fields.

The Component Name field must appear only when relevant to the selected export scope or output format.

Do not force irrelevant configuration inputs onto users.

### B. Export project statistics

Currently the summary resembles:

"2 screen(s) · 0 assets · 9 tokens · 0 animations"

Improve the visual presentation.

Requirements:

- Place statistics in a dedicated, well-spaced summary row.
- Use consistent small icons and readable text.
- Show accurate values from the current export selection.
- Use compact informational indicators rather than cramped inline text.
- Avoid unnecessary visual noise.
- Use correct singular/plural wording.
- Do not overlap the cards or configuration fields.
- Recalculate statistics whenever export scope changes.

Optional zero-count metrics may be visually de-emphasized, but never misrepresent the actual export contents.

### C. Framework selection cards

Improve the HTML/CSS, Angular, and Next.js cards.

Requirements:

- Equal card heights.
- Consistent internal padding.
- Aligned icons.
- Clear selected state.
- Professional border and hover effects.
- Readable descriptions.
- Proper keyboard selection.
- Consistent radio indicators.
- Responsive wrapping.
- No clipped labels or descriptions.

Retain all current framework functionality.

### D. Code preview workspace

Redesign the generated-code preview.

Requirements:

- Resizable or appropriately sized code preview.
- Proper file-tree sidebar.
- Clear active-file state.
- Readable file names.
- Syntax highlighting.
- Correct code indentation.
- Line numbers where useful.
- Horizontal and vertical scrolling.
- Copy Current File action.
- Copy Selection where supported.
- Full-screen code preview.
- Consistent margins and padding.
- No clipped content.
- No unnecessary scrollbar conflicts.

Display only files relevant to the currently selected export scope and target framework.

Do not create duplicate or unnecessary generated files.

### E. Footer and download controls

Improve the footer layout:

- Clearly separated from the code workspace.
- Copy action aligned consistently.
- File count and output details readable.
- Primary export button visually prominent.
- Button label changes based on export selection.
- Consistent icon sizes.
- Loading, error, success, and disabled states.
- Correct keyboard focus and accessibility.

Examples:

- Export HTML Component
- Export Angular Component
- Export Next.js Screen
- Download Project ZIP

Use accurate contextual labels rather than showing "Download HTML project" for every export mode.

### F. Export functionality

Do not redesign UI at the expense of functionality.

Preserve and verify:

- Selected element export
- Component export
- Container/section export
- Single-screen export
- Multiple-screen export
- Entire-project export
- HTML/CSS/JavaScript
- Angular
- Next.js
- Snippet mode
- Component mode
- Screen mode
- Standalone project mode
- Copy code
- Save files
- ZIP download
- Native folder export

Include required CSS, assets, icons, animations, responsive rules, and dependencies without unrelated code.

Generated output must work independently of CodeShip.

---

## 2. FIX SIMILAR UI PROBLEMS ACROSS THE ENTIRE APPLICATION

Do not limit the improvements to the Export dialog.

Audit all existing screens, dialogs, sidebars, dropdowns, toolbars, inspectors, templates, documentation pages, and settings.

Find and fix:

- Missing padding.
- Crowded elements.
- Poor label/input spacing.
- Inconsistent button dimensions.
- Text clipping.
- Overlapping controls.
- Broken flex/grid behavior.
- Awkward text wrapping.
- Misaligned icons.
- Incorrect modal sizing.
- Horizontal overflow.
- Inconsistent typography.
- Unbalanced spacing.
- Broken responsive layouts.
- Inaccessible contrast.
- Inconsistent light/dark styling.
- Incorrect scroll containers.
- Unnecessary scrollbars.
- Missing hover/focus states.

Use centralized CodeShip design tokens and reusable layout/form components.

Prefer fixing shared styling and layout causes instead of applying numerous one-off CSS patches.

Keep the UI modern, minimalistic, clean, professional, and consistent.

Check dialogs and panels at multiple widths.

---

## 3. UNRESTRICTED CSS STUDIO

Support any syntactically valid CSS declaration, not a fixed property whitelist.

Examples:

- `float: left`
- `clear: both`
- `position: sticky`
- `display: grid`
- `backdrop-filter: blur(12px)`
- `transform: translateX(20px)`
- `clip-path`
- `animation`
- CSS custom properties
- Modern and browser-prefixed properties

Implement:

- Add
- Edit
- Remove
- Save/Apply
- Reset unsaved changes
- Reset individual property
- Reset style section
- Autocomplete
- Validation
- Live preview
- Undo/redo
- Persistent project saving
- CSS export synchronization

Preserve valid unfamiliar CSS.

Support advanced selectors, pseudo-classes, pseudo-elements, nesting, media/container queries, keyframes, and cascade layers in Monaco.

Do not fake browser layout behavior. Report why a property is ineffective in a particular layout context when necessary.

Fix the cramped CSS inspector and style preset layout from previous screenshots.

---

## 4. ADVANCED VISUAL CANVAS

Complete true direct-manipulation UI editing.

Support:

- Drag/drop elements anywhere in Freeform mode.
- Nested drop targets.
- Move and reorder elements.
- Reparent elements.
- Eight-direction resizing.
- Visual width/height indicators.
- Visual margin, padding, and gap adjustment.
- Alignment guides.
- Snap-to-grid and snap-to-element.
- Multi-selection.
- Duplicate/copy/paste.
- Keyboard movement.
- Undo/redo.
- Floating element toolbar.

Floating toolbar: Move, Resize, Duplicate, Add Icon, Align, Delete.

Support Freeform, Flexbox, CSS Grid, and Normal Flow layout modes.

Do not generate every layout using absolute positioning.

Visual changes must synchronize with the universal document model, properties inspector, CSS editor, preview, and exported code.

---

## 5. RESPONSIVE PREVIEW AND ENGINE

Fix mobile preview so it renders at real viewport widths instead of visually shrinking the desktop screen.

Support:

- Mobile
- Tablet
- Laptop
- Desktop
- Custom viewport
- Portrait/landscape
- Independent zoom

Verify widths of 320, 375, 390, 430, 768, 1024, 1280, and 1440 pixels.

Detect overflow, clipping, overlap, fixed-width problems, Grid/Flexbox constraints, image scaling, and navigation problems.

Generate reviewable responsive recommendations.

Prefer intrinsic responsiveness with Flexbox, Grid, fluid sizing, `minmax()`, and `clamp()`.

Support Apply, Reject, Before/After Preview, and Reset.

Preserve responsive rules during saving and export.

---

## 6. MODERN UI COMPONENTS AND STYLES

Preserve and complete CodeShip's editable component library:

- Multiple navbar variants: minimal, floating, sticky, glass, dropdown, mega-menu, responsive mobile navigation, topbars, and sidebars.
- Buttons: primary, secondary, outline, ghost, glass, gradient, icon, loading, and split.
- Forms: inputs, selects, comboboxes, search, switches, date/time pickers, and validation.
- Cards, panels, bento grids, hero sections, dashboards, and layouts.
- Tables, data grids, tabs, charts, progress, badges, and avatars.
- Modals, drawers, tooltips, notifications, menus, accordions, and overlays.
- Complete login, admin, analytics, management, landing page, and e-commerce templates.

Support editable style presets:

- Minimalistic
- Glassmorphism
- Soft UI
- Neumorphism
- Modern Dark/Light
- Gradient
- Elevated
- Flat
- Outline
- Enterprise
- Futuristic
- Bento
- High Contrast

All components must be customizable, responsive, and selectively exportable.

Preserve existing animations, transitions, hover states, and keyframes.

---

## 7. ICON FACTORY AND COMPONENT ICONS

Complete the original CodeShip Icon Factory.

Provide:

- Searchable icon categories.
- Consistent outline/filled styles where supported.
- Size, stroke, color, rotation, flip, opacity, and alignment.
- Safe SVG import/editing.
- Local icon storage.
- SVG/PNG/component exports.

Allow inserting icons into:

- Buttons
- Inputs
- Cards
- Navbars
- Sidebars
- Menus
- Tabs
- Alerts
- Tables
- Any valid container

Support icon-only, before-text, after-text, above-text, and below-text button layouts.

Adding icons must preserve component content, interactions, and export compatibility.

---

## 8. FULL-SCREEN FEATURES

Preserve and complete:

1. Native Electron application full screen with F11.
2. Full-screen canvas focus mode.
3. Full-screen rendered UI preview.
4. Full-screen Monaco code editor.
5. Full-screen documentation reading mode.

Provide exit controls and appropriate Escape behavior.

Restore previous selection, viewport, zoom, and workspace state.

---

## 9. PROFESSIONAL OFFLINE DOCUMENTATION

The Documentation Center must look and behave like official developer documentation, not a basic text page.

Use:

- Top documentation header.
- Left collapsible navigation.
- Center article with comfortable reading width.
- Right-side table of contents.
- Search.
- Breadcrumbs.
- Syntax-highlighted code examples.
- Copy-code buttons.
- Screenshots/diagrams where appropriate.
- Related articles.
- Previous/next navigation.
- Light/dark mode.
- Full-screen reading mode.

### Documentation must explain HOW to use every real feature.

For each feature include:

1. Purpose.
2. Where to find it.
3. Step-by-step usage.
4. Configuration options.
5. Example.
6. Expected result.
7. Common mistakes.
8. Troubleshooting.
9. Related features.

Cover:

- Projects and local saving.
- Visual drag/drop.
- Moving/resizing.
- Margin/padding/gap.
- HTML attributes.
- CSS Studio and custom properties.
- Modern components and glassmorphism.
- Icon Factory.
- Responsive Lab.
- Animations.
- Full-screen modes.
- Component and screen export.
- HTML integration.
- Angular integration.
- Next.js integration.
- Keyboard shortcuts.
- Windows desktop EXE building.

Documentation must work entirely offline and match actual functionality.

### Top toolbar Docs action

Place a visible **Docs** icon/button immediately to the left of the existing book icon.

Use consistent spacing and alignment.

Clicking it must open the real Documentation Center.

Preserve the existing book icon functionality.

---

## 10. FIRST-TIME TUTORIAL

Finish the interactive onboarding.

Guide users through:

- Creating a project.
- Adding elements.
- Moving and resizing.
- Adjusting spacing.
- Adding a modern navbar.
- Adding an icon to a button.
- Applying styles.
- Mobile preview.
- Full-screen preview.
- Saving locally.
- Exporting a component.
- Following integration documentation.

Support Next, Back, Skip, Resume, and Restart.

Persist tutorial completion locally.

---

## 11. WINDOWS ELECTRON EXE

Complete the Angular + Electron desktop build.

Ensure:

- Secure Electron IPC and context isolation.
- No mandatory network access.
- Local project storage.
- Packaged Monaco, fonts, icons, templates, and documentation.
- Production Angular build.
- Electron production packaging.
- Windows EXE installer.
- Portable EXE when supported.
- CodeShip branding and application icon.
- Installer shortcuts and uninstallation.
- No deletion of user projects during uninstall.

Create real working package scripts and verify them where possible.

### Desktop build documentation

Provide the actual repository-specific steps for:

1. Prerequisites.
2. Installing dependencies.
3. Running Angular.
4. Running Electron.
5. Building production.
6. Packaging Windows.
7. Locating the EXE.
8. Installing CodeShip.
9. Testing offline operation.
10. Troubleshooting errors.

Do not invent successful installer builds.

---

## 12. KEEP EVERYTHING LOCAL

CodeShip is a local-first Angular + Electron desktop app.

Do not introduce:

- Supabase
- Firebase
- Login
- Authentication
- Cloud storage
- Databases
- Mandatory backend APIs
- Project expiration
- Automatic deletion

Projects remain permanently on the user's machine until intentionally removed.

Preserve existing local project formats, autosave, backup, recovery, and native file dialogs.

---

## 13. VERIFICATION AND REGRESSION TESTS

Preserve all working features.

Test:

- Export dialog spacing and responsive layout.
- Changing export scope and framework.
- Correct file preview and file counts.
- Copy and ZIP/folder exports.
- Angular/Next.js/HTML generated output.
- Arbitrary CSS declarations and reset.
- Drag/drop/move/resize.
- Responsive device previews.
- Icons inside buttons.
- Modern UI components.
- Full-screen modes.
- Documentation search and navigation.
- Docs toolbar button.
- Local project save/reopen.
- Electron production build.

Use visual regression testing or screenshots for major UI surfaces.

Run relevant lint, type checks, unit tests, integration tests, and builds.

Fix observed problems and do not claim unverified success.

---

## 14. LOW-CREDIT IMPLEMENTATION STRATEGY

Follow this workflow:

1. Inspect repository status and existing progress documents.
2. Identify the exact unfinished features.
3. Read only the relevant source files.
4. Reuse existing services and components.
5. Make focused, minimal patches.
6. Fix shared UI issues centrally.
7. Avoid unnecessary dependencies and architectural rewrites.
8. Run targeted tests after changes.
9. Run broader regression tests at milestones.
10. Avoid printing large source files and verbose explanations.
11. Update progress documentation.
12. Continue to the next unfinished priority.

Do not repeatedly analyze completed work.

Do not skip necessary verification to save credits.

If execution stops again, record the exact next task.

---

## 15. IMPLEMENTATION PRIORITY

Work in this order:

1. **Fix Export UI shown in the attached screenshot.**
2. Fix the same spacing, alignment, and overflow problems application-wide.
3. Complete unrestricted CSS properties, Save, and Reset.
4. Complete Icon Factory integration.
5. Complete direct canvas manipulation.
6. Fix responsive previews.
7. Add the Docs toolbar action.
8. Finish professional offline documentation.
9. Finish full-screen modes and onboarding.
10. Verify component/screen/project exports.
11. Complete Electron Windows EXE packaging.
12. Run regression tests and prepare release verification.

Preserve all existing functionality during every step.

---

## FINAL DIRECTIVE

Continue CodeShip development from the current repository state.

Fix the congested Export dialog and all similar UI alignment, padding, spacing, and overflow problems throughout the application.

Complete the previously established advanced visual editor, CSS Studio, Icon Factory, responsive engine, modern component library, full-screen modes, documentation, tutorials, granular code exports, and Electron desktop packaging.

**Do not restart the project. Do not remove working features. Do not create placeholders. Do not add cloud services.**

Deliver clean, modular, maintainable, tested implementation code.

Only report production readiness when required functionality has been verified and no known blocking defects remain.

Start immediately with the Export dialog and existing UI components. Implement, test, fix regressions, and continue.

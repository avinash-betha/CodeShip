# CODEX MASTER BUILD PROMPT — CodeShip

## ROLE AND MISSION

Act as an autonomous Principal Software Architect, Staff Angular Engineer, Advanced CSS Engineer, UI/UX Design Lead, QA Automation Engineer, and Production Software Developer.

You are responsible for **architecting, implementing, testing, debugging, integrating, and preparing the complete CodeShip application**.

This is a real software engineering project, not a prototype-generation exercise.

**Your primary objective is to write working production-oriented application code directly into this repository.**

Read the entire `PROJECT_SPEC.md` before implementation. Treat it as the authoritative product requirements document.

The project specification defines the required functionality, supported frameworks, user experience, development standards, and product roadmap.

Do not stop after writing an architecture document, development plan, or initial Angular scaffold.

Implement the application systematically across all phases.

---

## 1. NON-NEGOTIABLE EXECUTION RULES

1. Write actual source files directly in the repository.
2. Do not merely explain how a feature could be implemented.
3. Do not create mock interfaces that appear functional but have no working behavior.
4. Do not use placeholder functions, empty handlers, fabricated outputs, or TODO comments as substitutes for implementation.
5. Do not silently skip requirements from `PROJECT_SPEC.md`.
6. Do not introduce paid APIs or mandatory cloud services.
7. Do not ask for confirmation between normal development phases.
8. Make reasonable engineering decisions independently.
9. Verify framework compatibility before selecting dependencies.
10. Use strict TypeScript, typed interfaces, modular architecture, and maintainable code.
11. Run appropriate tests after implementing each major feature.
12. Fix compilation errors, broken imports, runtime errors, and failing tests.
13. Preserve all existing working functionality while adding features.
14. Avoid unnecessary packages, duplicated utilities, excessive abstractions, and dead code.
15. Do not claim that a feature is complete unless it is actually implemented and verified.
16. Do not stop at Phase 1 or the first MVP. Continue implementing the remaining product requirements.
17. If execution is interrupted, preserve progress and clearly document the next implementation steps.

**The goal is a functioning application, not a collection of disconnected demonstrations.**

---

## 2. PRODUCT DEFINITION

Product name: CodeShip (working name).

Build a professional visual UI development platform combining:

- Drag-and-drop visual HTML builder
- Complete HTML element and attribute editing
- Advanced CSS studio
- Responsive layout analyzer and generator
- CSS media and container query generation
- Visual animation and transition editor
- Reusable components and full-screen templates
- Live multi-device previews
- Existing HTML/CSS importing and editing
- Project saving and reopening
- High-quality multi-framework code generation
- Independent HTML, Angular, and Next.js exports

The application must be usable by developers building complete real-world websites and application screens.

Users must be able to begin with either an empty canvas or a prebuilt component, layout, or screen.

Everything should be editable.

The platform must initially be free and work without a paid AI service.

---

## 3. TECHNOLOGY AND ARCHITECTURE

Use the following preferred technology stack, adjusting versions only for proven compatibility:

**Application**

- Angular, using a stable supported version
- TypeScript with strict mode
- Angular Signals for reactive editor state
- Angular CDK where appropriate
- SCSS or CSS for application styling
- Monaco Editor for source code editing

**CSS processing**

- PostCSS
- CSSTree where appropriate
- AST-based parsing and transformations
- Prettier for output formatting

**Canvas**

- Browser DOM rendering
- Pointer Events
- ResizeObserver
- Selection overlays
- A structured drag-and-drop engine

**State and storage**

- Framework-independent UI document model
- IndexedDB for local project persistence
- Versioned JSON serialization
- Undo/redo transaction history

**Testing**

- Vitest or a compatible unit-testing framework
- Playwright
- Accessibility validation
- Automated generated-code verification
- Visual regression testing for representative screens

**Tooling**

- pnpm
- ESLint
- Prettier
- GitHub Actions

Use an Angular-first frontend architecture. Do not introduce Spring Boot or a server merely to save local projects.

Design clear interfaces for future backend integration.

Do not use GrapesJS automatically. First evaluate whether it can satisfy the required universal document model, round-trip CSS editing, customization, and independent framework exporters. Choose a custom canvas implementation if it provides better architectural control.

---

## 4. REPOSITORY STRUCTURE

Create a maintainable monorepo or equivalent modular workspace.

Suggested structure:

```text
visualforge/
├── apps/
│   └── studio/
├── packages/
│   ├── document-model/
│   ├── editor-core/
│   ├── canvas/
│   ├── inspector/
│   ├── css-engine/
│   ├── animation-engine/
│   ├── responsive-engine/
│   ├── component-registry/
│   ├── template-registry/
│   ├── codegen-core/
│   ├── exporter-html/
│   ├── exporter-angular/
│   ├── exporter-nextjs/
│   ├── persistence/
│   └── validation/
├── examples/
├── tests/
├── docs/
├── PROJECT_SPEC.md
├── README.md
└── package.json
```

Refine this structure as necessary.

Only create packages when they contain meaningful implemented functionality.

Maintain correct dependency boundaries.

---

## 5. IMPLEMENT A PREMIUM VISUAL EDITOR

Design a polished, minimalistic, professional interface comparable in usability to modern visual design and developer tools.

The editor must include:

### Left sidebar

- HTML element library
- Component library
- Screen template library
- Layers/DOM tree
- Asset manager
- Saved reusable blocks
- Search and filtering

### Center canvas

- Empty canvas
- Drag-and-drop insertion
- Nested HTML containers
- Element selection
- Multi-selection
- Resize controls
- Alignment guidelines
- Snap-to-grid
- Element reordering
- Zoom and pan
- Copy, paste, duplicate, and delete
- Undo and redo
- Keyboard shortcuts
- Context menus
- Canvas background configuration
- Device viewport selection

### Right properties inspector

- General element properties
- HTML attributes
- CSS layout controls
- Dimensions and spacing
- Typography
- Colors and backgrounds
- Borders and effects
- Transforms
- Responsive overrides
- Interactive states
- Animations
- Accessibility configuration

### Bottom code workspace

- HTML code
- CSS code
- Media queries
- Keyframe animations
- Generated JavaScript/TypeScript
- Validation diagnostics
- Export options

Panels should support practical resizing and collapsing.

The UI must be responsive, visually consistent, keyboard accessible, and performant.

Use a coherent design system with spacing, typography, color, iconography, and interaction tokens.

Avoid building a generic Angular dashboard and calling it a visual editor.

---

## 6. IMPLEMENT THE UNIVERSAL DOCUMENT MODEL

This is the most important architectural foundation.

Design a framework-independent representation of the user's application.

The model must support:

- Projects
- Pages
- Element trees
- Semantic HTML tags
- Element IDs and classes
- Arbitrary valid attributes
- Text content
- Nested children
- Component instances
- Reusable component definitions
- Style rules
- CSS selectors
- CSS custom properties
- Responsive overrides
- Pseudo-classes and pseudo-elements
- Keyframe animations
- User-configured interactions
- Design tokens
- Assets
- Project metadata
- Document schema versions

Use stable unique element identifiers.

Implement well-defined operations for:

- Insert
- Remove
- Move
- Reparent
- Duplicate
- Group
- Update attributes
- Update styles
- Update content
- Undo
- Redo

Validate operations before applying them.

The document model must be the single source of truth.

The canvas, inspector, layers panel, code editor, responsive engine, persistence layer, and exporters must operate consistently on this model.

Avoid separate state representations that become unsynchronized.

Implement schema migrations for future changes.

---

## 7. COMPLETE HTML BUILDER

Support the standard HTML elements and categories defined in `PROJECT_SPEC.md`.

Allow users to:

- Drag HTML primitives onto the canvas.
- Add nested divs and semantic containers.
- Edit tags and text.
- Edit IDs and class names.
- Add/remove attributes.
- Configure data and ARIA attributes.
- Build forms and tables.
- Create navigation and sidebar layouts.
- Reorder the DOM tree.
- Create custom elements.
- Insert images and media.
- Configure supported user interactions.

Provide usable visual editing controls.

Detect duplicate IDs, missing form labels, invalid element nesting, and other common problems.

Do not silently discard attributes.

---

## 8. IMPLEMENT THE COMPLETE CSS STUDIO

The CSS engine must handle conventional and advanced modern CSS.

Implement structured visual controls for common properties and a complete code editor for the remaining valid CSS features.

Support these major categories:

- Display and positioning
- Flexbox
- CSS Grid and subgrid
- Width and height
- Margin, padding, and gap
- Typography
- Colors and gradients
- Borders and radii
- Backgrounds
- Shadows and effects
- Transforms and 3D transforms
- Filters and backdrop filters
- Overflow
- Z-index
- Scroll behavior
- Custom properties
- Logical properties
- CSS functions
- Pseudo-selectors
- Complex selectors
- CSS nesting
- Cascade layers
- Container queries
- Media queries
- Modern CSS features

Implement a property registry for visual controls rather than hardcoding independent editor logic for every property.

For CSS features without dedicated controls, support authoring through Monaco.

Use CSS parsing and AST transformations to preserve valid advanced or unfamiliar CSS syntax wherever possible.

Support a safe, predictable editing model.

**Very important: Never silently remove unsupported CSS declarations, selectors, at-rules, or custom properties.**

Users must be able to view and edit generated CSS and have their supported changes reflected in the canvas.

Implement round-trip tests covering imported and edited CSS.

Provide meaningful validation errors for malformed CSS.

---

## 9. RESPONSIVE ENGINE — HIGHEST PRIORITY

This is CodeShip's central product differentiator.

Build an actual responsive analysis and recommendation engine.

Do not implement a fake feature that simply inserts predefined 768px and 1024px media queries.

### Required analysis

Inspect:

- DOM structure
- Computed styles
- Rendered dimensions
- Parent/child constraints
- Horizontal overflow
- Flexbox and Grid behavior
- Fixed-width elements
- Text wrapping
- Image scaling
- Element overlap
- Overflowing tables
- Excessive padding and gaps
- Viewport-specific layout problems

Use real browser layout measurements.

### Required output

Generate meaningful responsive recommendations such as:

- Converting rigid widths to fluid sizing
- Adjusting Grid columns
- Changing Flexbox direction
- Introducing wrapping
- Adjusting gaps and padding
- Fluid typography using clamp()
- Scaling images correctly
- Adjusting navigation layouts
- Generating media queries
- Generating container queries where appropriate

Prefer intrinsic responsive CSS whenever possible.

Generate breakpoints based on measured layout problems, not simply device labels.

### User experience

The user must be able to:

1. Design a desktop layout.
2. Select Analyze Responsiveness.
3. See detected issues.
4. Preview proposed changes.
5. Review the original CSS against generated changes.
6. Apply individual suggestions.
7. Reject unwanted suggestions.
8. Manually override responsive styles.
9. Preview mobile, tablet, and desktop.
10. Export the final responsive CSS.

Add an understandable explanation and confidence level to recommendations.

Do not pretend that arbitrary HTML/CSS can always be made perfectly responsive automatically.

When design intent is ambiguous, provide alternatives and require a user decision.

### Existing CSS mode

Allow users to paste or import HTML and CSS.

Analyze the imported layout and generate responsive improvement suggestions.

If only CSS is provided and the DOM is necessary for accurate analysis, present a clear limitation and allow the user to provide HTML.

Validate output at representative viewport widths and report unresolved issues.

---

## 10. VISUAL ANIMATION STUDIO

Implement a usable visual editor for:

- CSS transitions
- Durations and delays
- Easing functions
- Cubic-bezier curves
- Hover/focus/active states
- Keyframe animations
- Animation iterations
- Animation directions
- Fill modes
- Transform animations
- Opacity animations
- Timeline editing
- Animation previews
- Reduced-motion alternatives

Animations should appear in live preview and generated CSS.

Unsupported advanced animation syntax must remain editable in the code editor without being deleted.

---

## 11. COMPLETE COMPONENT AND SCREEN LIBRARY

Implement the reusable components and full-screen templates defined in `PROJECT_SPEC.md`.

Prioritize real application interfaces such as:

- Dashboards
- Admin panels
- Login and registration
- User management
- Employee management
- Product management
- Settings
- Analytics
- Data tables
- Forms
- Navigation layouts
- Sidebars
- Landing pages

Every template must be represented as editable elements within the universal document model.

Do not flatten entire templates into screenshots or uneditable HTML blocks.

Provide a clean template browsing experience with thumbnails or previews, descriptions, and insertion actions.

Make sure reusable components can be customized, saved, and reused.

---

## 12. PROJECT MANAGEMENT AND PERSISTENCE

Implement a functional local-first project system.

Required:

- Create project
- Rename project
- Open existing project
- Save
- Autosave
- Duplicate
- Delete
- Import
- Export project JSON
- Reopen saved designs
- Restore recent work

Use IndexedDB.

Include schema versioning and error handling.

Preserve design information, CSS rules, animations, breakpoints, and asset references.

Project saving must not depend on a backend service.

---

## 13. MULTI-FRAMEWORK EXPORT ENGINE

Implement three independent exporters operating on the same universal document model.

### Export A: HTML/CSS/JavaScript

Generate:

- index.html
- styles.css
- script.js when interactions require it
- Local assets where applicable

The exported project must open and render independently of CodeShip.

### Export B: Angular

Generate:

- Standalone Angular components
- HTML templates
- Component CSS
- TypeScript files
- Required configuration
- Supported bindings and interactions
- Reusable component structure

Follow modern supported Angular conventions.

### Export C: Next.js

Generate:

- React functional components
- TypeScript/TSX
- CSS Modules or an explicitly configured styling strategy
- Next.js App Router structure
- Appropriate client and server components
- Supported interactions and state management
- Reusable components

Use independent target exporters.

Do not generate Angular first and convert the output into React.

Preserve equivalent visual layout and supported behavior across outputs.

### Export validation

For all targets:

- Generate actual files.
- Package them into downloadable ZIP archives.
- Format generated code.
- Handle framework-specific differences correctly.
- Validate syntax.
- Test supported interactions.
- Run generated-project builds in automated tests.
- Verify that the exported application does not require the CodeShip editor.

Never show generated code that cannot be exported as actual working files.

---

## 14. SECURITY AND ACCESSIBILITY

Treat imported documents, attributes, URLs, SVG, styles, and user-defined content as untrusted.

Implement:

- Sandboxed previews
- Safe HTML handling
- URL validation
- Protection against unsafe scripts and event-handler injection
- Protection against prototype-pollution issues
- Safe handling of third-party assets
- Project import validation
- Accessible editor controls
- Semantic HTML guidance
- Keyboard navigation
- Focus visibility
- ARIA support
- Reduced-motion support

Keep editor execution separate from imported application content.

Avoid executing arbitrary imported JavaScript inside the main CodeShip application.

Support previewing and exporting permitted interactions without compromising the editor's security.

---

## 15. QUALITY AND TEST AUTOMATION

Build a serious test suite.

### Unit tests

Test:

- Document operations
- Tree manipulation
- Undo/redo
- Attribute updates
- CSS parsing
- CSS preservation
- Responsive recommendation rules
- Media query generation
- Project serialization
- Export generation

### Integration tests

Test:

- Dragging elements into containers
- Editing properties
- Synchronizing CSS
- Applying responsive overrides
- Saving and reopening projects
- Creating animations
- Adding templates
- Exporting code

### End-to-end tests

Automate a complete flow:

1. Launch CodeShip.
2. Create a project.
3. Add a container.
4. Add text, button, and input.
5. Edit properties.
6. Apply CSS.
7. Analyze responsiveness.
8. Apply a recommendation.
9. Preview on different devices.
10. Save.
11. Reload.
12. Verify the project is preserved.
13. Export HTML.
14. Verify generated output.
15. Export Angular and Next.js.
16. Verify generated projects compile.

Also test complex screens and CSS features.

Add continuous integration to run lint, type checking, unit tests, and representative build verification.

Fix failures before reporting a milestone as complete.

---

## 16. DEVELOPMENT PHASES

Complete the implementation in the following order.

### Phase 1 — Foundation

- Angular workspace
- Repository setup
- Universal document model
- Editor state management
- Premium application shell
- Persistence foundation
- Testing foundation

### Phase 2 — Visual Builder

- DOM canvas
- Element insertion
- Drag and drop
- Nesting
- Selection
- Resizing
- Layers panel
- Alignment
- History
- Keyboard actions

### Phase 3 — HTML and CSS Studio

- Element inspector
- Attribute editor
- CSS controls
- Monaco integration
- Advanced CSS preservation
- Live synchronization

### Phase 4 — Responsive Engine

- Device previews
- Browser measurements
- Overflow detection
- Responsive suggestions
- Media query generation
- Before/after comparisons
- Suggestion approval
- Existing HTML/CSS import

### Phase 5 — Animation Studio

- Transition controls
- Keyframe animation editing
- Timeline
- Easing controls
- State previews

### Phase 6 — Component and Screen Library

- Component registry
- Editable components
- Screen templates
- Reusable saved blocks

### Phase 7 — Export Engines

- HTML/CSS/JavaScript export
- Angular export
- Next.js export
- ZIP packaging
- Generated application verification

### Phase 8 — Production Hardening

- Accessibility
- Security
- Performance
- Browser compatibility
- Integration tests
- Visual regression
- Documentation
- CI and deployment preparation

Do not treat these phases as independent prototypes.

Every completed phase must integrate into the same functioning application.

**Continue through Phase 8 without waiting for manual permission between phases.**

Use smaller testable increments within each phase to maintain quality.

---

## 17. DEVELOPMENT TRACKING

Create and maintain:

```text
docs/
├── ARCHITECTURE.md
├── DOCUMENT_MODEL.md
├── DEVELOPMENT_PROGRESS.md
├── FEATURE_MATRIX.md
├── TESTING.md
└── EXPORT_ARCHITECTURE.md
```

Track every major requirement with the following states:

- Not started
- In progress
- Implemented
- Tested
- Blocked

Use `FEATURE_MATRIX.md` to map requirements from `PROJECT_SPEC.md` to implementation files and tests.

After completing a milestone:

1. Verify the code compiles.
2. Run relevant tests.
3. Fix discovered failures.
4. Update feature status.
5. Record architectural decisions.
6. Continue to the next milestone.

Do not label incomplete or untested functionality as production-ready.

If repository tools support screenshots or browser interaction, visually inspect the working application and fix UI issues.

---

## 18. PERFORMANCE REQUIREMENTS

Design for real-world visual projects.

Prioritize:

- Efficient signal updates
- Minimal unnecessary rerendering
- Controlled DOM measurements
- Stable element identities
- Efficient selection overlays
- Debounced autosaving
- Efficient CSS AST operations
- Lazy loading large editors and template libraries
- Responsive drag-and-drop interactions
- Proper resource cleanup

Prevent performance degradation from unnecessary application-wide state updates.

Add representative performance tests for large element trees.

---

## 19. COMPLETION AND ACCEPTANCE CRITERIA

The application is not complete merely because the Angular development server starts.

Completion requires the major capabilities in `PROJECT_SPEC.md` to be implemented and verified.

At minimum, demonstrate that a user can:

1. Launch the application.
2. Create and manage projects.
3. Build entire screens by dragging and nesting elements.
4. Customize HTML structure and attributes.
5. Edit common and advanced CSS.
6. Import supported existing HTML/CSS.
7. Generate and review responsive recommendations.
8. Preview different viewport widths.
9. Create transitions and animations.
10. Add and customize reusable components.
11. Load and edit full-screen templates.
12. Save and reopen projects.
13. Export independent HTML/CSS/JS.
14. Export Angular components.
15. Export Next.js components.
16. Build generated sample projects.
17. Complete representative Playwright workflows.
18. Operate without paid third-party services.

Document any limitations clearly.

Use honest completion reporting: a partial feature is not a completed feature.

---

## 20. WORKING AUTONOMOUSLY

You are authorized to make ordinary implementation decisions within this project.

Do not ask me to choose:

- Every package
- Every interface name
- Every folder name
- Every component architecture
- Every CSS implementation detail
- Every testing library configuration

Choose sensible solutions and explain important decisions in the documentation.

Do not waste the implementation effort generating large planning responses when code can be written.

Avoid unnecessary rewrites of working code.

If a dependency causes conflicts, resolve it or choose an appropriate alternative.

If an implementation approach fails, analyze the failure, fix the approach, and rerun the tests.

When a feature depends on another incomplete feature, implement the dependency first.

Keep the application runnable throughout development.

Do not invent test outcomes.

---

## 21. START EXECUTION NOW

First:

1. Inspect the current repository.
2. Read `PROJECT_SPEC.md` completely.
3. Identify existing code to preserve.
4. Establish the repository architecture.
5. Create the requirement-to-feature implementation matrix.
6. Initialize missing workspace infrastructure.
7. Implement the first working vertical slice of the CodeShip editor.
8. Run it and test it.
9. Continue with the remaining development phases.

Your first working vertical slice must include a real canvas, element insertion, selection, property editing, saving, and basic HTML/CSS export.

Then expand systematically to complete the rest of the product.

**Do not stop after producing the initial milestone.**

At each checkpoint, report briefly:

- Features implemented
- Files created or changed
- Tests run and results
- Current limitations
- Next implementation area

Then continue coding.

If the working environment imposes execution limits, leave the repository in a buildable state, update `DEVELOPMENT_PROGRESS.md`, and record the exact next steps for continuation.

## FINAL DIRECTIVE

Build CodeShip as a real, polished, extensible, production-oriented visual UI development platform.

Prioritize working functionality, high-quality UI/UX, clean source code, powerful CSS customization, explainable automatic responsiveness, and reliable framework-independent code generation.

**Your responsibility is to implement and verify the application—not merely describe it.**

Begin by inspecting the repository and implementing Phase 1 immediately. Continue across the full specification.

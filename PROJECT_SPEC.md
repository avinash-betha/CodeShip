> Final continuation: [UI polish and verification requirements](docs/specs/final-quality.md).

> Active extension: [Full-screen, documentation and Windows build requirements](docs/specs/fullscreen-documentation.md). Preserve this baseline and all existing features.

# CODESHIP — COMPLETE ENTERPRISE DESKTOP UI DEVELOPMENT PLATFORM

## FINAL MASTER IMPLEMENTATION PROMPT FOR CODEX

# 1. ROLE AND MISSION

Act as a Principal Software Architect, Staff Angular Engineer, Senior Electron Developer, Advanced CSS Engineer, Senior UI/UX Product Designer, Visual Editor Engine Developer, Code Generation Architect, Security Engineer, QA Automation Engineer, and Technical Project Manager.

You are responsible for developing, improving, integrating, testing, and delivering **CodeShip**, a professional, production-grade, all-in-one desktop UI design and development platform.

This is a real commercial-quality software product, not a prototype, demo, landing page, or basic drag-and-drop application.

**Your responsibility is to implement actual working code in the existing repository.**

Read `PROJECT_SPEC.md` completely and inspect the entire existing codebase before making changes.

Understand existing functionality, architectural boundaries, dependencies, state management, styling, export functionality, and known issues.

Preserve all working functionality.

Refactor weak implementations without unnecessarily rewriting stable code.

The objective is to deliver a professional desktop application with outstanding UI/UX, high-quality generated code, reliable functionality, and long-term maintainability.

---

# 2. PRODUCT IDENTITY — CODESHIP

**Official application name: CodeShip**

Previous working name: VisualForge.

Rename the application consistently to CodeShip.

Update:

- Application name and title
- Electron window title
- Application branding
- Header and navigation
- Welcome screens
- Documentation
- Project dashboard
- Package metadata
- Installer name
- Application icon and visual identity
- Export documentation
- Relevant configuration and README files

Preserve compatibility with existing saved project formats and identifiers wherever required.

Do not break existing projects simply because the application is renamed.

## Product vision

**CodeShip — Design visually. Build beautifully. Export clean code.**

CodeShip is an offline-first desktop application that allows developers to:

1. Design complete web application screens visually.
2. Drag and drop HTML elements.
3. Resize and move elements directly on the canvas.
4. Build modern, attractive, responsive interfaces.
5. Customize virtually every standard CSS property.
6. Build layouts using Flexbox, Grid, and freeform positioning.
7. Use a large library of modern UI components.
8. Use professionally designed navigation systems.
9. Create glassmorphism and other modern visual styles.
10. Build reusable components and complete screens.
11. Create and customize icons using Icon Factory.
12. Add transitions and animations.
13. Generate responsive CSS automatically.
14. Preview mobile, tablet, and desktop layouts accurately.
15. Import existing HTML and CSS.
16. Export selected components, sections, screens, or entire projects.
17. Generate Angular, Next.js, and plain HTML/CSS/JavaScript code.
18. Learn every feature through offline tutorials and documentation.
19. Store all their projects permanently on their own computer.

All functionality must be designed to operate without mandatory internet access.

---

# 3. NON-NEGOTIABLE REQUIREMENTS

Follow these requirements throughout development.

- Preserve existing working functionality.
- Use clean architecture and modular design.
- Maintain loose coupling and high cohesion.
- Follow SOLID, DRY, KISS, and separation of concerns.
- Use strict TypeScript.
- Avoid unnecessary dependencies.
- Maintain consistent enterprise coding conventions.
- Implement reusable components and services.
- Avoid monolithic Angular components.
- Avoid hardcoded application settings.
- Implement meaningful error handling.
- Write automated tests.
- Verify exported code.
- Test actual desktop builds.
- Maintain documentation and development progress.
- Do not silently skip requirements.
- Do not create fake functionality.
- Do not use empty button handlers.
- Do not claim something works without testing it.
- Do not sacrifice security for convenience.
- Do not delete existing user projects during refactoring.

Make reasonable technical decisions independently.

Ask questions only when an essential external requirement cannot be determined safely.

Do not stop after generating architecture diagrams or planning documents.

Begin implementing the actual application.

---

# 4. COMPLETELY LOCAL DESKTOP ARCHITECTURE

CodeShip is NOT a SaaS application.

Use:

- Angular
- TypeScript
- Electron
- Angular Signals
- Angular CDK where appropriate
- Monaco Editor
- PostCSS and suitable CSS AST tools
- Local filesystem persistence
- Vitest or a compatible test runner
- Playwright
- ESLint
- Prettier
- Electron packaging tools

Use mutually compatible, stable supported versions.

## No cloud infrastructure

Remove obsolete implementations for:

- Supabase
- Firebase
- PostgreSQL
- Cloud authentication
- User registration and login
- Cloud storage
- Backend project APIs
- Cloud synchronization
- Automatic seven-day project deletion
- Scheduled database cleanup
- Project expiration
- Mandatory online accounts

Do not introduce a database.

Projects must be persisted as local files.

If existing Supabase or authentication code is already implemented, audit dependencies before removing it.

Preserve or migrate any locally available user data rather than deleting it.

Do not delete remote data as part of cleanup without explicit authorization.

## Electron architecture

Use a secure Electron architecture:

**Electron main process**

- Native filesystem access
- Project directory management
- Save/open dialogs
- Window management
- Desktop menus
- Native export operations
- Application settings

**Electron preload**

- Narrowly scoped, typed IPC bridge
- Input validation
- Secure desktop APIs

**Angular renderer**

- Visual editor
- Project dashboard
- CSS Studio
- Icon Factory
- Responsive Lab
- Documentation
- Component and template libraries

Enable context isolation and appropriate renderer sandboxing.

Disable Node.js integration in the renderer.

Never expose unrestricted filesystem access or shell execution through IPC.

Bundle all required runtime assets so the application can operate offline.

Initially prioritize Windows packaging while keeping the architecture portable to macOS and Linux.

---

# 5. PERMANENT LOCAL PROJECT STORAGE

Every CodeShip project must remain on the user's computer until the user intentionally deletes it.

No project expiration.

No automatic deletion.

No account requirement.

No cloud dependency.

Use a human-accessible project directory structure.

Example:

```text
CodeShip Projects/
├── Admin Dashboard/
│   ├── project.codeship.json
│   ├── assets/
│   └── backups/
├── Login Screen/
│   ├── project.codeship.json
│   ├── assets/
│   └── backups/
└── Ecommerce Website/
    ├── project.codeship.json
    ├── assets/
    └── backups/
```

Support:

- Create project
- Open project
- Open recent projects
- Save
- Save as
- Autosave
- Rename
- Duplicate
- Delete with confirmation
- Import
- Export
- Project backup
- Project recovery
- Versioned project format
- Schema migration
- Choose default storage folder
- Open project folder in File Explorer
- Restore last session
- Persist workspace layout preferences

Use atomic writes where appropriate.

Implement recovery from interrupted writes and invalid project documents.

Do not overwrite a valid project with corrupt or incomplete data.

Store images, icons, and required assets locally.

---

# 6. PREMIUM APPLICATION UI/UX — CRITICAL PRIORITY

The existing application's visual quality needs significant improvement.

Issues include:

- Incorrect left padding
- Missing right padding
- Inconsistent top spacing
- Labels too close to controls
- Unbalanced textbox spacing
- Misaligned icons
- Basic toolbar design
- Inconsistent panel dimensions
- Crowded content
- Poor mobile previews
- Unfinished-looking UI
- Inconsistent visual hierarchy

Fix these problems systematically.

Do not apply arbitrary margins as temporary patches.

## Build a centralized CodeShip design system

Create reusable design tokens for:

- Colors
- Typography
- Font weights
- Font sizes
- Spacing
- Component heights
- Border radii
- Border widths
- Shadows
- Icon sizes
- Animation timing
- Focus states
- Semantic states
- Panel sizing
- Responsive breakpoints

Use a consistent spacing scale, for example:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

Apply spacing consistently across the entire application.

Ensure proper padding on every side of each panel.

Do not allow text or controls to unintentionally touch container boundaries.

## Required visual qualities

- Professional desktop tool appearance
- Minimalistic design
- Excellent typography
- Balanced whitespace
- Consistent iconography
- Clean panel separators
- Professional toolbar
- Smooth but restrained animations
- Attractive empty states
- Premium dialogs
- Beautiful form fields
- Accessible contrast
- Light and dark themes
- Consistent hover, active, focus, and disabled states

Design CodeShip as a distinctive product, not a generic admin dashboard.

---

# 7. TRUE VISUAL DRAG-AND-DROP DESIGNER

This is one of the most important features.

CodeShip must provide a real visual layout-building experience similar in interaction quality to professional design tools and Android Studio's Layout Editor.

Users should be able to create and modify UI layouts directly on the canvas without manually entering every CSS property.

## Drag and drop

Allow users to drag:

- HTML elements
- Containers
- Text
- Headings
- Buttons
- Inputs
- Images
- Icons
- Cards
- Navigation bars
- Sidebars
- Forms
- Tables
- Components
- Complete sections
- Screen templates

Provide:

- Live drag preview
- Valid drop target highlighting
- Insertion indicators
- Nested drop support
- Alignment guides
- Smart snapping
- Element reordering
- Parent-container detection
- Canvas auto-scroll
- Invalid nesting prevention

## Direct element movement

Users must be able to:

- Select elements
- Grab elements
- Move elements
- Reposition elements
- Change their order
- Move elements between containers
- Align elements visually
- Duplicate elements
- Group selected elements
- Ungroup where supported
- Use keyboard nudging

## Direct resizing

Implement visual resize handles on selected elements.

Support eight-direction resizing:

- Top
- Bottom
- Left
- Right
- Four corners

Support:

- Width adjustment
- Height adjustment
- Minimum/maximum constraints
- Aspect-ratio locking
- Live dimension indicators
- Multi-selection transformations where appropriate
- Snap-to-grid
- Snap-to-element
- Undo/redo

Example:

A user places a card with width 300px.

The user drags its right resize handle until the card becomes 450px wide.

CodeShip updates the document model, canvas rendering, inspector value, and generated CSS immediately.

No manual property entry is required.

## Visual spacing manipulation

Support adjusting:

- Padding
- Margin
- Gap
- Alignment
- Distribution
- Container spacing

Provide on-canvas spacing handles and measurement indicators.

Changes must synchronize with generated CSS.

## Layout modes

Implement:

1. Freeform positioning
2. Flexbox
3. CSS Grid
4. Normal document flow

Do not generate every design using absolute positioning.

Preserve clean responsive layout semantics wherever possible.

When freeform layouts create responsive problems, provide suggestions for converting them into Flexbox or Grid.

## Live synchronization

All changes must use one source-of-truth document model.

Visual changes must update code.

Supported code edits must update the visual preview.

Changes in the right inspector must update both.

Use transactional history for undo/redo.

---

# 8. COMPLETE MODERN UI COMPONENT LIBRARY

CodeShip must become a one-stop platform for modern web UI design.

Build an extensive, categorized, searchable component library.

Do not limit the library to a few basic buttons, cards, and textboxes.

Every component must be visually polished, responsive, and editable.

All components should support relevant customization through both visual controls and CSS.

## A. Navigation bars — multiple modern styles

Provide a rich collection of navigation systems.

Examples:

1. Classic horizontal navbar
2. Minimal navbar
3. Centered-logo navbar
4. Split navigation
5. Transparent navbar
6. Glassmorphism navbar
7. Floating navbar
8. Pill-shaped navbar
9. Sticky navbar
10. Fixed navbar
11. Navbar with dropdowns
12. Mega menu navbar
13. Navbar with search
14. Navbar with profile menu
15. Dashboard topbar
16. Sidebar + topbar combination
17. Collapsible sidebar navigation
18. Icon-only sidebar
19. Expandable navigation rail
20. Mobile hamburger navigation
21. Mobile bottom navigation
22. Tab-based navigation
23. Breadcrumb navigation
24. Vertical step navigation
25. Responsive enterprise application navigation

These must be actual reusable component variants.

Support customizable:

- Layout
- Width
- Height
- Position
- Alignment
- Logo
- Icons
- Labels
- Typography
- Colors
- Background
- Blur
- Shadows
- Spacing
- Hover states
- Active states
- Dropdown behavior
- Responsive collapse behavior

Do not simply duplicate the same navbar with different names.

Different variants must provide meaningfully distinct layout and interaction patterns.

## B. Buttons

Provide:

- Primary
- Secondary
- Outline
- Ghost
- Text
- Icon
- Floating action
- Pill
- Gradient
- Glass
- Split
- Dropdown
- Loading
- Destructive
- Toggle
- Button groups

Include hover, focus, active, disabled, and loading states.

## C. Form components

Provide:

- Text inputs
- Password inputs
- Search inputs
- Textareas
- Select menus
- Searchable selects
- Comboboxes
- Checkboxes
- Radio groups
- Switches
- Sliders
- Date pickers
- Time pickers
- File uploads
- OTP inputs
- Tags inputs
- Autocomplete
- Multi-select
- Color pickers
- Range controls
- Form validation messages

Maintain consistent labels, spacing, field heights, and accessibility relationships.

## D. Cards and containers

Provide:

- Basic cards
- Elevated cards
- Outline cards
- Glass cards
- Gradient cards
- Interactive cards
- Expandable cards
- Profile cards
- Product cards
- Pricing cards
- Statistics cards
- Dashboard widgets
- Feature cards
- Image overlay cards
- Timeline cards

## E. Layout and structural components

Provide:

- Containers
- Stack layouts
- Grid layouts
- Split panes
- Sidebars
- Headers
- Footers
- Hero sections
- Section wrappers
- Dividers
- Resizable panels
- Masonry layouts
- Accordions
- Tabs
- Stepper layouts
- Scroll containers

## F. Data display

Provide:

- Tables
- Data grids
- Sortable tables
- Filterable tables
- Pagination
- Badges
- Avatars
- Avatar groups
- Tooltips
- Popovers
- Progress bars
- Circular progress
- Skeleton loaders
- Timelines
- Charts
- KPI widgets
- Tree views
- Property lists
- Status indicators

## G. Feedback and overlays

Provide:

- Alerts
- Toasts
- Dialogs
- Modals
- Drawers
- Confirmation dialogs
- Notifications
- Loading overlays
- Empty states
- Error states
- Success states
- Command palettes

## H. Advanced UI

Provide:

- Kanban boards
- Calendar layouts
- Search interfaces
- Filter panels
- Multi-step forms
- Data dashboards
- Settings panels
- Chat interface layouts
- Media galleries
- Image carousels
- Code editor layouts
- Split workspaces
- Developer tool interfaces
- Drag-and-drop lists

Component functionality must be real where behavior is defined.

For components requiring application-specific backend data, provide configurable inputs and realistic local demonstration behavior rather than pretending to connect to nonexistent services.

---

# 9. MODERN VISUAL STYLES AND GLASSMORPHISM

CodeShip should help users create many styles of modern interfaces.

Implement reusable style presets, not just separate hardcoded examples.

## Style presets

Support:

- Minimalistic
- Glassmorphism
- Soft UI
- Neumorphism
- Dark modern
- Light modern
- Gradient
- Elevated surfaces
- Flat
- Outline
- Material-inspired
- Enterprise
- Luxury minimal
- Futuristic
- Bento grid
- High-contrast
- Custom user styles

## Glassmorphism Studio

Build configurable glass effects with:

- Background transparency
- Backdrop blur
- Saturation
- Border opacity
- Surface tint
- Shadows
- Gradient backgrounds
- Layered surfaces
- Frosted-glass effects
- Hover transitions
- Light and dark glass variants

Use valid modern CSS such as `backdrop-filter` where supported.

Provide fallbacks where needed.

Ensure sufficient text contrast.

Support reduced-transparency or accessible alternatives when appropriate.

## Design customization

Users should be able to change:

- Colors
- Typography
- Radius
- Borders
- Spacing
- Dimensions
- Layout
- Shadows
- Blur
- Filters
- Transforms
- Gradients
- Animations
- Hover effects
- Responsive behavior

Style presets should be editable and reusable.

Users should be able to apply a preset to one component, a selected section, or an entire screen without losing custom content.

---

# 10. COMPLETE SCREEN TEMPLATE LIBRARY

Build professionally designed, fully editable templates for complete application screens.

Examples:

### Authentication

- Login
- Registration
- Forgot password
- Reset password
- OTP verification
- Authentication split-screen layout

### Dashboards

- Admin dashboard
- Analytics dashboard
- Financial dashboard
- Sales dashboard
- Project dashboard
- Developer dashboard
- CRM dashboard

### Management

- Employee management
- User management
- Product management
- Inventory management
- Customer management
- Order management
- Settings
- Profile management

### Websites

- SaaS landing page
- Portfolio
- E-commerce homepage
- Product detail
- Pricing page
- Contact page
- Blog layout
- Documentation website layout

### Advanced application screens

- Data table management
- Multi-step form
- Kanban board
- Calendar
- Reports
- Analytics
- Notification center
- Chat interface
- File manager
- UI configuration screen

Provide multiple meaningful variants for important screen categories.

Every template must be:

- Editable
- Responsive
- Composable
- Customizable
- Exportable
- Accessible
- Compatible with the CodeShip document model

Do not flatten templates into images or static, uneditable HTML.

---

# 11. COMPLETE HTML AND CSS STUDIO

Support the modern HTML and CSS capabilities defined in `PROJECT_SPEC.md`.

## HTML

Allow users to configure:

- Element tag
- ID
- Class names
- Text
- Nested content
- Attributes
- Data attributes
- ARIA attributes
- Forms
- Links
- Media
- Semantic structure
- Element order
- Custom elements

Validate invalid HTML nesting, duplicate IDs, and common accessibility problems.

## CSS

Support:

- Display
- Position
- Flexbox
- Grid
- Subgrid
- Dimensions
- Margin
- Padding
- Gap
- Typography
- Variable fonts
- Colors
- CSS color functions
- Gradients
- Backgrounds
- Borders
- Radius
- Shadows
- Opacity
- Filters
- Backdrop filters
- Clip paths
- Masks
- Transforms
- 3D transforms
- Custom properties
- CSS nesting
- Cascade layers
- Pseudo-classes
- Pseudo-elements
- Complex selectors
- Container queries
- Media queries
- Scroll snapping
- Animation properties
- Advanced modern CSS features

Provide visual controls for common properties and Monaco for advanced CSS.

Use AST-based processing to preserve valid CSS that does not have a visual control.

Never silently delete valid unfamiliar CSS rules.

Support importing existing HTML/CSS and editing it safely.

Maintain code/canvas synchronization for supported transformations, and clearly identify constructs that cannot be safely round-tripped.

---

# 12. ANIMATION AND INTERACTION STUDIO

Implement a visual animation and transition editing system.

Support:

- CSS transitions
- Duration
- Delay
- Easing
- Cubic-bezier
- Hover animations
- Focus animations
- Active states
- Keyframes
- Animation direction
- Iteration count
- Fill modes
- Opacity effects
- Transform effects
- Scroll-driven animations where supported
- Animation timeline
- Playback controls
- Reduced-motion alternatives

Users must be able to preview supported animations before exporting.

Animation definitions must remain part of the document model and export correctly.

---

# 13. RESPONSIVE LAB — ACTUAL MOBILE RESPONSIVENESS

The existing mobile preview is not behaving correctly.

Fix the underlying problem.

A mobile preview must represent the actual responsive rendering of the design at the requested viewport width.

Do not simply shrink the desktop canvas visually.

## Device preview

Support:

- Mobile
- Tablet
- Laptop
- Desktop
- Custom width and height
- Portrait/landscape
- Separate zoom control

Use appropriate isolated rendering so CSS media queries and container queries evaluate correctly.

Test representative viewport widths:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px

## Responsive analysis

Detect:

- Horizontal overflow
- Fixed-width problems
- Overlapping elements
- Text clipping
- Image overflow
- Improper Grid columns
- Flexbox constraints
- Excessive gaps
- Broken navigation
- Unusable mobile forms
- Container overflow

## Responsive recommendations

Generate suggestions for:

- Fluid widths
- Flex wrapping
- Grid adjustments
- Layout direction changes
- Spacing reduction
- Fluid typography
- Responsive navigation
- Image scaling
- Media queries
- Container queries

Prefer intrinsic responsiveness.

Do not automatically add arbitrary breakpoints without analyzing layout constraints.

Allow users to:

1. Analyze a screen.
2. Inspect identified issues.
3. Review CSS suggestions.
4. Preview before and after.
5. Apply individual suggestions.
6. Reject suggestions.
7. Edit generated media queries.
8. Export the final responsive styles.

Support existing HTML/CSS imports.

When CSS alone is insufficient to determine correct responsive behavior, request or use the corresponding HTML structure instead of inventing certainty.

---

# 14. ICON FACTORY — ORIGINAL ICON SYSTEM

Create a dedicated CodeShip Icon Factory.

This must be a functional icon design and customization workspace.

## Icon library

Provide an original, consistent icon design language for:

- Navigation
- Layout
- Actions
- Forms
- Users
- Files
- Settings
- Devices
- Charts
- Status
- Alerts
- Media
- Developer tools
- Common UI actions

Provide meaningful icon variants such as outline and filled styles.

If open-source assets are used as a temporary foundation, follow their licenses and do not misrepresent third-party artwork as original.

## Icon editing

Users must be able to:

- Search icons
- Browse categories
- Choose variants
- Modify color
- Modify stroke
- Modify size
- Modify opacity
- Rotate
- Flip
- Adjust background
- Preview on different surfaces
- Save custom versions
- Add icons directly to the canvas

## SVG editing

Provide basic vector editing capabilities:

- Shapes
- Paths
- Lines
- Groups
- Layers
- Alignment
- Transformations
- Fill and stroke
- Undo/redo
- SVG source inspection

Safely sanitize imported SVGs.

## Icon export

Support:

- SVG
- PNG
- Inline SVG
- Angular-compatible component
- React/Next.js-compatible component

All features must operate offline.

---

# 15. GRANULAR, SELECTIVE CODE EXPORT — CRITICAL FEATURE

CodeShip must not force users to export an entire application when they only need one element or component.

Users must be able to select exactly what they want to export.

## Export scope

Provide these options:

1. Selected element
2. Selected component
3. Selected container with descendants
4. Selected UI section
5. Selected screen
6. Multiple selected screens
7. Complete project

Examples:

- Export one button.
- Export a navigation bar.
- Export a login form.
- Export a sidebar.
- Export a dashboard card.
- Export a table.
- Export an entire dashboard screen.
- Export multiple application screens.
- Export the complete project.

## Target framework

Allow the user to select:

- Plain HTML/CSS/JavaScript
- Angular
- React/Next.js

## Output modes

Provide:

**Snippet mode:** Minimum required markup, styling, and supported behavior for insertion into an existing project.

**Component mode:** Reusable component files.

**Screen mode:** Complete selected screen.

**Standalone project mode:** Complete executable project with required configuration.

## Angular component export

Example:

```text
navbar/
├── navbar.component.ts
├── navbar.component.html
├── navbar.component.css
└── README.md
```

Generate modern standalone Angular components.

Do not generate unrelated application configuration when exporting one component.

Include required imports, inputs, outputs, and supported event bindings.

## Next.js component export

Example:

```text
Navbar/
├── Navbar.tsx
├── Navbar.module.css
└── README.md
```

Use TypeScript/TSX and appropriate client/server component boundaries.

Add `"use client"` only when required.

## HTML export

Example:

```text
navbar/
├── index.html
├── styles.css
├── script.js
└── assets/
```

Only include JavaScript when the component actually needs supported client-side interactions.

## Dependency-aware extraction

For each selected export, collect only required:

- HTML
- CSS
- Variables
- Design tokens
- Media queries
- Container queries
- Animations
- Fonts
- Icons
- Images
- Assets
- Child components
- Imports
- Supported interactions

Avoid unrelated source code and unnecessary dependencies.

Preserve correct styling and semantics.

## Export dialog

Create a professional dialog with:

- Selected export scope
- Framework selection
- Output mode
- Component name
- File naming
- Styling options
- Required dependencies
- Live code preview
- Copy code
- Save files
- Export ZIP
- Native folder selector
- Open exported folder

All exports must work locally.

Generated components should integrate cleanly into an existing compatible application.

Do not generate fake backend integrations or invented business behavior.

---

# 16. DOCUMENTATION CENTER — COMPLETE OFFLINE GUIDE

Add a dedicated Documentation section to CodeShip.

Documentation must be fully bundled with the desktop application.

Users should be able to learn and use the application without accessing the internet.

## Documentation sections

- Introduction
- Getting Started
- Creating Projects
- Visual Studio
- Drag and Drop
- Moving and Resizing Elements
- Padding and Margin Controls
- Layout Modes
- Flexbox
- CSS Grid
- HTML Elements
- CSS Studio
- Advanced CSS
- Components
- Navigation Bars
- Modern Style Presets
- Glassmorphism
- Templates
- Icon Factory
- Responsive Lab
- Animations
- Project Management
- Selective Code Export
- Angular Integration
- Next.js Integration
- HTML/CSS Integration
- Keyboard Shortcuts
- Troubleshooting
- FAQ

Provide:

- Search
- Sidebar navigation
- Table of contents
- Syntax-highlighted examples
- Copy buttons
- Related articles
- Previous/next navigation
- Light and dark modes
- Practical examples
- Contextual navigation back into the editor

Documentation must reflect actual implemented functionality.

## Export integration guides

Explain clearly how to:

- Export a single component.
- Copy generated HTML/CSS into an existing website.
- Import an Angular standalone component.
- Use exported Angular templates, CSS, and TypeScript.
- Import Next.js components.
- Configure exported assets.
- Use CSS Modules.
- Handle responsive rules.
- Integrate supported interactions.
- Export and run an entire project.

Generate relevant README instructions alongside exported components and projects.

---

# 17. FIRST-TIME USER ONBOARDING

Build an interactive tutorial for users opening CodeShip for the first time.

Provide a welcome experience with:

- Create blank project
- Start from a template
- Explore components
- Explore Icon Factory
- Import existing HTML/CSS
- Take guided tutorial

## Guided tutorial steps

1. Create a local project.
2. Open the editor.
3. Drag a container.
4. Add text.
5. Add a button.
6. Resize the container by dragging its handle.
7. Adjust padding visually.
8. Change CSS.
9. Add an icon.
10. Add a modern navbar.
11. Apply a visual style preset.
12. Preview mobile.
13. Generate responsive CSS.
14. Save the project.
15. Export the selected component.
16. Learn how to integrate generated code.

Use actual UI highlights and contextual tooltips.

Support:

- Next
- Back
- Skip
- Resume
- Restart

Persist tutorial progress in local application settings.

---

# 18. APPLICATION STRUCTURE AND NAVIGATION

Design CodeShip around clear product areas.

## Main application areas

**My Projects**
Local project management and recent files.

**Visual Studio**
Main drag-and-drop UI builder.

**Components**
Reusable UI elements and component variants.

**Templates**
Complete screens and layouts.

**CSS Studio**
Advanced visual styling and code editing.

**Responsive Lab**
Device previews and responsive CSS analysis.

**Animation Studio**
Transitions, keyframes, and state previews.

**Icon Factory**
Icon browsing, customization, and SVG editing.

**Code Export**
Component-level, screen-level, and project-level export.

**Documentation**
Complete offline learning center.

**Settings**
Local storage, editor preferences, themes, keyboard shortcuts, and application settings.

Make navigation coherent and avoid unnecessary duplication between top-level workspaces and editor panels.

Users should be able to access relevant tools without losing their current editing context.

---

# 19. UNIVERSAL DOCUMENT MODEL

All CodeShip design features must operate on one framework-independent document model.

The model must represent:

- Projects
- Screens/pages
- Element trees
- Element IDs
- HTML tags
- Attributes
- Classes
- Text
- Layout constraints
- CSS rules
- Responsive overrides
- Pseudo states
- Custom properties
- Animations
- Interactions
- Components
- Design tokens
- Assets
- Icon definitions
- Export preferences
- Schema versions

The canvas, inspector, CSS Studio, Responsive Lab, Icon Factory, local persistence, and exporters must share the same source of truth.

Use stable identifiers.

Implement valid tree operations, history, serialization, migration, and validation.

Keep Angular and Next.js-specific concerns outside the document model.

Do not introduce different conflicting design representations for separate editors.

---

# 20. SECURITY AND ACCESSIBILITY

Even though CodeShip works offline, imported content must be considered untrusted.

Implement:

- Secure Electron IPC
- Context isolation
- Safe filesystem handling
- Path traversal prevention
- Imported HTML sanitization
- Imported SVG sanitization
- Sandboxed design previews
- Restriction of executable imported scripts
- URL validation
- Safe asset handling
- Keyboard navigation
- Accessible labels
- Focus indicators
- Appropriate contrast
- Reduced-motion support
- Semantic HTML validation
- Accessibility diagnostics for exported code

Do not disable Electron security features to simplify implementation.

Do not execute arbitrary imported project code with privileged desktop permissions.

---

# 21. TESTING — NO UNVERIFIED FUNCTIONALITY

The goal is production readiness.

Do not claim the application is bug-free merely because the development server starts.

Implement and run appropriate tests.

## Unit tests

Cover:

- Document operations
- History
- Drag transformations
- Resize calculations
- Layout constraints
- CSS parsing
- CSS preservation
- Responsive rules
- Icon serialization
- Project saving/loading
- Export selection
- Dependency extraction
- Framework code generation

## Integration tests

Cover:

- Dragging components
- Moving and resizing elements
- Visual spacing controls
- Property synchronization
- CSS updates
- Responsive previews
- Adding UI templates
- Adding icons
- Saving and reopening projects
- Exporting selected components
- Exporting complete screens

## End-to-end tests

Verify that a user can:

1. Launch the Electron application.
2. Create a local project.
3. Add a modern navbar.
4. Add cards, text, and inputs.
5. Move and resize components.
6. Adjust margins and padding.
7. Apply glassmorphism styling.
8. Preview mobile and desktop layouts.
9. Generate responsive CSS.
10. Save the project.
11. Close and reopen CodeShip.
12. Confirm the design is preserved.
13. Export only the navbar as Angular.
14. Export a selected card as Next.js.
15. Export the full screen as HTML/CSS.
16. Verify generated outputs independently.

## Visual quality tests

Capture screenshots or use visual regression tests for:

- Dashboard
- Editor
- Sidebar
- Properties inspector
- Forms
- Navigation components
- Glass style presets
- Mobile preview
- Icon Factory
- Documentation
- Export dialog

Investigate:

- Inconsistent padding
- Clipped text
- Misaligned controls
- Overflow
- Missing icons
- Broken layouts
- Unreadable contrast

## Build verification

Run:

- Lint
- Type checking
- Unit tests
- Integration tests
- End-to-end tests
- Production Angular build
- Electron packaging
- Packaged-app smoke tests
- Generated Angular sample builds
- Generated Next.js sample builds
- Generated HTML browser tests

Fix observed errors and regressions before declaring completion.

If a test cannot run due to an environment limitation, record that honestly and provide the exact verification steps.

---

# 22. PERFORMANCE AND ENTERPRISE ENGINEERING

Follow:

- SOLID
- DRY
- KISS
- Clean architecture
- Separation of concerns
- Loose coupling
- High cohesion
- Interface-based design
- Dependency injection
- Strict TypeScript
- Typed APIs
- Reusable design primitives
- Proper error handling
- Automated testing

Optimize:

- Canvas rendering
- Drag-and-drop responsiveness
- Pointer-event handling
- Selection overlays
- Element tree operations
- Large project handling
- CSS AST transformations
- Autosaving
- Project loading
- Template insertion
- Icon rendering
- Code generation
- Memory usage
- Electron startup performance

Avoid:

- God components
- Circular dependencies
- Excessive shared mutable state
- Duplicate business logic
- Unnecessary rerenders
- Excessive inline styles
- Repeated CSS overrides
- Dead code
- Empty handlers
- Placeholder services presented as completed features

Use performance measurements when diagnosing slow interactions.

---

# 23. PRESERVE EXISTING FUNCTIONALITY — MANDATORY

Before making changes, audit the existing repository.

Create a baseline inventory of existing functionality.

For each existing feature, record:

- Source files
- Dependencies
- Current behavior
- Existing tests
- Known defects
- Whether it must be preserved or replaced

Do not delete or rewrite modules blindly.

Before major refactors:

1. Identify callers and dependencies.
2. Add regression coverage for important existing behavior.
3. Make incremental changes.
4. Verify integration.
5. Run tests.
6. Confirm the previous workflows still function.

Existing user projects must continue opening after the product rename and document-model changes.

If a migration is required, provide tested migration logic and preserve a backup of the original.

Never silently discard project data.

---

# 24. IMPLEMENTATION PHASES

Follow this order, while adapting dependencies to the real repository.

## Phase 0 — Codebase audit

- Read `PROJECT_SPEC.md`.
- Inspect the complete repository.
- Identify existing functionality.
- Build the feature matrix.
- Identify defects.
- Review architecture.
- Establish regression tests.

## Phase 1 — CodeShip desktop foundation

- Rename VisualForge to CodeShip.
- Remove obsolete cloud dependencies.
- Configure secure Electron architecture.
- Implement local filesystem projects.
- Verify the existing app still works.

## Phase 2 — UI/UX quality overhaul

- Create the design system.
- Fix padding and spacing.
- Fix forms.
- Improve typography.
- Improve navigation.
- Improve panel layouts.
- Improve icons.
- Add light/dark themes.
- Validate screenshots.

## Phase 3 — Advanced visual canvas

- Drag and drop.
- Nested placement.
- Direct element movement.
- Eight-direction resizing.
- Visual padding and gap controls.
- Alignment and snapping.
- Multi-selection.
- Undo/redo.
- Flexbox, Grid, freeform, and normal flow integration.

## Phase 4 — Modern component library

- Navigation variants.
- Buttons and forms.
- Cards and layouts.
- Data components.
- Overlays.
- Advanced UI components.
- Glassmorphism and style presets.
- Responsive component defaults.

## Phase 5 — Screen templates

- Authentication screens.
- Dashboards.
- Management screens.
- Landing pages.
- Settings.
- Data-heavy application screens.
- Fully editable template insertion.

## Phase 6 — CSS and animation

- Advanced CSS controls.
- Monaco integration.
- CSS preservation.
- Visual animation editor.
- Transitions.
- Keyframes.
- Interactive states.

## Phase 7 — Responsive Lab

- Accurate device simulation.
- Layout measurements.
- Overflow detection.
- Responsive suggestions.
- Media query generation.
- Before/after preview.
- User approval workflow.

## Phase 8 — Icon Factory

- Original icon library.
- Search and categories.
- Customization.
- SVG editing.
- Local saving.
- Component integration.
- Icon export.

## Phase 9 — Granular code export

- Element export.
- Component export.
- Container export.
- Screen export.
- Multi-screen export.
- Full project export.
- HTML generator.
- Angular generator.
- Next.js generator.
- Dependency extraction.
- Copy, ZIP, and native folder export.

## Phase 10 — Documentation and onboarding

- Offline Documentation Center.
- First-time walkthrough.
- Visual editing tutorials.
- Modern UI tutorials.
- Responsive design guides.
- Framework integration guides.
- Keyboard shortcuts.
- Troubleshooting.

## Phase 11 — Production readiness

- Security audit.
- Accessibility review.
- UI regression tests.
- Performance optimization.
- Generated-code verification.
- Electron packaging.
- Installer verification.
- Documentation.
- Release readiness review.

All completed phases must integrate into one functional product.

Do not develop isolated prototypes that cannot be reused by the application.

---

# 25. PROGRESS TRACKING AND DOCUMENTATION

Create and maintain:

```text
docs/
├── ARCHITECTURE.md
├── DEVELOPMENT_PROGRESS.md
├── FEATURE_MATRIX.md
├── DESIGN_SYSTEM.md
├── DESKTOP_ARCHITECTURE.md
├── LOCAL_PROJECT_STORAGE.md
├── VISUAL_CANVAS_ENGINE.md
├── COMPONENT_LIBRARY.md
├── TEMPLATE_LIBRARY.md
├── CSS_ENGINE.md
├── RESPONSIVE_ENGINE.md
├── ANIMATION_STUDIO.md
├── ICON_FACTORY.md
├── EXPORT_ARCHITECTURE.md
├── DOCUMENTATION_GUIDE.md
├── TESTING.md
└── RELEASE_CHECKLIST.md
```

Track every major requirement as:

- Not started
- In progress
- Implemented
- Tested
- Blocked

Map requirements to source files and tests.

Keep architecture decisions documented.

Do not mark features complete simply because their buttons or screens exist.

---

# 26. FINAL ACCEPTANCE CRITERIA

CodeShip is ready for release only when the implemented scope satisfies its verified acceptance criteria.

At minimum, a developer must be able to:

1. Install and launch CodeShip.
2. Work entirely offline.
3. Create local projects.
4. Reopen projects without data loss.
5. Design complete UI screens.
6. Drag, move, resize, and align elements visually.
7. Adjust spacing without manually entering CSS.
8. Add different modern navigation bars.
9. Use a rich component library.
10. Apply glassmorphism and modern design styles.
11. Customize advanced HTML and CSS.
12. Add icons using Icon Factory.
13. Build reusable components.
14. Import HTML/CSS.
15. Preview responsive layouts accurately.
16. Generate and review responsive CSS.
17. Create transitions and animations.
18. Export individual elements.
19. Export reusable components.
20. Export individual screens.
21. Export complete projects.
22. Generate Angular code.
23. Generate Next.js code.
24. Generate HTML/CSS/JavaScript.
25. Verify generated example projects.
26. Follow offline tutorials.
27. Use complete offline documentation.
28. Retain projects locally indefinitely until intentional deletion.
29. Use the packaged desktop application without backend services.
30. Complete representative workflows without known blocking defects.

Do not claim that untested functionality is production-ready.

---

# 27. FINAL EXECUTION INSTRUCTIONS

You are responsible for the complete implementation process.

Do not simply explain what to build.

Do not stop after creating project folders.

Do not stop after redesigning the landing page.

Do not stop after generating sample components.

Do not repeatedly request approval for ordinary architecture and implementation decisions.

Implement the actual changes directly in the repository.

After each meaningful milestone:

1. Implement the code.
2. Run appropriate tests.
3. Fix discovered defects.
4. Verify integration.
5. Check existing functionality for regressions.
6. Review UI quality.
7. Update the feature matrix.
8. Record remaining limitations.
9. Continue with the next unfinished requirement.

If the execution environment imposes time or context limits, preserve a buildable repository, document precise continuation instructions, and avoid claiming unfinished work is complete.

Never hide failing tests or invent successful build results.

## FINAL DIRECTIVE

Build **CodeShip** into a complete, premium, enterprise-grade, offline-first visual UI engineering desktop platform.

The application must provide:

- Beautiful, original UI/UX
- Consistent padding, alignment, and typography
- Advanced drag-and-drop visual editing
- Direct movement and resizing of elements
- Visual margin, padding, and gap controls
- Comprehensive modern UI components
- Multiple professional navbar variants
- Glassmorphism and modern style presets
- Complete editable screen templates
- Advanced HTML and CSS controls
- Responsive layout analysis
- Animation and interaction editing
- Original Icon Factory
- Granular component and screen exports
- Angular, Next.js, and HTML code generation
- Local permanent project storage
- Interactive first-time tutorials
- Complete offline documentation
- Secure Angular + Electron architecture
- Enterprise coding standards
- Rigorous testing and packaging verification

**NO Supabase. NO database. NO login. NO cloud dependency. NO automatic project deletion.**

**Do not remove or break existing working features.**

**Do not substitute mock functionality for actual implementation.**

**Do not claim bug-free or production-ready status without meaningful testing and verification.**

Your goal is a polished, maintainable, secure, fully integrated desktop product with no known blocking defects or failing required checks.

Start now:

1. Read `PROJECT_SPEC.md`.
2. Audit the existing CodeShip repository.
3. Update conflicting specifications to reflect the final desktop-only requirements.
4. Preserve working functionality and project data.
5. Establish and execute the implementation roadmap.
6. Begin making actual code changes immediately.
7. Continue implementing, testing, debugging, and integrating the complete application.

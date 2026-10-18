# CODESHIP — PROFESSIONAL DOCUMENTATION, FULL-SCREEN STUDIO & WINDOWS DESKTOP BUILD

## ROLE AND OBJECTIVE

Act as a Principal Software Architect, Senior Angular Developer, Electron Desktop Engineer, Technical Documentation Architect, Senior UI/UX Designer, and QA Automation Engineer.

We are building **CodeShip**, a professional, fully offline desktop visual UI development platform using Angular, TypeScript, and Electron.

Read `PROJECT_SPEC.md`, inspect the existing repository, and understand all currently implemented functionality before modifying the application.

Your current assignment is to implement three major improvements:

1. **Complete full-screen support throughout CodeShip.**
2. **A professional documentation platform comparable in quality and usability to official Angular, React, and other major developer documentation sites.**
3. **Complete, tested instructions and build infrastructure for generating, packaging, installing, and distributing the CodeShip Windows desktop `.exe` application.**

These requirements extend our existing application specification.

Do not remove or break existing functionality.

Do not create a basic documentation page with unstructured paragraphs.

Do not implement a fake full-screen button that only changes a CSS class without delivering the requested experience.

Do not merely explain how Electron packaging works. Configure it, implement the required scripts, and verify the build wherever the execution environment permits.

---

# 1. COMPLETE FULL-SCREEN EXPERIENCE

CodeShip must support multiple meaningful full-screen modes.

## A. Application full-screen mode

Provide a full-screen button in the main application header.

When activated:

- The Electron window enters the operating system's full-screen mode.
- The application uses the full available display area.
- The layout recalculates correctly.
- Sidebars and panels remain usable.
- Dialogs and overlays remain functional.
- The application does not clip content.
- All relevant editor controls continue to work.

Support keyboard shortcuts:

- `F11` — Toggle application full screen.
- `Esc` — Exit an appropriate full-screen mode when applicable.
- Provide a visible exit-full-screen control.

Use Electron's native window APIs through the secure preload IPC bridge.

Avoid conflicting keyboard shortcuts.

Support normal window restore, maximize, minimize, and full-screen behavior.

Do not automatically force full-screen on first launch.

## B. Full-screen Visual Studio canvas

Add a dedicated **Focus Canvas** or **Full-Screen Canvas** option.

When selected:

- Hide the main project dashboard navigation.
- Collapse or temporarily hide the left component sidebar.
- Hide the right properties inspector.
- Hide the bottom code workspace.
- Maximize the usable canvas area.
- Keep a minimal floating toolbar or compact editor controls.
- Retain access to selection, zoom, undo/redo, device previews, and exit controls.

Users must be able to design on a large uninterrupted workspace.

Support restoring the exact previous panel layout when leaving canvas focus mode.

Do not reset the project, selection, viewport, zoom level, or unsaved editing state.

## C. Full-screen preview mode

Implement a dedicated **Preview Full Screen** action.

Users must be able to preview the entire designed screen without CodeShip editor controls.

When activated:

- Hide selection outlines and resize handles.
- Hide drag-and-drop indicators.
- Hide canvas grids unless part of the design.
- Hide editor panels and inspector controls.
- Render the design as it would appear in the browser.
- Preserve animations and supported component interactions.
- Use actual responsive viewport dimensions.

Support:

- Desktop full-screen preview
- Laptop preview
- Tablet preview
- Mobile preview
- Custom viewport preview
- Portrait and landscape switching

Provide an easy return-to-editor action.

The preview must represent the generated web UI, not simply an enlarged screenshot of the canvas.

## D. Full-screen code editor

Users should be able to maximize the code workspace.

Implement:

- Full-screen Monaco editor
- HTML/CSS/TypeScript tabs
- Syntax highlighting
- Formatting
- Diagnostics
- Copy code
- Restore editor layout

Preserve cursor position and unsaved edits when toggling modes.

## E. Full-screen documentation

The Documentation Center must have its own full-screen reading mode.

Support:

- Expand reading area
- Collapse documentation navigation
- Hide application chrome
- Maintain readable content width
- Optional table-of-contents visibility
- Restore normal layout
- Keyboard-accessible exit

Do not simply stretch paragraph text edge-to-edge across a wide monitor.

Maintain professional reading widths and typography.

---

# 2. PROFESSIONAL DOCUMENTATION CENTER — COMPLETE REDESIGN

The existing documentation experience is too basic.

Redesign it as a **professional developer documentation platform**, taking inspiration from the information architecture and reading experience of official Angular, React, TypeScript, MDN, and other high-quality developer documentation.

Create an original CodeShip visual identity rather than copying another website's branding.

The documentation should feel like a complete software product within CodeShip.

## A. Documentation layout

Use a responsive documentation layout similar to:

```text
┌───────────────────────────────────────────────────────┐
│ CodeShip Docs   Search...       Theme   Full Screen   │
├───────────────┬────────────────────────┬──────────────┤
│               │                        │              │
│ GETTING       │  Article Title         │ ON THIS PAGE │
│ STARTED       │                        │              │
│               │  Introduction          │ Introduction │
│ Introduction  │                        │ Installation │
│ Installation  │  Step-by-step guide    │ Example      │
│ Quick Start   │                        │ Next Steps   │
│               │  Code examples         │              │
│ VISUAL STUDIO │                        │              │
│               │  Screenshots           │              │
│ Drag & Drop   │                        │              │
│ Resizing      │  Important notes       │              │
│ CSS Editing   │                        │              │
│               │  Previous / Next       │              │
└───────────────┴────────────────────────┴──────────────┘
```

### Top documentation header

Include:

- CodeShip documentation branding
- Global documentation search
- Documentation version
- Light/dark theme toggle
- Full-screen toggle
- Back-to-editor action

### Left navigation sidebar

Create a structured, collapsible navigation tree.

Support:

- Grouped categories
- Expandable sections
- Active-page highlighting
- Nested navigation
- Scrollable sidebar
- Search or filtering
- Persistent navigation state where appropriate

### Main content area

Use a professional reading layout.

Include:

- Breadcrumbs
- Article title
- Short introduction
- Estimated reading time where useful
- Section headings
- Numbered instructions
- Screenshots and diagrams
- Syntax-highlighted code blocks
- Information and warning callouts
- Troubleshooting notes
- Related guides
- Previous and next article navigation

### Right-side table of contents

Include:

- On This Page heading
- Current article headings
- Clickable section anchors
- Active-section tracking
- Smooth navigation where appropriate

Make the right sidebar sticky without covering article content.

On narrow desktop windows, collapse secondary navigation into accessible menus.

---

# 3. DOCUMENTATION VISUAL QUALITY

Apply CodeShip's design system consistently.

Use:

- Excellent typography hierarchy
- Comfortable line height
- Balanced article width
- Proper paragraph spacing
- Clearly separated sections
- Correct list indentation
- Consistent heading margins
- Visually differentiated code blocks
- Refined dividers
- Professional callout styling
- Accessible contrast
- Attractive screenshots
- Consistent icon usage

Fix padding and spacing on all four sides.

Avoid text touching borders, cramped sidebars, uneven content margins, or excessively wide reading columns.

The documentation should be readable for long periods.

## Code examples

Every relevant code block should provide:

- Language label
- Syntax highlighting
- Copy button
- Appropriate line wrapping or horizontal scrolling
- Clean formatting
- Explanation of what the code does

Use proper code examples for:

- HTML
- CSS
- TypeScript
- Angular
- React/Next.js
- JSON
- PowerShell
- Windows terminal commands

Do not display all code as plain unformatted text.

## Interactive documentation features

Implement:

- Instant local search
- Keyboard-accessible navigation
- Search-result highlighting
- Deep links to sections
- Article bookmarks where useful
- Copy-code controls
- Related article links
- Back-to-top action
- Open-related-feature action
- Theme persistence
- Full-screen reading mode
- Print-friendly article styling

All documentation must remain accessible offline.

Bundle documentation content, icons, fonts, diagrams, and screenshots locally.

Do not require a CDN or external documentation website.

---

# 4. COMPLETE DOCUMENTATION CONTENT

Create meaningful, well-structured documentation covering all major CodeShip features.

## Section 1 — Introduction

Include:

- What is CodeShip?
- Key features
- Supported technologies
- Offline-first architecture
- How CodeShip works
- Basic design-to-code workflow

## Section 2 — Installation and Getting Started

Include:

- System requirements
- Installing the desktop application
- Launching CodeShip
- Creating the first project
- Choosing the local projects directory
- Understanding the workspace
- Saving a project
- Opening an existing project

## Section 3 — Visual Studio

Document:

- Drag and drop
- Element selection
- Nested containers
- Moving elements
- Eight-direction resizing
- Direct padding adjustment
- Margin and gap controls
- Alignment guides
- Snapping
- Grouping
- Layers panel
- Undo/redo
- Keyboard shortcuts
- Full-screen canvas mode

Use screenshots or clear diagrams to demonstrate actual interactions.

## Section 4 — HTML Builder

Document:

- HTML elements
- Semantic tags
- Attributes
- IDs and classes
- Nested structure
- Forms
- Images
- Links
- Accessibility configuration

## Section 5 — CSS Studio

Document:

- Properties inspector
- Flexbox
- Grid
- Typography
- Spacing
- Colors
- Backgrounds
- Borders
- Shadows
- Gradients
- Transforms
- Advanced CSS
- CSS variables
- Pseudo-selectors
- Custom CSS editing

## Section 6 — Components and Templates

Document:

- Adding components
- Component customization
- Modern navigation bars
- Cards
- Forms
- Tables
- Buttons
- Layouts
- Complete screen templates
- Reusable component creation

## Section 7 — Modern UI and Glassmorphism

Include tutorials for:

- Glass navigation bar
- Frosted-glass cards
- Modern sidebar
- Gradient buttons
- Responsive dashboard
- Bento-style sections
- Dark UI
- Modern form layouts

Provide the actual design steps and corresponding CSS explanations.

## Section 8 — Responsive Lab

Document:

- Mobile preview
- Tablet preview
- Desktop preview
- Custom viewport sizing
- Full-screen preview
- Responsive analysis
- Media queries
- Container queries
- Flexbox and Grid adaptation
- Generating responsive recommendations
- Applying or rejecting suggestions

Explain how the responsive engine works and its limitations.

## Section 9 — Icon Factory

Document:

- Finding icons
- Customizing icons
- Creating SVG icons
- Changing strokes and fills
- Saving custom icons
- Using icons in a component
- Exporting icons

## Section 10 — Animations

Document:

- Transitions
- Hover effects
- Keyframes
- Easing
- Animation timeline
- State previews
- Accessibility and reduced motion

## Section 11 — Local Project Management

Document:

- Project files
- Autosaving
- Backups
- Project recovery
- Opening folders
- Importing and exporting projects
- Moving projects between computers
- Permanent local storage

## Section 12 — Code Export

Document:

- Export selected element
- Export component
- Export container
- Export one screen
- Export multiple screens
- Export entire project
- Copy code snippets
- Save files
- Export ZIP
- Managing assets and dependencies

## Section 13 — Framework Integration

Create separate detailed guides for:

- Plain HTML/CSS/JavaScript
- Angular
- Next.js

Explain how to use generated code in an existing project, not merely how to generate it.

## Section 14 — Advanced Topics

Include:

- CodeShip project document format
- Design tokens
- Importing HTML/CSS
- Custom CSS
- Export compatibility
- Local assets
- Accessibility
- Performance
- Troubleshooting

## Section 15 — Desktop Development

Include the complete Electron desktop build instructions described below.

---

# 5. COMPLETE WINDOWS DESKTOP EXE BUILD GUIDE

This is a mandatory requirement.

Create a professional documentation article titled:

**Building CodeShip for Windows — From Source Code to EXE Installer**

The guide must allow a developer to build the actual CodeShip desktop application from the repository.

Do not write generic Electron tutorials unrelated to this codebase.

Inspect the existing workspace, package manager, Angular configuration, Electron integration, and build scripts first.

Then implement and document the real process.

## A. Prerequisites

Document the actual requirements:

- Supported Windows versions
- Node.js version
- Package manager version
- Git if required
- Build dependencies
- Required Windows tools
- Disk space considerations
- Architecture requirements

Show installation and verification commands.

Use pinned or documented compatible versions rather than assuming any Node.js release will work.

## B. Clone or open the repository

Document:

- How to obtain the source code
- Where to open the project
- How to inspect the workspace
- How to install dependencies
- How to configure development settings

Provide working terminal commands.

## C. Run Angular in development mode

Document the exact repository-specific command for starting the Angular application.

Explain:

- What the command starts
- Which development server is used, if any
- How to view errors
- How to stop the process

## D. Run CodeShip as an Electron desktop application

Create and document a working development command.

For example, provide a verified script with a suitable purpose such as:

`pnpm dev:desktop`

The implementation must:

1. Build or serve Angular appropriately.
2. Launch Electron.
3. Load the Angular application.
4. Support development debugging.
5. Display errors clearly.
6. Shut down child processes cleanly.

Adapt scripts to the actual repository rather than assuming the example already exists.

## E. Build Angular for production

Create or verify the production build process.

Document:

- The production build command
- Output directory
- Asset bundling
- Configuration handling
- Source-map policy
- Production optimizations

Ensure Monaco, documentation assets, icons, themes, templates, and fonts are included.

## F. Package Electron

Choose and configure a suitable, actively maintained packaging solution such as electron-builder or Electron Forge, based on actual project compatibility.

Set up:

- Application ID
- Product name: CodeShip
- Version
- Windows executable name
- Installer configuration
- Application icon
- ASAR packaging where appropriate
- Files to include
- Files to exclude
- Correct Electron main and preload entry points
- Runtime asset paths
- User data directory behavior

Ensure the production Electron application loads local packaged resources correctly.

Do not depend on a running Angular development server after packaging.

Address routing and local asset loading correctly, using a suitable secure application protocol or equivalent strategy where needed.

## G. Generate the EXE

Provide actual repository scripts for:

- Production Angular build
- Electron packaging
- Windows installer creation
- Windows portable build, if supported
- Build verification

Use clear script names, for example:

`pnpm build:desktop`

`pnpm dist:win`

`pnpm dist:win:portable`

Use these names only after implementing and validating them in `package.json`.

Document the resulting output paths.

Prefer a conventional installer artifact such as:

`CodeShip-Setup-<version>.exe`

The exact name and output path must match the real build configuration.

Do not claim an installer was generated unless the artifact exists.

## H. Windows installer experience

Configure a professional installer where supported.

Consider:

- Installation directory selection
- Desktop shortcut
- Start Menu shortcut
- Application icon
- Application version
- Uninstallation
- Installation and update behavior
- Correct application data locations

Do not remove user-created project directories during uninstall.

Document whether installation requires administrative permission.

## I. Application icon and branding

Create or integrate proper CodeShip branding.

Provide required Windows icon assets in the correct format and dimensions.

Use consistent branding for:

- Installer
- Desktop shortcut
- Executable
- Application window
- Taskbar
- About dialog

Use original or appropriately licensed visual assets.

## J. Code signing and Windows SmartScreen

Explain:

- The difference between signed and unsigned installers
- Why SmartScreen may warn about unknown applications
- When code signing is appropriate
- Which credentials or certificates would be required
- How signing would be configured securely

Do not invent signing certificates.

Do not expose private signing keys.

Unsigned development builds must still be possible.

## K. Testing the packaged EXE

Validate:

1. Installer launches.
2. Application installs successfully.
3. CodeShip launches independently of the development environment.
4. Angular content renders.
5. Icons and styles load.
6. Documentation works offline.
7. Project creation works.
8. Local file saving works.
9. Projects reopen correctly.
10. Drag-and-drop works.
11. Full-screen modes work.
12. Mobile preview works.
13. Code exports work.
14. Application closes cleanly.
15. Uninstall does not destroy user projects.

Where packaging or installation cannot be executed in the current environment, report the exact limitations and provide reproducible verification instructions.

## L. Build troubleshooting

Document common errors:

- Missing Node.js
- Unsupported Node version
- Package-manager mismatch
- Missing dependencies
- TypeScript compilation errors
- Angular build failures
- Electron entry-point problems
- Blank Electron window
- Asset loading errors
- Monaco failing in production
- Packaging configuration errors
- Missing icon resources
- Windows permission errors
- Installer signing warnings
- Filesystem access errors

Include concrete diagnostic commands and corrective steps consistent with the actual repository.

---

# 6. ADD A DESKTOP BUILD DOCUMENTATION PAGE IN THE APP

Inside CodeShip Documentation, add:

**Developer Guide → Desktop Development → Build Windows EXE**

The page must contain the complete verified process.

Provide navigation through related topics:

- Development setup
- Run CodeShip locally
- Build production application
- Generate Windows EXE
- Install CodeShip
- Troubleshooting
- Release checklist

Use properly formatted commands with copy buttons.

Include an explanation of the expected build output.

Avoid vague instructions such as "just run the Electron build."

---

# 7. FIRST-TIME USER EXPERIENCE

Connect the Documentation Center to the application's interactive onboarding.

When users first open CodeShip, offer:

- Create project
- Start with template
- Take guided tour
- Open documentation
- Watch or view visual walkthroughs bundled locally

The onboarding should introduce full-screen canvas mode and full-screen preview.

Provide a guided sequence:

1. Create a project.
2. Add a container.
3. Drag in a component.
4. Resize it visually.
5. Adjust spacing.
6. Add a navbar.
7. Apply modern styling.
8. Preview in full screen.
9. Check mobile responsiveness.
10. Save locally.
11. Export one component.
12. Open the export integration guide.

Allow skipping, resuming, and restarting the tutorial.

Persist tutorial progress locally.

---

# 8. DOCUMENTATION IMPLEMENTATION ARCHITECTURE

Build the documentation system as an independently maintainable feature module.

Use structured content files, such as Markdown with metadata or another appropriate offline-compatible format.

Do not hardcode thousands of lines of article content directly into Angular component templates.

Use:

- Reusable documentation layout components
- Content registry
- Navigation configuration
- Local full-text search index
- Article renderer
- Syntax highlighting
- Code-copy controls
- Heading anchor generation
- Table-of-contents extraction
- Breadcrumb generation

Keep the documentation content under source control.

Support documentation versioning.

Ensure content can be updated without rewriting the entire documentation UI.

Sanitize rendered content appropriately.

Do not introduce remote services for search or article rendering.

---

# 9. FULL-SCREEN ACCEPTANCE CRITERIA

A full-screen feature is complete only when:

- Application full screen works.
- Canvas focus mode works.
- Preview full screen works.
- Code editor full screen works.
- Documentation full screen works.
- All modes provide an obvious exit control.
- Keyboard interactions are handled correctly.
- Previous workspace state is restored.
- Canvas dimensions and zoom remain consistent.
- No unexpected clipping or overlay issues occur.
- Electron window resizing remains stable.
- Relevant behavior is tested.

---

# 10. DOCUMENTATION ACCEPTANCE CRITERIA

The documentation is complete only when:

- It looks and behaves like a professional developer documentation product.
- Navigation is properly organized.
- Search works offline.
- Articles have meaningful headings and structure.
- Code blocks are readable and copyable.
- Documentation content is technically accurate.
- Guides match actual implemented functionality.
- Full-screen reading mode works.
- Responsive layouts work when the Electron window is resized.
- Getting Started guides are complete.
- Visual design workflows are documented.
- Export integration workflows are documented.
- The Windows EXE build guide is complete.
- No broken internal documentation links remain.

Do not fill articles with repetitive placeholder text to create the appearance of completeness.

---

# 11. DESKTOP BUILD ACCEPTANCE CRITERIA

The Windows desktop build is complete only when:

- Development scripts work.
- Production Angular build succeeds.
- Electron production packaging is configured.
- Windows EXE generation succeeds in a supported environment.
- Required assets are bundled locally.
- The packaged app starts without a development server.
- Local project storage works after installation.
- Documentation works offline.
- Supported full-screen modes work.
- Uninstall does not automatically delete user projects.
- Build instructions match the repository.
- Actual verification results are documented.

Do not mark a feature as production-ready without successful relevant checks.

---

# 12. PRESERVE ALL EXISTING CODESHIP FEATURES

Do not lose:

- Drag-and-drop editing
- Direct element resizing
- Padding and margin adjustment
- HTML builder
- CSS Studio
- Responsive Lab
- Animation Studio
- Modern component library
- Multiple navbar variants
- Glassmorphism styles
- Screen templates
- Icon Factory
- Selective code export
- Angular exporter
- Next.js exporter
- HTML/CSS exporter
- Local project persistence
- Undo/redo
- Import functionality
- Existing keyboard shortcuts
- Current working application settings

Run regression tests after relevant changes.

Before refactoring any shared component, inspect all usages.

Do not delete existing working components simply to make the redesign easier.

---

# 13. IMPLEMENTATION ORDER

Execute in this order:

### Phase 1 — Repository audit
Read `PROJECT_SPEC.md`, inspect the current implementation, and identify existing full-screen, documentation, and packaging functionality.

### Phase 2 — Full-screen system
Implement native application full screen, canvas focus mode, full-screen preview, full-screen code editing, and full-screen documentation.

### Phase 3 — Documentation redesign
Build the professional documentation shell, navigation, search, table of contents, article renderer, code blocks, and reading modes.

### Phase 4 — Documentation content
Create complete, useful documentation covering CodeShip's major features and real usage workflows.

### Phase 5 — Windows desktop packaging
Configure the Electron production build, required assets, Windows installer, and build scripts.

### Phase 6 — Build and installation guides
Document exact steps for setting up, developing, building, packaging, testing, and installing CodeShip.

### Phase 7 — Testing and polish
Run UI, functional, accessibility, integration, Electron, and documentation tests.

Fix identified issues.

Maintain progress in:

- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/FEATURE_MATRIX.md`
- `docs/DESKTOP_BUILD_GUIDE.md`
- `docs/DOCUMENTATION_ARCHITECTURE.md`
- `docs/FULLSCREEN_BEHAVIOR.md`
- `docs/RELEASE_CHECKLIST.md`

---

# 14. EXECUTION INSTRUCTIONS

Work directly in the existing CodeShip repository.

Do not ask for approval for ordinary implementation decisions.

Do not stop after writing a plan.

Do not replace functioning features with placeholders.

Do not claim successful testing without running tests.

After each milestone:

1. Implement working code.
2. Run applicable tests.
3. Fix defects.
4. Verify existing functionality.
5. Inspect the UI visually where tooling allows.
6. Update progress documentation.
7. Continue to the next milestone.

If Windows-specific packaging cannot be executed in the available environment, complete the build configuration, document the limitation, and provide exact validation commands for Windows.

Do not invent `.exe` output files.

## FINAL DIRECTIVE

Transform CodeShip into a polished offline desktop application with:

- Native application full screen
- Full-screen visual canvas
- True full-screen UI preview
- Full-screen Monaco code editor
- Professional full-screen documentation
- Official-quality developer documentation design
- Comprehensive documentation for all major features
- Offline searchable documentation
- Complete beginner tutorials
- Detailed Angular, Next.js, and HTML integration guides
- Complete Windows desktop `.exe` development and build process
- Actual Electron production packaging infrastructure
- Professional Windows installer
- No regression in existing functionality

**The Documentation Center must look and feel like a real professional developer documentation website—not a basic text page.**

**The full-screen experience must genuinely maximize available workspace and correctly restore application state.**

**The Windows desktop build instructions must correspond to real, working project configuration and scripts.**

Preserve the offline-only architecture:

**No Supabase. No login. No database. No cloud requirement. No automatic deletion of projects.**

Start immediately by inspecting `PROJECT_SPEC.md` and the repository, then implement the full-screen system, documentation redesign, and Windows packaging functionality.

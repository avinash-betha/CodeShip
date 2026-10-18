# CODESHIP — COMPLETE DOCUMENTATION CONTENT OVERHAUL

Act as a Senior Technical Documentation Engineer, Angular/Electron Developer, and Developer Experience Architect.

**Task:** Completely improve the existing CodeShip Documentation Center's content. The layout already exists; preserve its working navigation, search, themes, full-screen mode, bookmarks, and other functionality.

The attached screenshots show the problem: articles contain generic instructions, short descriptions, and weak examples that do not actually teach users how to use CodeShip.

**Do not redesign the entire application. Focus on documentation quality and accuracy.**

## 1. Documentation quality standard

Every feature should have detailed, practical documentation comparable in clarity and instructional depth to official Angular or TypeScript documentation.

Every article must answer:

1. What is this feature?
2. Why and when should someone use it?
3. Where exactly is it located in CodeShip?
4. How do they use it, step by step?
5. What does each important option or control do?
6. What happens when they change a setting?
7. How does it affect the canvas, CSS, or generated code?
8. How do they save and export the result?
9. How do they integrate the exported result into an existing project?
10. What common problems might occur, and how can they fix them?

Use actual UI labels, paths, controls, and working behavior from the repository. Do not invent functionality.

## 2. Required documentation structure

Organize user-facing documentation into:

**Getting Started**
- What is CodeShip?
- Installation
- Creating a project
- Understanding the editor
- Building your first UI
- Saving and reopening projects
- Previewing and exporting your design

**Visual Designer**
- Drag and drop
- Element selection
- Moving and resizing
- Parent/child nesting
- Freeform positioning
- Flexbox and Grid layouts
- Margin, padding, and gap
- Alignment and snapping
- Layers
- Keyboard shortcuts
- Undo/redo
- Full-screen editing

**HTML and CSS Studio**
- HTML elements and attributes
- IDs and classes
- Forms and inputs
- Typography
- Colors and backgrounds
- Borders and shadows
- Flexbox and Grid
- Custom CSS declarations
- CSS variables
- Pseudo-selectors
- Media and container queries
- Transitions and animations
- Save, Apply, Reset, and Undo behavior

**Design Library**
- Component categories
- Buttons and forms
- Navigation bar variants
- Sidebars and cards
- Glassmorphism
- Modern style presets
- Complete screen templates
- Creating reusable blocks
- Customizing and exporting components

**Icon Factory**
- Finding icons
- Adding icons to buttons
- Placing icons on the canvas
- Editing SVGs
- Customizing size, color, and stroke
- Saving and exporting icons

**Responsive Lab**
- Desktop, tablet, and mobile previews
- Viewport dimensions versus zoom
- Detecting overflow
- Responsive recommendations
- Applying or rejecting suggestions
- Custom media queries
- Validating responsive output

**Code Export**
- Selected element export
- Component export
- Screen export
- Full-project export
- HTML/CSS/JS
- Angular standalone components
- Next.js components
- Understanding generated files
- Copying code into existing applications
- Asset and CSS dependencies
- Troubleshooting integration issues

**Projects and Desktop**
- Local storage locations
- Save/Save As/autosave
- Backups and recovery
- Import/export project files
- Offline operation
- Application settings

**Developer Guide — Internal**
- CodeShip architecture
- Angular/Electron development setup
- Running the application locally
- Building a Windows EXE
- Packaging and installation
- Testing
- Release checklist
- Build troubleshooting

Keep internal development/release content separate from everyday end-user guides.

## 3. Article writing standard

Each feature article must follow a meaningful structure:

- **Overview:** Clear explanation with a real-world use case.
- **Before you begin:** Prerequisites and required project state.
- **Where to find it:** Exact CodeShip navigation and UI labels.
- **Step-by-step tutorial:** Numbered actions a beginner can follow.
- **Understanding the options:** Explain important fields, controls, and values.
- **Practical example:** Build something real using the feature.
- **Generated code:** Show accurate HTML/CSS/Angular/Next.js examples where relevant.
- **Expected result:** Describe what the user should see.
- **Troubleshooting:** Explain likely issues and fixes.
- **Related articles:** Link to relevant next steps.

Adapt the structure to the topic; do not add meaningless sections or repeat boilerplate.

Write enough detail to make each article independently useful. Avoid artificial word counts.

## 4. Example of the required improvement

Current weak documentation:

"Button → choose variant → edit label"

Replace it with practical guidance such as:

**Create and customize a button**

1. Open a project in CodeShip's Visual Studio.
2. Open the Components panel.
3. Find the Buttons category.
4. Drag a button onto the canvas or into an existing container.
5. Select the button to open its properties.
6. Change the label using the relevant text or content control.
7. Choose a visual variant such as Primary, Outline, or Glass.
8. Adjust padding, width, border radius, font, and colors.
9. Open Icon Factory and insert an icon before or after the label.
10. Switch to mobile preview and verify the button fits.
11. Save the project.
12. Select the button and export it using the preferred framework and component export mode.

Explain the available properties, expected appearance, underlying CSS, and any limitations.

**Verify the actual labels and interaction flow in the source code before writing these instructions.**

## 5. Code examples must be real

Do not use generic pseudo-examples like:

"Button → edit → export"

Use correctly formatted, meaningful HTML, CSS, Angular, TypeScript, and TSX snippets where applicable.

Include explanatory text about:

- What each snippet does.
- Which files are generated.
- Where to place the generated files.
- How to import components.
- Which dependencies are required.
- How to use the exported components.
- What the user needs to configure.

For Angular, demonstrate actual standalone component integration.

For Next.js, demonstrate actual component importing and App Router usage.

For HTML, explain markup, stylesheet links, assets, and JavaScript.

Match examples to CodeShip's real exporter behavior and supported framework versions.

## 6. Interactive, useful documentation

Preserve the professional documentation interface and improve its content presentation.

Use:

- Correct article hierarchy
- Descriptive headings
- Practical numbered steps
- Meaningful code samples
- Screenshots or illustrations where available
- Helpful notes and warnings
- Working internal links
- Copyable code
- Links to related CodeShip features
- Real troubleshooting instructions

Keep the existing "Try in Editor" action, but ensure it opens the relevant editor workflow without losing the user's current project.

Do not automatically overwrite the user's design.

## 7. Remove generic filler

Audit all existing documentation articles.

Remove or replace generic statements such as:

- "Adapt identifiers, values and paths to your project."
- "Try it in the editor."
- "Use the component library."
- "Connect application services after exporting."

These statements can remain only when accompanied by specific, actionable explanations.

Do not copy the same Example, Things to Know, and Try It sections into every article with slightly different wording.

Each article must teach its specific feature.

Do not invent screenshots, generated output, settings, or functionality.

Where a feature is incomplete, document its actual supported behavior and limitations accurately.

## 8. Internal Developer Guide

The Developer Guide is primarily for maintaining and releasing CodeShip, not for explaining how end users should design interfaces.

Write accurate internal documentation covering:

- Repository structure
- Module responsibilities
- Universal document model
- Electron main/preload/renderer boundaries
- Local project persistence
- Canvas architecture
- CSS processing
- Export architecture
- Adding components and templates
- Testing and debugging
- Building the Angular application
- Running Electron locally
- Building Windows EXE installers
- Packaged-app verification
- Troubleshooting
- Release checklist

Use commands and file paths verified against the actual repository.

Do not invent successful builds or nonexistent commands.

## 9. Acceptance criteria

Documentation is complete when:

- All existing documentation topics have useful, accurate content.
- A beginner can follow core tutorials without asking for missing steps.
- Actual UI control names are used.
- Examples are relevant and technically correct.
- Angular, Next.js, and HTML integration guides are actionable.
- Internal developer guides match real build scripts.
- Documentation navigation and search still work.
- Code blocks and internal links work.
- Duplicate boilerplate is removed.
- Existing documentation functionality is preserved.
- No article misrepresents unfinished features as complete.

## 10. Low-credit execution strategy

1. Inspect the existing documentation content registry and article structure.
2. Identify all existing article IDs and navigation links.
3. Inspect only the relevant feature implementations needed to verify actual workflows.
4. Preserve existing documentation infrastructure and article IDs.
5. Replace shallow content with detailed, feature-specific Markdown or the existing supported content format.
6. Reuse shared rendering components.
7. Work section by section, prioritizing Getting Started, Visual Designer, CSS Studio, and Code Export.
8. Validate links, article loading, code formatting, and search indexing.
9. Run targeted tests and a documentation build check.
10. Update `docs/DEVELOPMENT_PROGRESS.md` with finished articles and the next unfinished section.

Avoid lengthy architectural explanations, redundant repository scans, and unnecessary UI rewrites.

**Final instruction:** Focus on writing genuinely helpful CodeShip documentation, not generating more documentation UI. The reader must learn exactly how to operate the application, understand the settings, create real designs, export code, and integrate the result.

Start by auditing the current documentation content and replacing the shallow **Components** article shown in the screenshots with a complete practical guide. Then systematically improve the remaining articles.
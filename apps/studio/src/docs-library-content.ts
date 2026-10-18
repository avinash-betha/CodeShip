import { type DocArticle, section as s } from "./docs-model";

export const libraryArticles: DocArticle[] = [
  {
    id: "components",
    title: "Components",
    category: "Design Library",
    action: "components",
    intro:
      "Build a real interface from editable buttons, forms, navigation, cards and data patterns. A library component inserts ordinary elements, styles and supported interactions into your project; you can change every part and export it independently.",
    related: ["icons", "styles", "selective-export", "forms-accessibility"],
    sections: [
      s("library", "Find the right starting point", [
        "Open a project, reveal the left library with Toggle library panel, and choose Insert. Scroll past ELEMENTS to COMPONENTS. Search library filters names and descriptions; Component category narrows the component list independently of the primitive category buttons above it. Choose All if a search seems empty.",
        "Buttons includes Primary, Secondary, Outline, Ghost, Text, Icon, Floating, Pill, Gradient, Glass, Split, Dropdown, Loading, Destructive, Toggle and Group button entries. Navigation, forms, cards, layouts, data and feedback patterns have their own categories. Use the eye button beside an entry to preview it at mobile or desktop width before inserting.",
        "A component adds a subtree to a compatible selected container or ancestor. A screen template is a different operation: loading it replaces the active page. Start this tutorial on a blank page or in a container with room for an action button.",
      ]),
      s("steps", "Create a button with an icon", [], {
        steps: [
          "In Insert, add a Container. Keep it selected so the button will be nested inside it.",
          "Under COMPONENTS set Component category to Buttons. Click Insert Primary button, or drag Primary button into the container using the drop indicator.",
          "The inserted button contains an SVG and a text span. Open Layers, select the button's indented text span, then change Element text in Design to Create project. Selecting the button itself edits the whole control rather than just the span.",
          "Select the parent button using Layers or the canvas breadcrumb. In Design set padding to 12px 20px, border-radius to 12px and min-height to 44px. Leave width content-driven for a compact button; use width:100% when it should fill its container.",
          "To use a different starting variant, insert Outline button or Glass button. There is no universal button-variant selector after insertion. Style presets can restyle the selected button, and Custom CSS property/value can refine individual declarations.",
          "Primary button already has an arrow SVG. To replace it, select just that SVG in Layers and Delete it, then reselect the button parent. Open Icon Factory, choose an icon, set Icon size to 20, choose Before text under Button icon layout and Insert into canvas. Close the factory with Close dialog. The text remains; select the parent again in Layers for button styling. Insertion adds an icon rather than replacing an existing one.",
          "Set the canvas viewport to Mobile and check that the label and icon fit. Use Preview to activate controls rather than selecting them. In Your workspace choose Save now and wait for All changes saved.",
        ],
      }),
      s(
        "example",
        "Understand the resulting HTML and CSS",
        [
          "The example shows the structure and declarations for this action. CodeShip also writes data-cs-id attributes and selection-specific selectors; inspect the actual HTML and CSS tabs for your generated identifiers. The inline-flex layout keeps icon and label aligned, and gap separates them without spaces inside the text.",
        ],
        {
          code: {
            language: "html",
            text: `<button type="button" class="create-project">
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
  <span>Create project</span>
</button>
<style>
  .create-project {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; min-height: 44px; padding: 12px 20px;
    border: 0; border-radius: 12px; background: #263c2b; color: #fff;
  }
  .create-project:focus-visible { outline: 3px solid #6d954d; outline-offset: 3px; }
</style>`,
            caption:
              "A complete static action button. Add application behavior in the destination app; changing its label does not create a project service.",
          },
        },
      ),
      s("forms", "Customize forms, cards and sidebars", [
        "Search Contact form to insert a labeled form. Select the outer form to change its layout and spacing; select an individual label or input to edit its words or attributes. In HTML, set a field's id, name, type and required attribute, and connect a separate label using for. Keep labels above fields on narrow layouts. The form guide gives a complete field example.",
        "For cards and sidebars, select the surface rather than an inner heading before changing background, radius or shadow. Use Flex or Grid for relationships between regions. A data table may need its own horizontal scroll region on mobile; making every column narrower can make the information unreadable.",
        "Library examples can include local filtering, sorting, pagination, dialogs, tabs or kanban behavior. These are stored interactions and sample content. A sign-in, billing or chat example does not contact a backend. Replace the demonstration submit handler or sample state with your own application logic after export.",
      ]),
      s("blocks", "Save a reusable project block", [], {
        steps: [
          "Select the outer container that includes all required labels, controls and decoration. A selected inner text span saves only that span.",
          "At the bottom of the inspector open Save as reusable block, enter Reusable block name and choose Save to blocks.",
          "In Insert, open SAVED BLOCKS and click the saved name to insert a copy. Each insertion receives independent element IDs and the required styles.",
          "Edit the copy to check its boundaries. Existing copies do not automatically update when another instance is changed. Save the project to retain its block library.",
        ],
      }),
      s(
        "export",
        "Export the selected component",
        [
          "Select the complete button or component root. Open Export code, choose Selected elements and Reusable component, and enter a Component name such as CreateProject. Choose HTML / CSS, Angular or Next.js. Review the generated files and any missing-target or ancestor-selector warnings, then copy files or download the ZIP. Native Export to folder writes a separate output directory.",
          "An Angular reusable export includes create-project.component.ts, .html and .css; import CreateProjectComponent into the consuming standalone component. Next.js includes CreateProject.tsx and CreateProject.module.css; import it in an App Router page. HTML includes index.html and styles.css, plus script.js when interactions exist. Keep assets and referenced paths together. The framework guides provide exact integration examples.",
        ],
        {
          links: [
            { id: "angular", label: "Install an Angular standalone component" },
            { id: "nextjs", label: "Use a component in Next.js" },
            { id: "html", label: "Embed HTML and CSS" },
          ],
        },
      ),
      s("notes", "Fix common component problems", [
        "Wrong insertion location: Undo once, select the intended parent in Layers and insert again, or drag the existing component using a valid drop indicator. Buttons and input elements cannot contain arbitrary block children.",
        "Label did not change: select the inner text span rather than replacing the outer button's content. Inspect Layers when a nested SVG or surface intercepts selection.",
        "Style appears unchanged: check Responsive style context and CSS interactive state, then inspect competing template or !important declarations in CSS. A hover declaration is visible during that state, and a mobile declaration only matches its query.",
        "Behavior is missing in an export: include the element targeted by the interaction in the selected subtree and retain generated JavaScript or the framework lifecycle code. If the target lives elsewhere on the page, export the common container or screen instead.",
      ]),
    ],
  },
  {
    id: "navigation",
    title: "Navigation bars and sidebars",
    category: "Design Library",
    action: "components",
    intro:
      "Choose a navigation pattern for your page hierarchy, then edit its links, mobile layout and active state. Navigation entries are editable HTML with local demonstration behavior where provided.",
    related: ["components", "responsive", "html-elements", "selective-export"],
    sections: [
      s("choose", "Choose a pattern before editing", [
        "In Insert, use COMPONENTS and Component category to locate navigation entries, or search navigation. Preview a candidate using its eye button at 375px and 1200px. Classic navigation is a simple starting point; sidebar, glass and other entries provide different structures. A visual variant does not automatically configure an Angular or Next.js router.",
      ]),
      s("steps", "Build a working set of links", [], {
        steps: [
          "Select the container where the navigation belongs and insert Classic navigation.",
          "Use Layers to select the brand and each link. Change text in Design and set href in HTML using the existing attribute editor, or New attribute name/value and Add attribute.",
          "Use real destinations such as /projects or #contact; create a matching HTML ID for a same-page anchor. Keep link text descriptive.",
          "Select the navigation surface to set padding, background and border. Set its link container to Flex with wrapping or choose a vertical arrangement for a sidebar.",
          "Switch to Mobile and Preview. Check every link and any bundled menu toggle. If an interaction targets a menu container, keep that target when saving a reusable block or exporting.",
        ],
      }),
      s("example", "Wrap links without a JavaScript menu", [], {
        code: {
          language: "css",
          text: `.site-nav { display: flex; align-items: center; gap: 24px; padding: 16px 24px; }
.site-nav-links { display: flex; flex-wrap: wrap; gap: 16px; }
@media (max-width: 600px) {
  .site-nav { flex-direction: column; align-items: flex-start; }
}`,
          caption:
            "Add site-nav and site-nav-links through CSS classes on the corresponding containers. This approach keeps every link visible at small widths.",
        },
      }),
      s("sidebar", "Pair a sidebar with flexible content", [
        "For a desktop dashboard use a parent Grid with 240px minmax(0,1fr). Put the sidebar in the first track and main content in the second. At a mobile breakpoint use one column and a wrapping or stacked navigation area. Reset fixed heights and widths on the sidebar when stacking. Do not hide the only navigation without providing an accessible replacement.",
      ]),
      s("notes", "Save, integrate and diagnose navigation", [
        "Save the outer navigation as a reusable block or export it with Selected elements. Copy its stylesheet and any generated behavior along with markup. In Angular, use your router bindings and imports for client routing; in Next.js, replace destination links with the application's routing conventions when appropriate. Plain anchors continue to perform normal document navigation.",
        "If a menu does not open, test in Preview, inspect its interaction target in HTML and include that target in the export. If links overlap, remove nowrap/fixed-width constraints or enable wrapping; lowering canvas zoom does not change the available CSS width.",
      ]),
    ],
  },
  {
    id: "styles",
    title: "Modern style presets",
    category: "Design Library",
    action: "design",
    intro:
      "Apply a coherent set of surface declarations to the selected element, then refine the CSS. Presets are useful for exploring a direction without replacing your content or component structure.",
    related: ["glass", "css-studio", "modern-workflows", "components"],
    sections: [
      s("where", "Select the surface you intend to restyle", [
        "Select a card, button or navigation root, then open Design in the right inspector and expand Style presets. Multi-selection applies the declarations to each selected element. Choose the surface through Layers when an inner icon or text node is selected.",
        "The sixteen choices are Minimalistic, Glassmorphism, Soft UI, Neumorphism, Dark modern, Light modern, Gradient, Elevated surfaces, Flat, Outline, Material-inspired, Enterprise, Luxury minimal, Futuristic, Bento grid and High-contrast. These write background, color, radius, shadow and border values; some also set theme variables. A preset name is a visual starting point, not a complete accessibility or layout guarantee.",
      ]),
      s("steps", "Restyle a settings card", [], {
        steps: [
          "Insert a card component and select its outer surface in Layers.",
          "Choose Apply Enterprise style. Inspect the resulting surface, border and radius before changing nested controls.",
          "Adjust spacing, typography and dimensions in Design. Use CSS interactive state and Responsive style context deliberately for subsequent scoped edits.",
          "For Glassmorphism use the dedicated Glassmorphism Studio controls and Apply glass effect. Review its opaque fallbacks and text contrast.",
          "Use Undo to revert the preset as a transaction if it does not suit the component. Save the card as a reusable block when the result is useful elsewhere.",
        ],
      }),
      s("example", "Refine a preset with explicit CSS", [], {
        code: {
          language: "css",
          text: `.settings-card {
  background: #fff; color: #1d3045; border: 1px solid #dce2e9;
  border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px #1224390a;
}
.settings-card h2 { margin: 0 0 16px; font-size: 1.25rem; }`,
          caption:
            "Assign settings-card to the surface in HTML. Add the heading rule in CSS source when the nested heading needs separate styling.",
        },
      }),
      s("notes", "Understand scope, reset and export", [
        "Presets write CSS rather than rasterizing the result. The chosen node and descendants remain editable, and exported files include the declarations. Ordinary presets use the selected style scope; Glassmorphism also writes fallback support/preference rules. Inspect CSS if combining several presets or state-specific overrides.",
        "Resetting an individual property removes that scoped declaration and exposes any inherited or template value. Undo reverses the operation; Reset draft only clears the custom-property entry fields. If text becomes hard to read, set text and control colors explicitly and check both normal and focus states against the actual background.",
      ]),
    ],
  },
  {
    id: "glass",
    title: "Glassmorphism",
    category: "Design Library",
    action: "design",
    intro:
      "Create a translucent card or navigation surface with a tinted background, backdrop blur and a visible edge. Use glass over a detailed background where the separation is useful, and keep text readable when blur is unavailable.",
    related: ["styles", "accessibility", "css-studio", "modern-workflows"],
    sections: [
      s("where", "Prepare a background and select a surface", [
        "Insert a card over a parent with an image, gradient or contrasting shapes. Select the card's outer container, open Design and expand Glassmorphism Studio. Blurring an empty flat background can look unchanged because there is no detail behind the card to blur.",
      ]),
      s("steps", "Tune the glass effect", [], {
        steps: [
          "Choose Glass color variant Light or Dark to establish the initial tint. Set Glass tint to the desired color.",
          "Set Glass opacity to about 85 for a readable first pass, Glass blur to 18 and Glass saturation to 120. Opacity controls the surface paint; it does not fade all child text.",
          "Set Glass border opacity to 20, Glass radius to 20 and Glass shadow to a moderate value. Check the edge over both light and dark background regions.",
          "Choose Apply glass effect to write the current controls to the selected surface. Changing a control prepares the effect; applying commits it.",
          "Inspect Mobile and Preview, check focus visibility inside the card, and save the project. Export the entire card so its surface and contents stay together.",
        ],
      }),
      s("controls", "What the controls change", [
        "Opacity ranges from 10 to 100, blur from 0 to 80px, saturation from 0 to 250%, border opacity from 0 to 100, radius from 0 to 80px and shadow from 0 to 70. Gradient surface switches the tint background to a gradient. Larger blur and shadow increase rendering work; use restrained values for large or repeated surfaces.",
        "The effect writes background, border, shadow, backdrop-filter and its WebKit form. It also writes opaque fallbacks for unsupported backdrop filters and reduced transparency preference, and disables transitions for reduced motion. Inspect those rules in CSS before overriding them manually.",
      ]),
      s("example", "Read the glass declarations", [], {
        code: {
          language: "css",
          text: `.glass-card {
  color: #eff8f2; background: rgb(23 45 37 / .85);
  border: 1px solid rgb(255 255 255 / .2); border-radius: 20px;
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
}
@supports not (backdrop-filter: blur(1px)) {
  .glass-card { background: #1c302a; }
}
@media (prefers-reduced-transparency: reduce) {
  .glass-card { background: #1c302a; backdrop-filter: none; }
}`,
          caption:
            "Illustrative dark card values. CodeShip targets the selected element's generated selector and includes its own computed shadow and fallback declarations.",
        },
      }),
      s("notes", "Diagnose weak blur or poor contrast", [
        "No blur: verify that detailed content is behind the card and that its background is translucent. Browser rendering and ancestor compositing can affect backdrop filters. Use the opaque fallback as a usable design in its own right.",
        "Faint text: increase tint opacity or set an explicit foreground color. Increasing blur alone does not establish contrast. A CSS export retains the glass rules; the destination must supply the background image or assets for the same visual result. Do not replace the surface with a screenshot if it needs to remain interactive.",
      ]),
    ],
  },
  {
    id: "templates",
    title: "Complete screen templates",
    category: "Design Library",
    action: "templates",
    intro:
      "Start with a complete editable screen when you need an established layout and realistic content structure. Loading a screen replaces the active page, so choose the destination page before applying it.",
    related: [
      "creating-projects",
      "responsive",
      "modern-workflows",
      "projects",
    ],
    sections: [
      s("where", "Preview a screen safely", [
        "In the left Insert library, scroll to SCREEN TEMPLATES. Use Screen category and Search library to narrow the list. The eye button opens an isolated preview at mobile or desktop width; previewing does not change the current design. There are forty bundled screens including authentication, landing pages and application layouts.",
      ]),
      s("steps", "Use a Settings screen as a starting point", [], {
        steps: [
          "Save your project and add a page with the plus beside the page selector if you want to preserve the current page.",
          "Search Settings in Insert. Use Preview Settings screen to inspect the structure, then close the preview if you only want to browse.",
          "On the intended destination page choose Load Settings template. This replaces that page's root and styles in an undoable edit.",
          "Use Layers to select headings, labels and input controls. Change visible text separately from input values and HTML attributes.",
          "Select the form's field containers to change row gaps and label spacing. Test at 375px and a custom width between tablet and desktop.",
          "Save now, then export Current screen for an independent page or Entire project to keep all your pages.",
        ],
      }),
      s("example", "Recognize a mobile-friendly settings layout", [], {
        code: {
          language: "css",
          text: `.settings-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); }
.settings-content { min-width: 0; padding: 32px; }
.settings-field { display: grid; gap: 8px; margin-bottom: 20px; }
@media (max-width: 768px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-content { padding: 20px; }
}`,
          caption:
            "Use the template's actual classes from CSS source when editing it. Flexible tracks and stacked labels avoid the narrow-screen clipping shown in fixed desktop layouts.",
        },
      }),
      s("notes", "Retain useful structure and replace sample behavior", [
        "A loaded screen is editable elements and CSS, not a locked image. Save a useful region as a reusable block rather than repeatedly loading a whole screen. Undo can restore the previous page in the current session; use a project backup for recovery across sessions.",
        "Dashboard numbers, login confirmations and billing content are examples. In an exported application replace sample data with the application's state, wire submission to its endpoint and handle errors/loading accessibly. If mobile looks clipped, inspect remaining fixed widths and spans in your custom edits before changing the iframe zoom.",
      ]),
    ],
  },
  {
    id: "modern-workflows",
    title: "Modern UI recipes",
    category: "Design Library",
    action: "components",
    intro:
      "Combine existing library patterns into a responsive workspace: a wrapping navigation bar, flexible card grid, readable form and a clear primary action. Each recipe uses editable CSS rather than a fixed visual mockup.",
    related: ["glass", "css-grid", "forms-accessibility", "templates"],
    sections: [
      s("dashboard", "Build a sidebar and card workspace", [], {
        steps: [
          "Insert a Container for the workspace, add a navigation sidebar and another Container for the main region.",
          "Select the outer workspace, choose Grid in Container layout mode and set columns to 240px minmax(0,1fr). Set gap to 24px and the main region's min-width to 0.",
          "Insert cards into a nested grid in the main region. Give each a heading, paragraph and action; apply Enterprise or Light modern to selected card surfaces.",
          "In CSS add a mobile rule that uses one workspace column and resets card spans. Preview at 375, 768 and a custom 900px width before saving.",
        ],
      }),
      s("bento", "Use responsive bento tracks", [], {
        code: {
          language: "css",
          text: `.workspace { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.cards > :first-child { grid-column: span 2; }
@media (max-width: 900px) {
  .workspace, .cards { grid-template-columns: 1fr; }
  .cards > :first-child { grid-column: auto; }
}`,
          caption:
            "Assign workspace and cards in HTML > CSS classes. The span reset prevents an implicit second track after the grid collapses.",
        },
      }),
      s("glass-nav", "Add a frosted header", [
        "Insert navigation above the workspace. Select its surface and use Glassmorphism Studio; place it over a visible gradient and keep tint opacity high enough for the links. Wrap its link container on small widths, and test keyboard focus in Preview. Background blur is decoration, so navigation must remain legible with the opaque fallback.",
      ]),
      s("button", "Finish the primary action", [
        "Insert Gradient button or Primary button from Buttons. Select its text span to change the label, then select the parent button to adjust radius and padding. Use Icon Factory with a 20px icon and Before text. In Motion use a short transition for box-shadow or transform, and retain a visible focus outline. Avoid fixed button heights if translated or longer text needs to wrap.",
      ]),
      s("ship", "Save a reusable region and ship it", [
        "Save the main card region with Save as reusable block for later pages. Use Selected elements and Reusable component to extract it into your application, or export the complete screen to keep the sidebar/header relationship. Include dependent interaction targets and local images. If the isolated component loses layout, move parent-dependent spacing onto its own root or export the containing workspace.",
      ]),
    ],
  },
];

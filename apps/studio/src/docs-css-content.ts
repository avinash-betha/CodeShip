import { type DocArticle, section as s } from "./docs-model";

export const cssArticles: DocArticle[] = [
  {
    id: "css-studio",
    title: "CSS Studio: properties, source and resets",
    category: "HTML and CSS Studio",
    action: "design",
    intro:
      "Use the Design inspector for selected-element styling and the CSS source workspace for selectors and complete rules. Both update the same page stylesheet, but source drafts require an explicit Apply changes before they affect the document.",
    related: ["advanced-css", "spacing", "styles", "html-elements"],
    sections: [
      s("where", "Choose the right editing surface", [
        "Select an element and open Design in the right inspector. Layout controls display, direction, alignment and positioning; Size controls width, height and constraints; Spacing controls margin and padding; Gap is in Layout; Typography controls font, size, weight, line height and text alignment; Appearance controls colors, backgrounds, border, radius, shadow and related decoration. Enter CSS units such as 24px, 100% or 1.5rem where the field accepts text.",
        "Inspector edits commit immediately to the project and participate in autosave/history. The bottom CSS tab is the active page's stylesheet, including library rules and your overrides. Expand code workspace or Maximize code workspace if needed. Its HTML/CSS editors hold a draft until Apply changes; Format source changes formatting, not the document by itself.",
      ]),
      s("steps", "Style a readable settings panel", [], {
        steps: [
          "Select a Container and add settings-panel to HTML > CSS classes. Keep the element selected and switch back to Design.",
          "Set padding to 24px, border-radius to 16px and background to #fff. Set color to #243128, font-family to system-ui, sans-serif and line-height to 1.6 using the available controls or custom declarations.",
          "Under Custom CSS property enter box-shadow and under Custom CSS value enter 0 8px 28px #24312814. Choose Apply declaration. Property suggestions assist entry but safe custom properties are supported too.",
          "Open CSS source to inspect the generated selector and declarations. Add the class rule below for shared styling only if you want it to apply to every settings-panel instance. Choose Apply changes.",
          "Select a different node and return to confirm the values persist. Save now after application, then export the containing panel to include its relevant CSS.",
        ],
      }),
      s("example", "Coordinate typography and surface styling", [], {
        code: {
          language: "css",
          text: `.settings-panel {
  padding: 24px; background: #fff; color: #243128;
  border: 1px solid #d7dfd6; border-radius: 16px;
  font: 400 16px/1.6 system-ui, sans-serif;
  box-shadow: 0 8px 28px #24312814;
}
.settings-panel h2 { font-size: 1.5rem; line-height: 1.25; margin: 0 0 20px; }`,
          caption:
            "This class-based rule can be reused across panels. Inspector edits use the selected node's data-cs-id selector and may override the class rule.",
        },
      }),
      s("contexts", "Control state and responsive scope", [
        "CSS interactive state selects Default, Hover, Focus, Focus visible, Active, Before or After. Responsive style context selects Base styles, ≤768px, ≤480px or a container query ≤600px. Choose both before editing: a hover color in the 480px context only applies when both conditions match. Before/After need content and appropriate display/positioning to render; container queries need a sized query container on an ancestor.",
        "Inspector values show declarations for the selected selector and context, not a full browser computed-style report. An empty field can still inherit a value or receive a library rule. Review CSS source when a value appears on the canvas but is absent in the inspector.",
      ]),
      s("resets", "Apply, Reset, Discard and Undo", [
        "Apply declaration commits one custom property/value. Reset draft clears only those two entry fields. Reset CSS property removes an applied declaration from the current selected scope. Reset layout/size/spacing/typography/appearance section removes that group's registered properties in the current scope; template rules and inheritance may then become visible.",
        "Apply changes validates and replaces the corresponding page source in one document edit. A rejected draft remains available for correction. Discard restores the applied source and drops the draft. Tab switching is blocked while that draft is dirty, so apply or discard first. Ctrl+Z on the canvas reverses document transactions; inside Monaco it edits the local source history until you apply.",
      ]),
      s("notes", "Diagnose a style that does not take effect", [
        "Check the selected node, query width and interactive state first. Then inspect specificity, rule order, inheritance, !important and layout context. For example, float does not place a flex item, gap needs a layout that supports it, and sticky positioning depends on scrolling ancestors.",
        "A browser-support warning does not necessarily mean a safe declaration is removed; unknown safe CSS is retained. Syntax errors or executable URLs are rejected. Source exports keep CSS rather than editor controls, so integrate the stylesheet and assets with your HTML/template. Export a containing region if a rule depends on an external ancestor.",
      ]),
    ],
  },
  {
    id: "html-elements",
    title: "HTML elements, IDs, classes and attributes",
    category: "HTML and CSS Studio",
    action: "html-inspector",
    intro:
      "Use semantic elements and explicit attributes to give your design structure and behavior. HTML properties edit the selected node; HTML source lets you review and apply a larger fragment while retaining the editable document model.",
    related: [
      "forms-accessibility",
      "css-studio",
      "import-assets",
      "accessibility",
    ],
    sections: [
      s("where", "Choose elements and inspect their HTML", [
        "In Insert, use ELEMENTS categories such as Semantic, Text and Forms to add a navigation, heading, paragraph or input. Select the node, then open HTML in the right inspector. HTML tag changes its element type; HTML ID is the public id attribute; CSS classes accepts space-separated class names; HTML text content edits that node's text.",
        "Element name labels the node in the editor. The internal data-cs-id identifies the editable node for styles and interactions and is different from HTML ID. Do not hand-edit internal identifiers casually in source. Use Layers to inspect parent/child structure before changing a container tag.",
      ]),
      s("steps", "Create an anchor destination", [], {
        steps: [
          "Add a Section and a Heading inside it. In Layers select the section, open HTML and set HTML ID to contact.",
          "Set CSS classes to contact-section. Select the heading and change HTML text content to Contact the team.",
          "Add a Link elsewhere. Set its text to Contact, then set href to #contact in the existing attribute field, or enter href and #contact in New attribute name/value and choose Add attribute.",
          "Switch to Preview and activate the link. It should target the contact section; use a real button for actions that do not navigate.",
          "Save the project and export the section together with its link if you need a self-contained example.",
        ],
      }),
      s("example", "Semantic markup that survives export", [], {
        code: {
          language: "html",
          text: `<nav aria-label="Page sections"><a href="#contact">Contact</a></nav>
<main>
  <section id="contact" class="contact-section" aria-labelledby="contact-title">
    <h1 id="contact-title">Contact the team</h1>
    <p>Send a question about your workspace.</p>
  </section>
</main>`,
          caption:
            "IDs connect anchors and accessible names. Keep IDs unique if you embed several exported components on one page.",
        },
      }),
      s("attributes", "Edit useful attributes safely", [
        "New attribute name/value and Add attribute can set href, title, alt, name, type, required, aria-label and data attributes. Boolean attributes such as required can use an empty value; remove the attribute to disable them. For an image, supply alt describing its purpose, or empty alt for a decorative image. Set explicit accessible text for an icon-only action.",
        "Input and img are void elements and cannot contain children. A button may contain an icon and phrasing content but should not contain another button. CodeShip validates nesting and sanitizes unsafe URLs, event-handler attributes and executable imports. Adding onclick does not create arbitrary JavaScript execution; use supported Interaction controls or implement application behavior after export.",
      ]),
      s("source", "Apply source and fix invalid markup", [
        "Open HTML in the bottom Source workspace to edit the active page. Apply changes imports the revised fragment into the model; review Diagnostics after application. The current draft does not appear in exports until applied. Keep a backup before a major replacement and use Undo to return to the prior document transaction.",
        "If a link does nothing, use Preview rather than Design and inspect its href. If styling disappears after a tag change, check selectors that target the previous tag. Exported Angular and Next.js files translate attributes to their target syntax; custom element behavior still requires its own implementation and registration in the destination app.",
      ]),
    ],
  },
  {
    id: "forms-accessibility",
    title: "Forms, labels and input spacing",
    category: "HTML and CSS Studio",
    action: "components",
    intro:
      "Build a settings or contact form with visible labels, useful native validation and predictable spacing. Use form components as editable starting points, then connect submission to your real application when integrating the export.",
    related: ["html-elements", "spacing", "icons", "angular"],
    sections: [
      s("begin", "Start with a labeled form", [
        "Open Insert, clear library filters and search Contact form under COMPONENTS. Insert it into a selected Container. Select the outer form to style its surface; select a field wrapper for label/control spacing; select the input for its attributes. This distinction prevents a card padding change from being mistaken for the label-to-input gap.",
      ]),
      s("steps", "Create an email preference field", [], {
        steps: [
          "In Layers locate the email label under the form and select it. Change its text to Contact email.",
          "Select the input and open HTML. Set id to contact-email, name to email and type to email using the existing attributes or Add attribute. Add required with an empty value if the field is mandatory.",
          "If the label is a separate element, set its for attribute to contact-email. A label that wraps the input already establishes a label relationship.",
          "Select the field wrapper. Use Grid with gap:8px. On the input set box-sizing:border-box, min-height:46px and width:100%; keep about 20 to 24px between groups.",
          "Set the submit button type to submit and ordinary auxiliary buttons to button. In Preview submit an empty field and then an invalid email to check native validation.",
          "Save and export the complete form so labels, validation attributes and local interaction targets remain together.",
        ],
      }),
      s("labels", "Markup for an accessible field", [], {
        code: {
          language: "html",
          text: `<form>
  <div class="preference-field">
    <label for="contact-email">Contact email</label>
    <input id="contact-email" name="email" type="email" required
      autocomplete="email" aria-describedby="email-help" />
    <small id="email-help">Use an address you check regularly.</small>
  </div>
  <button type="submit">Save preferences</button>
</form>`,
          caption:
            "The label names the input and the helper text provides additional context. A placeholder alone does not provide a persistent visible label.",
        },
      }),
      s("layout", "Stack fields on narrow screens", [], {
        code: {
          language: "css",
          text: `.preference-field { display: grid; gap: 8px; min-width: 0; margin-bottom: 24px; }
.preference-field input { box-sizing: border-box; width: 100%; min-height: 46px; }
.preference-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 640px) { .preference-columns { grid-template-columns: 1fr; } }`,
          caption:
            "Put preference-columns on the common field container when using two desktop columns. Keep each label and control together in one field wrapper.",
        },
      }),
      s("behavior", "Separate form validation from submission", [
        "Native email/required validation checks the control before submission. Bundled form interactions can demonstrate a confirmation locally; they do not save a preference on a remote server. In Angular replace the demonstration submit behavior with a form handler/service and map fields to your form model. In Next.js choose a client handler or server action, add error/loading state, and preserve the labels and validation attributes.",
        "If label and input collide, inspect the wrapper's display/gap and remove fixed heights. If adding a leading icon, select the input before opening Icon Factory; the factory wraps the field and reserves left padding. If validation seems absent, test in Preview and verify required is present and the action is an actual submit button.",
      ]),
    ],
  },
  {
    id: "flexbox",
    title: "Flexbox layouts",
    category: "HTML and CSS Studio",
    action: "design",
    intro:
      "Use Flexbox for a row or column of related items: toolbar actions, navigation links, a label with an icon, or a vertical form. The parent controls how its direct children align, wrap and share space.",
    related: ["layout-modes", "css-grid", "spacing", "responsive"],
    sections: [
      s("where", "Configure the parent container", [
        "Select the common parent in Layers. Choose Flex under Container layout mode on the floating canvas toolbar, or set display:flex in Design > Layout. Edit flex-direction, flex-wrap, align-items, justify-content and gap there or through Custom CSS property/value. Child grow/shrink/basis values belong on the child, not the parent.",
      ]),
      s("steps", "Build a responsive action row", [], {
        steps: [
          "Insert a Container and add a paragraph plus two buttons inside it. Select the container and set display:flex, align-items:center, gap:12px and flex-wrap:wrap.",
          "Select the paragraph and set flex:1 1 200px with min-width:0. The text can shrink or move to another line while buttons retain useful widths.",
          "At a narrow viewport, either keep wrapping or add flex-direction:column under the ≤480px Responsive style context. Set align-items:stretch there for full-width actions.",
          "Preview keyboard order and save. Export the parent to retain the relationship between all three items.",
        ],
      }),
      s("example", "Use wrapping instead of fixed coordinates", [], {
        code: {
          language: "css",
          text: `.action-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.action-row p { flex: 1 1 200px; min-width: 0; margin: 0; }
@media (max-width: 480px) {
  .action-row { flex-direction: column; align-items: stretch; }
}`,
          caption:
            "Assign action-row to the parent. Wrapping responds to available space without absolute positioning.",
        },
      }),
      s("notes", "Understand axes and common failures", [
        "With row direction, justify-content distributes along the horizontal main axis and align-items aligns vertically; column swaps these roles. gap separates items without adding outside edge space. Use parent padding for that edge. Auto margins can absorb spare space, and align-self overrides alignment for one child.",
        "If children overflow, inspect fixed widths, white-space:nowrap and the automatic minimum size; min-width:0 on a shrinking item often matters. A fixed height can clip a wrapped row. Avoid visual reordering that conflicts with reading/tab order. CSS exports preserve the layout rules, but selecting only a child omits a necessary parent relationship; include the row or give the child independent styles.",
      ]),
    ],
  },
  {
    id: "css-grid",
    title: "CSS Grid layouts",
    category: "HTML and CSS Studio",
    action: "design",
    intro:
      "Use Grid for two-dimensional relationships such as dashboard cards, settings columns or a sidebar beside content. Track definitions control the parent; spans and placement control its direct children.",
    related: ["flexbox", "modern-workflows", "responsive", "spacing"],
    sections: [
      s("where", "Set tracks on a grid parent", [
        "Select a container and choose Grid in Container layout mode, then open Design > Layout. Set grid-template-columns, grid-template-rows and gap using property controls or Custom CSS declarations. Set grid-column or grid-row on a child when it should span tracks. Those properties have no placement effect outside a grid parent.",
      ]),
      s("steps", "Build a three-card grid", [], {
        steps: [
          "Insert a Container and three card components inside it. Select the container and set display:grid, grid-template-columns:repeat(3,minmax(0,1fr)) and gap:24px.",
          "Give each card min-width:0 and keep its height content-driven. Select the first card and set grid-column:span 2 if it should be wider on desktop.",
          "Under ≤768px Responsive style context set the parent columns to 1fr. Reset the first card's grid-column to auto in that context.",
          "Inspect Mobile and a custom 800px viewport. Save and export the outer grid for a complete region.",
        ],
      }),
      s("example", "Prevent implicit tracks on mobile", [], {
        code: {
          language: "css",
          text: `.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.card-grid > :first-child { grid-column: span 2; }
.card-grid > * { min-width: 0; }
@media (max-width: 768px) {
  .card-grid { grid-template-columns: 1fr; }
  .card-grid > :first-child { grid-column: auto; }
}`,
          caption:
            "A desktop span must be reset when there is only one mobile column; otherwise the browser can create an extra implicit track.",
        },
      }),
      s("notes", "Diagnose oversized tracks and exports", [
        "A plain 1fr track has an automatic content minimum; minmax(0,1fr) allows it to shrink below a long child's minimum. The child may still need overflow-wrap or a dedicated scroll container. Fixed pixel columns are useful for a desktop sidebar but should have a narrow-width rule.",
        "Grid changes flow layout and should replace a freeform arrangement when cards need to reflow. Explicitly positioned or absolutely positioned children may need their placement reset. Inspect the exported CSS in the destination container: a responsive grid embedded in a narrow desktop panel may benefit from a container query instead of a viewport query.",
      ]),
    ],
  },
  {
    id: "advanced-css",
    title: "Custom CSS, variables and state selectors",
    category: "HTML and CSS Studio",
    action: "code",
    intro:
      "Extend the visual controls with custom declarations, shared variables, pseudo-selectors and nested queries. The stylesheet is preserved as CSS source, allowing advanced rules to coexist with selected-element edits.",
    related: ["css-studio", "responsive", "animations", "document-format"],
    sections: [
      s("steps", "Add a shared design token", [], {
        steps: [
          "Select a card, open HTML and add token-card in CSS classes.",
          "Open CSS in the bottom workspace. Add the :root variables and token-card rules below to the existing stylesheet; do not replace unrelated page rules.",
          "Choose Format source if desired, then Apply changes. The card should use the token color and spacing.",
          "Change --brand once, apply and check every element referencing it. Keep the variable definition when extracting the region; review export dependencies.",
        ],
      }),
      s("example", "Create reusable values and visible focus", [], {
        code: {
          language: "css",
          text: `:root { --brand: #446b32; --card-gap: 24px; --card-radius: 16px; }
.token-card { padding: var(--card-gap); border-radius: var(--card-radius); }
.token-card a { color: var(--brand); }
.token-card a:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }
.token-card::before { content: "Featured"; display: block; font-weight: 600; }`,
          caption:
            "Custom properties inherit through the document. The pseudo-element adds decoration and should not be the only source of essential accessible content.",
        },
      }),
      s("custom", "Use custom declarations without replacing the stylesheet", [
        "Design > Custom CSS property and Custom CSS value accept one safe declaration at a time, including custom properties such as --brand, vendor properties and !important values. Apply declaration writes to the selected node/state/query. Reset draft clears the input fields; the reset button beside a listed declaration removes that applied property.",
        "Use the full CSS source workspace for selectors, @media, @container, @supports, keyframes, cascade layers and nested rules. Inspector operations target their own generated selector and preserve unrelated rules. CSS interactive state appends states such as :hover or ::before; the Responsive style context wraps declarations in the chosen query.",
      ]),
      s("queries", "Choose viewport or container conditions", [], {
        code: {
          language: "css",
          text: `.card-region { container-type: inline-size; }
.card-actions { display: flex; gap: 12px; }
@container (max-width: 600px) { .card-actions { flex-direction: column; } }
@media (max-width: 768px) { .page-sidebar { position: static; width: auto; } }`,
          caption:
            "Container conditions apply to descendants of a size-query container. A container cannot query its own size to style itself with this rule.",
        },
      }),
      s("notes", "Preservation, safety and integration", [
        "Unknown safe declarations remain in the source even when the current browser ignores them. @import, executable URLs, embedded markup and unsafe file/data URLs are rejected; import supported assets locally instead. A parse error keeps the unapplied draft so you can correct it.",
        "If a declaration loses, check cascade order, specificity, inherited variables and !important before adding another override. Selection export retains relevant rules and dependencies conservatively; complex ancestor selectors can require the surrounding structure. Copy retained token definitions, keyframes and assets into the destination with the component CSS, and test in its actual containing layout.",
      ]),
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility and performance review",
    category: "HTML and CSS Studio",
    action: "full-preview",
    intro:
      "Review keyboard operation, structure, contrast and rendering cost before integrating an exported design. Responsive analysis and document diagnostics help identify issues, but a clean result does not prove that the interface is accessible.",
    related: ["forms-accessibility", "html-elements", "glass", "responsive"],
    sections: [
      s("keyboard", "Run a keyboard review in live preview", [], {
        steps: [
          "Save your design, then open Preview full screen. Use Tab and Shift+Tab to visit every action and control.",
          "Activate buttons with the keyboard and verify visible focus, logical order and an understandable result. Test menu/dialog close actions and focus after closing.",
          "Read the heading sequence and inspect landmarks. Keep one primary main region and label repeated navigation regions.",
          "Verify visible input labels, image alternatives and unique IDs. Give icon-only actions a specific accessible name such as Open settings.",
          "Check long content at mobile width and with larger browser text. Fix clipping instead of hiding essential information.",
        ],
      }),
      s("motion", "Respect preferences without hiding feedback", [], {
        code: {
          language: "css",
          text: `.save-action:focus-visible { outline: 3px solid #436d31; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .animated-card { animation: none; transition: none; }
}`,
          caption:
            "Keep feedback visible even when movement is disabled. Check text contrast against actual gradients and glass backgrounds, including fallback surfaces.",
        },
      }),
      s("cost", "Keep the page inexpensive to render", [
        "Use appropriately sized local images and avoid stacking many large backdrop filters or shadows. Content-driven height and modest nesting reduce layout surprises. A table can scroll inside a labeled region while the page remains within the viewport; clipping the entire page conceals information.",
        "Use Diagnostics for model issues and Responsive for measured layout issues. Compare the same long-content design in the exported application because global CSS, fonts and data can change wrapping and focus behavior. Manually review custom combinations and application-specific interactions with assistive technology.",
      ]),
      s("handoff", "Preserve improvements during integration", [
        "Export labels, ARIA relationships, focus rules and reduced-motion CSS with the whole region. When replacing a demo interaction with Angular or React state, preserve keyboard semantics and announce errors or status as appropriate. If repeated exports introduce duplicate public IDs, assign instance-specific IDs and update their for/aria-describedby relationships together.",
      ]),
    ],
  },
];

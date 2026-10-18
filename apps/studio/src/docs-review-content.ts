import { type DocArticle, section as s } from "./docs-model";

export const reviewArticles: DocArticle[] = [
  {
    id: "icons",
    title: "Icon Factory: collection, buttons and custom SVG",
    category: "Icon Factory",
    action: "icons",
    intro:
      "Choose from the original vector collection, customize an icon, place it on the canvas or save a project-local variant. Vector studio and sanitized SVG source let you build a custom symbol without turning it into a bitmap.",
    related: [
      "components",
      "forms-accessibility",
      "accessibility",
      "selective-export",
    ],
    sections: [
      s("find", "Find and customize a collection icon", [
        "Open Icon Factory from the workspace toolbar or Add icon to selection on the floating canvas tools. Collection offers Search icons and Icon category across 93 original symbols. Choose an entry and inspect its preview against different surfaces/sizes before insertion.",
        "Icon style offers outline, rounded, sharp, duotone and tinted treatments. Icon primary color, accent color, size (12 to 512px), stroke (0.25 to 5), opacity, rotation, Flip X/Y and Two-color gradient control the vector. Not every symbol is intended to be a filled glyph. Set Icon accessible label only when the graphic itself needs a name; an empty label makes it decorative.",
      ]),
      s("steps", "Add an icon to a button", [], {
        steps: [
          "Select the button parent in Layers, rather than its inner text span or existing SVG.",
          "Open Icon Factory, search an icon and choose it. Set Icon size to 20 and a color/stroke that remains visible on the button.",
          "Choose Before text under Button icon layout, then Insert into canvas and Close dialog to return to the editor. After text, Above text and Below text change the flex arrangement around the retained label. If the button already has an icon, update its selected SVG instead, or remove just that SVG before inserting a replacement; insertion adds another icon.",
          "For Icon only · keep accessible label, verify the button still has a meaningful accessible name. Existing text stays in the document while non-SVG visual content is hidden for that placement.",
          "Return to Layers to select the button again if you need parent padding or gap. Check Mobile and keyboard activation in Preview, then Save now.",
        ],
      }),
      s("existing-icon", "Move an existing icon into a button", [
        "Select the existing SVG on the canvas or in Layers. In Design, open Button icon placement, choose Button for selected icon and Selected icon placement, then Apply icon placement. Before text, After text, Above text, Below text and Icon only keep the same SVG and the button's text and interactions. Changing back from Icon only restores the retained label.",
        "You can also drag an existing icon onto a button or link. Drop on the left half for Before text or the right half for After text. For a freely positioned icon, drag normally; hold Alt to move an icon with the pointer in a flow layout. Undo restores its previous parent and styles in one step. Use the placement controls to refine the arrangement, then check Mobile and Preview.",
      ]),
      s("fields", "Place a standalone or leading field icon", [
        "Select a compatible container before opening the factory to insert a standalone SVG. If the selected target cannot contain it, insertion uses a compatible location rather than nesting SVG illegally inside an input.",
        "When an input/select/textarea is selected, the factory creates a relative wrapper, positions the SVG at the left edge and reserves leading padding in the field. The original field ID, attributes and label relationship remain. If text overlaps the icon, inspect your own high-priority padding overrides and the wrapper's dimensions. Keep the icon decorative when the visible field label already explains the purpose.",
      ]),
      s("vector-workflow", "Edit an imported or custom vector", [], {
        steps: [
          "Use Import SVG icon, or paste markup in SVG source and choose Apply SVG source. Review any rejection message; scripts, unsafe URLs and unsupported content are not accepted.",
          "Open Vector studio to select a shape/layer. Edit its attributes, path data or transform, and use the vector undo/redo controls while experimenting.",
          "For custom SVGs, whole-icon size, opacity and accessibility remain available. Collection style, global color/stroke and rotation controls are disabled; change per-layer paint/transforms in Vector studio.",
          "Enter Icon variant name and choose Save to my icons. Find it under My icons in this project. Save the project to persist the collection.",
          "Select an SVG already on the canvas and reopen the factory to use Update selected icon. Insert into canvas instead creates another instance.",
        ],
      }),
      s("example", "Read a small scalable symbol", [], {
        code: {
          language: "html",
          text: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
     width="20" height="20" aria-hidden="true" fill="none">
  <path d="M12 5v14M5 12h14" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" />
</svg>`,
          caption:
            "A decorative add symbol inside a visibly labeled action. For an icon-only button, give the button an accessible name such as Add project.",
        },
      }),
      s("export", "Save and export vector assets", [
        "Save to my icons stores an editable variant in the current project; it does not download a file. Icon export format offers SVG vector, PNG @3×, Inline HTML, CSS asset, Angular component and React component. Choose the format then Download icon. A 24px icon exported as PNG @3× is 72×72 pixels; SVG stays scalable.",
        "For HTML use the SVG inline or reference the downloaded asset. For framework formats keep the generated component code and use its actual exported name/selector from that file. Gradient identifiers are isolated in framework outputs for repeated instances. A whole UI component export includes its inserted SVG, so a separate icon library dependency is unnecessary.",
      ]),
      s("notes", "Fix a missing or duplicated icon", [
        "Invisible SVG: check paint color, opacity, size and viewBox, then inspect the background. Unexpected recoloring after SVG import: use per-layer attributes instead of collection controls. Duplicate insertion: select the existing canvas SVG and use Update selected icon. Lost saved variant: confirm you are in the same project and that its save completed.",
      ]),
    ],
  },
  {
    id: "responsive",
    title: "Responsive Lab and real device previews",
    category: "Responsive Lab",
    action: "responsive",
    intro:
      "Measure the actual layout at seven viewport widths, inspect suggested CSS changes and decide which fit your design. Pair this review with custom-width previews and testing in the exported application.",
    related: ["css-grid", "flexbox", "advanced-css", "fullscreen"],
    sections: [
      s("viewport", "Separate viewport dimensions from zoom", [
        "The canvas device controls use Desktop, Tablet and Mobile widths and an editable Viewport width (240 to 3840px). Rotate viewport swaps its current width and height. The iframe's CSS pixels determine media queries and wrapping. Zoom scales the displayed artboard (20 to 150%) and Fit adjusts visibility; neither turns a desktop layout into mobile CSS.",
        "Preview full screen offers Desktop fit-to-window, Laptop 1366×768, Tablet 768×1024, Mobile 375×812 and Custom. It runs supported interactions without selection outlines and preserves the editor's separate device/zoom settings when you return.",
      ]),
      s("steps", "Analyze a page and review one recommendation", [], {
        steps: [
          "Apply source changes, then choose Responsive in the workspace toolbar or Analyze responsiveness in the inspector. Wait for Measuring your layout to finish.",
          "Read severity, confidence and explanation on a recommendation. Choose Select affected element to locate its node.",
          "Open Review CSS changes to compare CURRENT DECLARATIONS with PROPOSED. These are declarations for review, not a complete computed-style diff.",
          "Choose Preview to temporarily view the proposed result and Original to return. Confirm the page still expresses your layout intent.",
          "Choose Apply for a suitable proposal or Reject recommendation to leave it unapplied. Apply is disabled below 70% confidence; use an offered alternative or edit CSS manually when appropriate.",
          "Analyze again after accepted/manual changes. Test Mobile, Tablet and an in-between custom width. Use document Undo if an applied edit needs reversal.",
        ],
      }),
      s("measurement", "Understand what measurements can show", [
        "The analyzer samples 1280, 1024, 880, 768, 640, 480 and 375px. It measures overflow, fixed constraints and layout relationships to produce local recommendations. It cannot prove every intermediate width works or determine whether a table should scroll, hide a column or switch to cards. Intentional clipping/overlays need manual judgment.",
        "Use fixed-width, nowrap and minimum-track evidence to identify the cause. Do not hide page overflow just to remove the symptom. Give a wide table a bounded scroll region; give flexible grid children min-width:0; reset desktop spans when using one mobile column. Re-analysis measures the edited page rather than marking every prior suggestion as permanently valid.",
      ]),
      s("queries", "Write media and container queries deliberately", [], {
        code: {
          language: "css",
          text: `.page-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); }
.card-region { container-type: inline-size; }
.card-actions { display: flex; gap: 12px; }
@media (max-width: 768px) { .page-layout { grid-template-columns: 1fr; } }
@container (max-width: 600px) { .card-actions { flex-direction: column; } }`,
          caption:
            "A media query responds to viewport width; a container query responds to the card's containing region. Add classes in HTML and append rules in CSS source before Apply changes.",
        },
      }),
      s("validate", "Validate the applied and exported result", [
        "Save after applying recommendations or manual CSS. Source exports preserve relevant media/container rules, but an extracted component can sit in a narrower parent than the whole page did. Check that its query container is included and that assets/fonts load in the destination.",
        "Test long labels, empty and filled states, keyboard focus, rotated devices and an arbitrary custom width. No detected issues means the sampled analysis found none; it is not a certificate for accessibility, all browser behavior or every screen size. If an apparent fix disappears, verify it was applied rather than only previewed, and that its query is active at the current width.",
      ]),
    ],
  },
];

import { type DocArticle, section as s } from "./docs-model";

export const designerArticles: DocArticle[] = [
  {
    id: "visual-studio",
    title: "Understanding the editor and selection",
    category: "Visual Designer",
    action: "layers",
    intro:
      "The canvas, Layers, inspector and source workspace edit one document. Learn which element is selected and which panel owns a change before adjusting a complex screen.",
    related: ["drag-drop", "css-studio", "shortcuts", "fullscreen"],
    sections: [
      s("map", "Locate the editor's main regions", [
        "The left library has Insert, Layers and Assets. Insert supplies primitive elements, components, complete screens and saved blocks. Layers shows the active page's nested tree. Assets stores imported local images. Toggle library panel reveals or hides this region.",
        "The center canvas renders the active page in an iframe at its actual CSS viewport width. Device presets and custom dimensions control layout; zoom only changes the displayed scale. The page dropdown above the canvas switches pages, and the adjacent plus adds a page.",
        "The right inspector edits the selection: Design writes CSS and text, HTML edits tags/attributes/interactions, and Motion creates transitions and keyframes. The bottom source workspace shows HTML, CSS, Media queries, Keyframes, JavaScript, TypeScript and Diagnostics. HTML/CSS are editable drafts; generated JavaScript/TypeScript are previews.",
      ]),
      s("steps", "Select a nested field accurately", [], {
        steps: [
          "Insert a Contact form or open an existing form screen. Click a visible input to select it and inspect the selection outline/name.",
          "Choose Layers in the left panel. Use the indented rows beneath the form and field wrapper to select the label, input or outer card explicitly.",
          "Use the breadcrumb below the canvas to select an ancestor. A parent's padding affects its contents; an input's padding affects its own text.",
          "Shift-click to add or remove elements from a multi-selection. Design edits then apply to selected elements; verify the set before changing shared styling.",
          "Double-click a leaf text element for inline editing. Enter commits and Escape cancels. For nested text inside a button select its text span and use Element text.",
        ],
      }),
      s("history", "Undo document edits without losing your place", [
        "Use Undo/Redo in the toolbar or Ctrl+Z / Ctrl+Shift+Z (Ctrl+Y also redoes) when the canvas has focus. A move/resize/spacing gesture commits as one operation. Selection is retained across history when those node IDs still exist; deleting or undoing creation can remove the selected node.",
        "Inside a text input or Monaco, shortcuts operate on text. HTML/CSS source changes must be applied before they become document history. Autosave stores the applied document, not an unapplied source draft; Save now is not a substitute for Apply changes.",
      ]),
      s("focus-workspace", "Arrange the workspace for the task", [
        "Use Focus canvas or Ctrl+Shift+F to hide surrounding panels temporarily, Maximize code workspace for source editing, and Preview full screen to interact without selection outlines. Exiting restores the prior editor arrangement. These modes preserve the project; selecting a different page changes only the active page, while loading a screen template replaces its content.",
      ]),
      s("notes", "Resolve selection and export confusion", [
        "If a click selects decoration rather than the container, use Layers or the breadcrumb. If no outline appears, leave Preview and return to Design. If a style affects too much, check multi-selection and Undo before continuing.",
        "Select the outer region you intend to reuse before Selected elements export. Selecting a text span exports only that small subtree. Save the project to keep the whole editable document, and export source separately for application integration.",
      ]),
    ],
  },
  {
    id: "drag-drop",
    title: "Drag, drop and parent/child nesting",
    category: "Visual Designer",
    action: "components",
    intro:
      "Use drop targets to insert, reorder or reparent elements while keeping valid HTML nesting. In normal flow layouts, placement follows the parent and sibling order rather than arbitrary canvas coordinates.",
    related: ["visual-studio", "layout-modes", "moving-resizing", "components"],
    sections: [
      s("before", "Identify the intended parent", [
        "Open Insert and select a container on the canvas or in Layers. Clicking Add Container or an Insert component button adds to a compatible selection/ancestor; dragging lets you choose a target and insertion position. Use empty space inside a container for nesting and edge indicators for sibling insertion.",
        "A field cannot contain another element inside the input itself, and a button cannot contain arbitrary block layouts. Invalid targets are rejected or a compatible ancestor is used. Inspect Layers after insertion rather than relying only on where a scaled preview appears.",
      ]),
      s("steps", "Nest a card and reorder its content", [], {
        steps: [
          "Add a Container from ELEMENTS. Add a Heading and Paragraph inside it; use Layers to confirm they are children of the container.",
          "Drag a button component from COMPONENTS toward the card. Wait for the drop indicator at the intended target before releasing.",
          "Select an existing child and drag it toward a sibling edge to move before or after that sibling. Dropping inside another valid container reparents it.",
          "Review the resulting tree and order in Layers. Use Undo once if the target was wrong, or move the same element instead of inserting a duplicate.",
          "Check Mobile after reparenting. A moved node keeps its identity and styles, but its new parent can change available space and inherited values.",
        ],
      }),
      s("order", "Use order for layout and reading sequence", [
        "Flow, Flex and Grid use the document order as their baseline. Reorder elements to match the intended reading and keyboard sequence. A freeform surface can place children visually elsewhere; that does not automatically change reading order. Context-menu Move before/after provides an alternative when pointer placement is awkward.",
        "Grouping selected siblings creates a wrapper; Ungroup removes that wrapper and restores its children in order. Recheck layout after grouping because direct-child selectors and flex/grid participation can change. Export the group if it is the complete reusable unit.",
      ]),
      s("notes", "Recover from an unexpected drop", [
        "If a component appears at the page root, the selected leaf or target may not accept it. Select the intended parent in Layers and move the component there. If content shifts, inspect the new parent's display, gap and width before adding absolute offsets.",
        "Library screen buttons load a replacement screen; component insert buttons add a subtree. Previewing either entry is safe. Save before intentionally replacing a page. Drag/drop and reparent changes autosave after committing; source exports retain the resulting nesting and CSS, not the editor's drag handles.",
      ]),
    ],
  },
  {
    id: "moving-resizing",
    title: "Moving, resizing, alignment and snapping",
    category: "Visual Designer",
    action: "canvas",
    intro:
      "Resize using eight handles and move elements according to their parent layout. Use guides for deliberate placement, then check how size constraints behave at other viewport widths.",
    related: ["layout-modes", "spacing", "responsive", "shortcuts"],
    sections: [
      s("steps", "Resize a card with constraints", [], {
        steps: [
          "Select the card's outer container. Drag an edge to change one dimension or a corner to change both; watch the live width/height label.",
          "Hold Shift during resizing or enable the aspect-ratio lock for proportional resizing. Existing min/max constraints and percentage dimensions affect the result.",
          "In Design > Size prefer width:100% with max-width:640px for a card that should shrink. Keep height auto when text can grow.",
          "Change to a 375px viewport. Check that the card's padding, borders and contents fit within its parent.",
          "Use Undo once to reverse a completed resize gesture. Save after the intended result is applied.",
        ],
      }),
      s("guides", "Move and align with visual feedback", [
        "In Freeform, drag the selected element's move surface to change its coordinates. Arrow keys nudge by 1px; Shift+Arrow uses 10px. Each selected freeform item moves from its own original position. Flow/Flex/Grid instead rely on document order, tracks, gaps and alignment; dragging there can reorder or reparent content.",
        "Enable snapping/grid controls on the canvas toolbar for 8px grid increments and sibling/parent alignment guides. Guides assist placement during a gesture; they do not become exported elements. Align selection center and context-menu alignment commands provide deliberate alignment. Check the containing block before interpreting x/y positions.",
      ]),
      s("example", "Prefer a fluid size for content cards", [], {
        code: {
          language: "css",
          text: `.profile-card {
  box-sizing: border-box; width: 100%; max-width: 640px;
  min-width: 0; height: auto; padding: 24px; margin-inline: auto;
}
.profile-card img { max-width: 100%; height: auto; }`,
          caption:
            "This card adapts to its parent. A fixed 640px width without a mobile constraint can overflow the 375px preview.",
        },
      }),
      s("notes", "Diagnose a jump or an unchanged dimension", [
        "A parent layout can stretch a child, a min/max constraint can cap a resize, and content can impose an intrinsic minimum. Inspect flex/grid settings, box-sizing and min-width before repeatedly dragging. Percentage sizing is relative to the containing block, while canvas zoom is display scaling.",
        "If an absolutely positioned child shifts after reparenting, its containing block changed. Use relative positioning on the intended freeform parent or return the region to flow layout. Source exports retain size/position CSS; selection outlines, guides and editor coordinates are not part of the application.",
      ]),
    ],
  },
  {
    id: "spacing",
    title: "Margin, padding and gap",
    category: "Visual Designer",
    action: "design",
    intro:
      "Use padding for space inside a surface, margin for space outside an element and gap between layout children. Editing the correct wrapper gives labels and controls consistent rhythm without inserting spacer text.",
    related: ["forms-accessibility", "flexbox", "css-grid", "css-studio"],
    sections: [
      s("where", "Find visual and numeric spacing controls", [
        "Select the element and open Design > Spacing for margin and padding values; Gap is in Design > Layout. On the floating canvas toolbar enable Visual spacing controls to show Drag padding, Drag margin and Drag gap handles. Drag horizontally to adjust a value; the inspector reflects the committed result. The controls remain reachable within the stage for tall selections.",
        "Padding belongs on a card or field surface. Margin belongs on the outside of an element. Gap belongs on the flex/grid parent whose direct children need separation. If label and input are nested in different wrappers, setting gap on a distant ancestor may not affect their separation.",
      ]),
      s("steps", "Repair a cramped form", [], {
        steps: [
          "In Layers select a field wrapper containing one label and input. Set display:grid and gap:8px.",
          "Select the outer form's field container and set gap:24px if it is Grid/Flex. Use padding:24px on the form card.",
          "Reset unnecessary label/paragraph margins that add to the intended gap. Set input width to 100% and box-sizing to border-box.",
          "Select the card and try Drag padding to compare its inner edge spacing. A completed gesture is one undo step.",
          "Inspect Mobile for label/control wrapping, then Save now and export the form root.",
        ],
      }),
      s("example", "Use a small spacing scale", [], {
        code: {
          language: "css",
          text: `.preferences { display: grid; gap: 24px; padding: 24px; }
.preferences .field { display: grid; gap: 8px; min-width: 0; }
.preferences label { margin: 0; }
.preferences input { box-sizing: border-box; width: 100%; min-height: 46px; }
@media (max-width: 480px) { .preferences { padding: 16px; } }`,
          caption:
            "The outer gap separates groups, the inner gap separates label from control, and padding protects the card edge.",
        },
      }),
      s("notes", "Explain unexpected space", [
        "Vertical margins can collapse in ordinary block flow, so their visible total may not be a simple sum. Grid/Flex gap is separate from child margin. Percentage padding and inherited line height can also change the apparent spacing.",
        "Check Responsive style context before editing: a 16px mobile padding should not accidentally replace the base desktop value. Reset removes scoped declarations and may reveal template spacing; Undo restores your edit. Export includes these CSS rules, so the destination's own margins and global box-sizing can change the result unless you retain appropriate scoped styles.",
      ]),
    ],
  },
  {
    id: "layout-modes",
    title: "Flow, Flex, Grid and Freeform",
    category: "Visual Designer",
    action: "canvas",
    intro:
      "Choose a layout model according to how content should respond to available space. Flow, Flex and Grid are suited to responsive application structure; Freeform supports deliberate coordinate-based compositions.",
    related: ["flexbox", "css-grid", "moving-resizing", "responsive"],
    sections: [
      s("choose", "Understand the four modes", [
        "Select a container and use Container layout mode on the floating toolbar. Flow uses normal block/inline document layout. Flex arranges direct children along a row or column. Grid creates tracks in both dimensions. Freeform makes a relative parent with absolutely positioned children for direct movement.",
        "Use Flow for reading content, Flex for actions/navigation, Grid for cards or sidebar/content, and Freeform for diagrams or deliberate overlays. Freeform coordinates do not automatically become a responsive arrangement at narrow widths. Container size and children still need constraints and query rules.",
      ]),
      s("steps", "Convert a composition into a responsive region", [], {
        steps: [
          "Select the intended parent in Layers and inspect its direct children before switching modes.",
          "Choose Flex for a row of actions or Grid for cards. Set gap and alignment in Design; for Grid define explicit columns.",
          "Inspect position, left/top and width constraints on children. The mode conversion adjusts positioning, but review intentional overrides and descendant rules.",
          "At ≤768px or ≤480px choose a suitable column/track arrangement. Test content order and long text in Preview.",
          "Use Undo to revert the conversion if it changed the wrong region. Save and export the complete container.",
        ],
      }),
      s("example", "Create a deliberately positioned badge", [], {
        code: {
          language: "css",
          text: `.diagram { position: relative; min-height: 240px; }
.diagram-badge { position: absolute; left: 24px; top: 24px; }
@media (max-width: 480px) {
  .diagram-badge { left: 12px; top: 12px; max-width: calc(100% - 24px); }
}`,
          caption:
            "A badge can use coordinates inside a relative region. Keep text-heavy forms and card grids in layouts that can grow with their content.",
        },
      }),
      s("notes", "Know what is saved and exported", [
        "Changing a mode writes document CSS in one history transaction. New children in a freeform surface start with offsets, and direct drags/nudges update their positions. The exporter retains these declarations without a CodeShip runtime.",
        "If content disappears below a freeform parent, its absolute children may not contribute to the parent's height; establish an intentional height/min-height. If switching to Grid leaves an awkward arrangement, check old fixed dimensions and spans. Responsive analysis offers measured guidance, but cannot infer which items should become a column.",
      ]),
    ],
  },
  {
    id: "shortcuts",
    title: "Keyboard shortcuts and history",
    category: "Visual Designer",
    action: "canvas",
    intro:
      "Use shortcuts to edit the canvas efficiently while leaving text fields and source drafts with their normal editing behavior. Desktop menus expose native file actions separately from document operations.",
    related: ["visual-studio", "fullscreen", "projects", "moving-resizing"],
    sections: [
      s("editing", "Canvas editing shortcuts", [
        "With canvas/editor focus: Ctrl+Z undoes; Ctrl+Shift+Z or Ctrl+Y redoes; Ctrl+C copies the selected subtree; Ctrl+V pastes; Ctrl+D duplicates; Ctrl+G groups selected siblings; Ctrl+Shift+G ungroups. Delete or Backspace removes selected elements. Escape clears selection or leaves an active workspace mode.",
        "Arrow keys nudge positioned elements 1px and Shift+Arrow uses 10px. H selects pan and V returns to selection. Shift-click changes the multi-selection. Shift while resizing preserves aspect ratio. The slash key focuses Search library when you are not editing a field; inside documentation it focuses Search documentation.",
      ]),
      s("files", "Native file and workspace shortcuts", [
        "Ctrl+S saves the project. The Windows File menu also provides Ctrl+O for Open project, Ctrl+Shift+S for Save as, Ctrl+E for export and Ctrl+Shift+P for projects. F11 toggles application full screen. Ctrl+Shift+F toggles Focus canvas. Browser development may reserve some native/browser shortcuts; use the visible controls when necessary.",
      ]),
      s("steps", "Verify undo boundaries", [], {
        steps: [
          "Select a container and complete one resize drag. Focus the canvas and press Ctrl+Z once; its previous size should return.",
          "Press Ctrl+Shift+Z to restore the resize. Duplicate with Ctrl+D and inspect the independent copy in Layers.",
          "Open CSS source and edit a value. Inside the source editor Ctrl+Z edits the draft. Apply changes to commit the draft to the document.",
          "Return focus to the canvas before using document Undo. Save after the desired history state is restored.",
        ],
      }),
      s("notes", "When a shortcut appears to do something else", [
        "In input, textarea, select and contenteditable fields, typing shortcuts belong to that field. Monaco has its own undo/copy/format commands. Dialogs intercept applicable keys and Escape may first restore an expanded workspace rather than close the whole application view.",
        "History describes edits in the current session. Save/backup/recovery preserve project data across sessions; they do not promise an unlimited persistent undo stack. If a key is reserved by Windows or the browser, use the corresponding toolbar or menu command.",
      ]),
    ],
  },
  {
    id: "fullscreen",
    title: "Full-screen editing and preview modes",
    category: "Visual Designer",
    action: "focus-canvas",
    intro:
      "Choose the mode that gives the current task more room: native application full screen, focused canvas, a live device preview, expanded code or a dedicated documentation reading view. These modes keep your current project open.",
    related: ["visual-studio", "responsive", "css-studio", "shortcuts"],
    sections: [
      s("application", "Application full screen", [
        "Use the header expand control or F11 to enter native full screen in the Windows app. The control reflects the actual window state. F11 or the exit control returns to the prior window mode. Full screen is not forced at startup. Browser development uses the browser Fullscreen API where available.",
      ]),
      s("canvas", "Focus canvas", [
        "Choose Focus canvas in the workspace toolbar or Ctrl+Shift+F. Project chrome, sidebars and the source panel are temporarily hidden. The compact canvas controls retain selection, pan, devices, zoom, history and an exit action. Escape or Exit canvas focus restores the previous panel arrangement, selection and document.",
      ]),
      s("preview", "Test interactions at a real device size", [], {
        steps: [
          "Choose Preview full screen beside the header Preview control. The page renders interactively without design outlines.",
          "Choose Desktop for the available window size, Laptop (1366 × 768), Tablet (768 × 1024), Mobile (375 × 812) or Custom dimensions.",
          "Use Rotate to swap dimensions and Hide controls for an uninterrupted preview. The preview may scale to fit, but its CSS viewport remains the stated width/height.",
          "Use the return control or Escape to leave. This preview does not replace the editor's viewport and zoom settings or save responsive CSS by itself.",
        ],
      }),
      s("code", "Maximize the source workspace", [
        "Use Maximize code workspace on the bottom toolbar. The existing Monaco editor expands without recreating its draft, cursor or undo history. Restore code workspace returns to the prior layout. HTML/CSS remain explicitly applied drafts; JavaScript and TypeScript remain generated, read-only views.",
      ]),
      s("reading", "Read documentation in its own full view", [
        "Use Expand documentation in the Docs header, then Guides and On this page to show/hide the side regions. Search, bookmarks, Copy link, Copy code, Print article and theme controls remain available. Escape first restores expanded documentation, then closes it. Try in the editor opens the relevant workflow without replacing your design.",
      ]),
      s("notes", "Preserve work across modes", [
        "Changing display modes does not apply a dirty source draft or create a save. Apply changes and wait for All changes saved before closing the app. If controls seem missing, leave the focused/preview mode first. If a mobile layout still looks wide, check the actual viewport dimensions instead of the display scale.",
      ]),
    ],
  },
  {
    id: "animations",
    title: "Transitions and keyframe animations",
    category: "HTML and CSS Studio",
    action: "motion",
    intro:
      "Use a transition for a state change and a keyframe animation for a timed sequence. Motion controls generate CSS so the effect can run in the independent exported design.",
    related: [
      "advanced-css",
      "css-studio",
      "accessibility",
      "selective-export",
    ],
    sections: [
      s("steps", "Add a restrained hover transition", [], {
        steps: [
          "Select a button and open Design. Choose Hover in CSS interactive state and add transform:translateY(-2px), then return to Default.",
          "Open Motion in the inspector. Set Transition property to transform, Transition duration to 160, delay to 0 and easing to ease-out.",
          "Choose Apply transition. In Preview hover the button and use the keyboard to check its separate focus-visible state.",
          "Inspect CSS source to confirm the base transition and hover rule are both present. Save the document before exporting the complete button.",
        ],
      }),
      s("keyframes", "Create and inspect a timed animation", [
        "In Motion > Keyframe animation set Animation name, duration, delay, iterations, easing curve, direction and fill mode. Duration and delay use milliseconds; iterations can describe a finite count or infinite. Direction normal/reverse/alternate/alternate-reverse changes playback order. Fill mode none/forwards/backwards/both controls styles outside active playback.",
        "Use the keyframe timeline and offset, opacity and transform fields to shape the sequence. Offsets describe progress through the animation, and the easing preview/control points adjust timing. Apply animation writes the animation and keyframes; Replay restarts previewing. Editing the control draft alone does not apply the new sequence.",
      ]),
      s("example", "Animate entry without hiding content permanently", [], {
        code: {
          language: "css",
          text: `@keyframes card-entry {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.entry-card { animation: card-entry 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .entry-card { animation: none; transition: none; }
}`,
          caption:
            "The static card remains visible when motion is disabled. A transition alone needs a property/state change to be observable.",
        },
      }),
      s("notes", "Save, export and troubleshoot motion", [
        "Applied motion is a document transaction and autosaves. Exports retain relevant keyframes and animation declarations, including supported reduced-motion handling. Reusable selection must include the animated element and any interaction target that changes its state.",
        "If a transition does nothing, verify the property's before/after values differ and the property can animate. If an entry sequence ran before you looked, use Replay or reopen Preview. Transforms used by an animation can compete with positioning or hover transforms; combine them intentionally instead of relying on two declarations to compose automatically. Prefer short transform/opacity effects and avoid looping essential content.",
      ]),
    ],
  },
];

import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { EditorStore } from "../../../packages/editor-core/store";
import { desktop } from "../../../packages/desktop-bridge";

export const tutorialSteps = [
  {
    id: "project",
    title: "A fresh place to start",
    body: "Open Your workspace and create a project. Your existing work is saved locally before switching.",
    target: ".brand",
    action: "new-project",
    hint: "Create a new project",
  },
  {
    id: "container",
    title: "Give your layout a home",
    body: "Find Container in the Insert panel. Click it or drag it onto the canvas. Containers hold the pieces of a layout.",
    target: '[aria-label="Add Container"]',
    action: "insert:div",
    hint: "Add a container",
  },
  {
    id: "heading",
    title: "Say something with a heading",
    body: "Add a Heading. It becomes a real HTML heading inside your selected container.",
    target: '[aria-label="Add Heading"]',
    action: "insert:h1",
    hint: "Add a heading",
  },
  {
    id: "button",
    title: "Add your first action",
    body: "Add a Button from the Forms category. Select its text on the canvas to customize it later.",
    target: '[aria-label="Add Button"]',
    action: "insert:button",
    hint: "Add a button",
  },
  {
    id: "field",
    title: "Make room for input",
    body: "Add an Input. For a complete labeled form, try Contact form in Components. Its label, field and helper text already have consistent spacing.",
    target: '[aria-label="Add Input"]',
    action: "insert:input",
    hint: "Add an input",
  },
  {
    id: "content",
    title: "Make the words your own",
    body: "Select a heading or button and change Text content in HTML properties, or double-click canvas text. Inputs use attributes such as placeholder and aria-label.",
    target: ".right-panel",
    action: "update",
    hint: "Edit text or an HTML attribute",
  },
  {
    id: "style",
    title: "A little personality",
    body: "Use Design properties to change a color, size, gap or padding. These controls write CSS into your project.",
    target: ".right-panel",
    action: "Update style",
    hint: "Change a style property",
  },
  {
    id: "mobile",
    title: "A smaller screen, a real layout",
    body: "Choose Mobile. The iframe becomes 375 CSS pixels wide. Zoom changes only its display scale; your page must still fit the actual viewport.",
    target: '[aria-label="Mobile viewport"]',
    action: "mobile",
    hint: "Switch to mobile",
  },
  {
    id: "analyze",
    title: "Find layout constraints",
    body: "Analyze responsiveness to measure the document at multiple widths. Review suggested changes and apply any that fit your design. A clean layout may need no fixes.",
    target: ".analyze-button",
    action: "analyze",
    hint: "Run the responsive analyzer",
  },
  {
    id: "icon",
    title: "One icon, your own style",
    body: "Open Icon Factory. Browse the original collection, choose a variant, then Insert into canvas. Saved variants stay with this project.",
    target: ".factory-launch",
    action: "Insert icon",
    hint: "Insert an icon from the factory",
  },
  {
    id: "save",
    title: "Keep what you create",
    body: "Open Your workspace and choose Save now. The desktop app saves edits to permanent local project folders. Project JSON is also available as a portable backup.",
    target: ".brand",
    action: "save",
    hint: "Save the project",
  },
  {
    id: "resize",
    title: "Shape the space",
    body: "Select an element and drag one of its eight handles. Shift preserves proportions; snap grid uses 8px increments.",
    target: ".canvas-stage",
    action: "Resize element",
    hint: "Resize an element",
  },
  {
    id: "layout",
    title: "Choose how the layout flows",
    body: "Select a container and choose Flex or Grid in the floating toolbar. Freeform supports absolute positioning; Flow follows document order.",
    target: ".floating-tools",
    action: "Change layout",
    hint: "Change a container layout mode",
  },
  {
    id: "preset",
    title: "Give a surface a clear style",
    body: "Select a container or card, open Style presets in Design, and apply Minimalistic. All resulting CSS stays editable.",
    target: ".right-panel",
    action: "Apply Minimalistic",
    hint: "Apply the Minimalistic preset",
  },
  {
    id: "selective",
    title: "Ship only the piece you need",
    body: "Select a component or container. Open Export code, choose Selected elements and Reusable component, and review the extracted files.",
    target: ".export-button",
    action: "selective-export",
    hint: "Prepare a selected-element export",
  },
  {
    id: "export",
    title: "Ready to ship",
    body: "Choose Export code. Inspect HTML, Angular or Next.js output, then download the project. Exports include your SVG icons and responsive styles.",
    target: ".export-button",
    action: "export",
    hint: "Download an exported project",
  },
  {
    id: "component",
    title: "Build from a complete component",
    body: "Return to the editor, search Contact form in Components, and drag it into a container. It includes visible labels and local form validation.",
    target: ".left-panel",
    action: "Insert Contact form",
    hint: "Insert Contact form",
  },
  {
    id: "spacing",
    title: "Tune the breathing room",
    body: "Select the form container, turn on Visual spacing controls, and drag its padding control. Keep labels and fields comfortably separated.",
    target: ".floating-tools",
    action: "Adjust spacing",
    hint: "Drag a spacing control",
  },
  {
    id: "navbar",
    title: "Give your screen a way around",
    body: "Search Classic navigation in the component library and insert it. Its links are editable HTML; connect real routes in your application.",
    target: ".left-panel",
    action: "Insert Classic navigation",
    hint: "Insert Classic navigation",
  },
  {
    id: "focus",
    title: "Room to design",
    body: "Choose Focus in the workspace toolbar. Device controls and undo remain available. Exit canvas focus restores your exact panel layout.",
    target: '[aria-label="Focus canvas"]',
    action: "focus-canvas",
    hint: "Enter canvas focus",
  },
  {
    id: "full-preview",
    title: "See the complete experience",
    body: "Choose Preview full screen. Check Mobile, rotate the viewport, and try the form. Back to editor or Esc restores your editing workspace.",
    target: ".focus-toolbar",
    action: "full-preview",
    hint: "Open full-screen preview",
  },
  {
    id: "integration",
    title: "Connect the exported component",
    body: "Return to the editor and open Documentation. Read Angular Integration, Next.js Integration or HTML/CSS Integration to use the files in an existing application.",
    target: '[aria-label="Open documentation"]',
    action: "integration-guide",
    hint: "Open a framework integration guide",
  },
] as const;
export const lessons = [
  {
    title: "Getting started",
    icon: "rocket",
    text: "Start with a screen template or create a blank project. The desktop app stores permanent local project folders. Browser development uses IndexedDB. Export JSON to carry your work elsewhere.",
    example: "A first page: container → heading → paragraph → button.",
    action: "tutorial",
  },
  {
    title: "Visual builder fundamentals",
    icon: "pointer",
    text: "Click to select. Shift-click selects several elements. Double-click canvas text to edit. Drag a layer onto a container to move it. Undo restores document edits.",
    example:
      "Use Containers for sections. Prefer Flex row or Grid for groups that should reflow.",
    action: "builder",
  },
  {
    title: "HTML elements & forms",
    icon: "form",
    text: "Use semantic headings, navigation, sections and forms. Give every control a visible label. Label and field should have an 8px gap and a 44px or taller control.",
    example:
      "Contact form includes labels, input types, helper text and native required validation.",
    action: "forms",
  },
  {
    title: "CSS Studio",
    icon: "brush",
    text: "Design controls write scoped CSS. HTML properties edit attributes. Open the code panel to edit HTML or CSS directly; Apply validates your draft before changing the document.",
    example:
      "Use minmax(0, 1fr) in grids and min-width: 0 on shrinking children.",
    action: "code",
  },
  {
    title: "Responsive design",
    icon: "mobile",
    text: "Device presets change the real viewport. Fit and zoom only change display scale. Test several widths, measure constraints, then review analyzer suggestions before applying.",
    example:
      "A desktop sidebar can become wrapping navigation; a three-column board can stack.",
    action: "responsive",
  },
  {
    title: "Animations",
    icon: "animation",
    text: "Select an element and open Motion. Configure transitions or keyframes, adjust timing and easing, then preview. The exported baseline honors reduced-motion preferences.",
    example:
      "A 180ms opacity transition can communicate a state change without distracting motion.",
    action: "motion",
  },
  {
    title: "Icon Factory",
    icon: "component",
    text: "Search the original vector collection, change colors, stroke and variants, or edit SVG shapes in Vector studio. Save icons to the project and insert them as editable SVG.",
    example:
      "Try a duotone icon with a soft accent, then export SVG, PNG or a framework component.",
    action: "icons",
  },
  {
    title: "Templates & reusable components",
    icon: "layout",
    text: "A screen template replaces the active page. A component is inserted into your selection or the page. Save any selected subtree as a reusable block in the inspector.",
    example:
      "Start with Settings for a polished form or Forma for a responsive landing page.",
    action: "templates",
  },
  {
    title: "Framework exports",
    icon: "code",
    text: "The same document generates independent HTML/CSS, Angular and Next.js projects. Layouts, SVG vectors, assets and configured interactions are included. Backend services need your own integration.",
    example:
      "Use Project JSON for editing in CodeShip; use source export for your application.",
    action: "export",
  },
  {
    title: "Advanced editor features",
    icon: "layers",
    text: "Use layers for hierarchy, the selection handle for resizing, the grid for 8px snapping, saved blocks for reuse, and device comparison for reviewing three real viewports.",
    example:
      "Keyboard: Ctrl Z undo · Ctrl Shift Z redo · Ctrl S save · H pan · V select.",
    action: "help",
  },
];
interface Progress {
  version?: number;
  welcomed: boolean;
  index: number;
  completed: string[];
  active: boolean;
}
const key = "codeship-onboarding-v1";
@Injectable({ providedIn: "root" })
export class TutorialService {
  readonly store = inject(EditorStore);
  readonly state = signal<Progress>(this.read());
  readonly step = computed<(typeof tutorialSteps)[number] | undefined>(
    () => tutorialSteps[this.state().index],
  );
  readonly active = computed(
    () => this.state().active && this.state().index < tutorialSteps.length,
  );
  readonly percent = computed(() =>
    Math.round((this.state().completed.length / tutorialSteps.length) * 100),
  );
  private readonly event = signal({ name: "", serial: 0 });
  constructor() {
    effect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(this.state()));
        void desktop()?.updateSettings({
          tutorial: JSON.stringify(this.state()),
        });
      } catch {
        /* Private modes can deny storage. */
      }
    });
    effect(() => {
      const state = this.state(),
        event = this.event(),
        activity = this.store.activity();
      if (
        state.active &&
        (event.name === tutorialSteps[state.index]?.action ||
          activity.name === tutorialSteps[state.index]?.action)
      )
        this.complete();
    });
  }
  private read(): Progress {
    try {
      const state = JSON.parse(
        localStorage.getItem(key) ?? "null",
      ) as Progress | null;
      if (
        state &&
        typeof state.welcomed === "boolean" &&
        Number.isInteger(state.index) &&
        state.index >= 0 &&
        state.index <= tutorialSteps.length &&
        Array.isArray(state.completed) &&
        state.completed.every((id) => tutorialSteps.some((s) => s.id === id))
      )
        return {
          ...state,
          version: 2,
          index:
            state.version !== 2 &&
            state.index === 12 &&
            state.completed.includes("export") &&
            !state.completed.includes("resize")
              ? 11
              : state.index,
          active: false,
        };
    } catch {
      /* Start fresh after invalid local preferences. */
    }
    return { welcomed: false, index: 0, completed: [], active: false };
  }
  welcomeDone() {
    this.state.update((s) => ({ ...s, welcomed: true }));
  }
  start(restart = false) {
    this.welcomeDone();
    this.store.activity.set({ name: "", serial: this.store.activity().serial });
    this.event.set({ name: "", serial: this.event().serial });
    this.state.update((s) => ({
      ...s,
      active: true,
      index: restart || s.index >= tutorialSteps.length ? 0 : s.index,
      completed: restart ? [] : s.completed,
    }));
  }
  pause() {
    this.state.update((s) => ({ ...s, active: false }));
  }
  record(name: string) {
    this.event.update((e) => ({ name, serial: e.serial + 1 }));
  }
  complete() {
    const step = this.step();
    if (!step) return;
    this.event.set({ name: "", serial: this.event().serial });
    this.store.activity.set({ name: "", serial: this.store.activity().serial });
    this.state.update((s) => ({
      ...s,
      completed: [...new Set([...s.completed, step.id])],
      index: s.index + 1,
      active: s.index + 1 < tutorialSteps.length,
    }));
    if (this.state().index === tutorialSteps.length)
      this.store.notify(
        "First build complete. You can replay the tour from the Learning Center.",
      );
  }
  skip() {
    this.state.update((s) => ({
      ...s,
      index: s.index + 1,
      active: s.index + 1 < tutorialSteps.length,
    }));
  }
  back() {
    this.state.update((s) => ({ ...s, index: Math.max(0, s.index - 1) }));
  }
}

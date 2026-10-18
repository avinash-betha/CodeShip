import { type DocArticle, section as s } from "./docs-model";

export const startArticles: DocArticle[] = [
  {
    id: "introduction",
    title: "What is CodeShip?",
    category: "Getting Started",
    action: "canvas",
    intro:
      "CodeShip is an offline visual interface builder for Windows. Build an editable HTML/CSS design, inspect it at real viewport sizes, and export independent HTML, Angular or Next.js source for your application.",
    related: [
      "getting-started",
      "install-desktop",
      "visual-studio",
      "selective-export",
    ],
    sections: [
      s("workflow", "Understand the design-to-code workflow", [
        "A project contains pages, nested elements, CSS, local assets, saved blocks and supported interactions. Canvas editing and inspector controls update that document. Source edits join it when you choose Apply changes. The document remains editable after saving; source export creates a separate application artifact.",
        "Use primitive elements for precise structure, Components for reusable patterns, or Screen templates for a complete starting page. Preview runs supported interactions without edit outlines. Responsive analysis measures selected widths and proposes changes for review. Export scope determines whether you deliver a small component, one screen or all pages.",
      ]),
      s("boundaries", "Know which work belongs to your application", [
        "No account, hosted database or subscription is needed to design and save locally. Bundled forms, sign-in, billing and messaging screens use sample data and local demonstration behavior. Their appearance does not authenticate a user, charge a card or send a message.",
        "After exporting, use your application's router, data model and services. For example, replace a demo contact-form confirmation with a submit handler that validates input, calls your endpoint, and renders success/error state. The Angular, Next.js and HTML guides show how to install the source files before that integration.",
      ]),
      s("steps", "Choose a first task", [], {
        steps: [
          "For a new design, open the CodeShip logo, enter New project name and choose New project.",
          "Follow Building your first UI to create a small labeled form and learn selection, spacing and source edits.",
          "For an existing interface, choose Import and review the accepted HTML/CSS before replacing the active page.",
          "When the page is useful, Save now and export the appropriate region or screen. Keep a project backup as well as exported source.",
        ],
      }),
      s("ownership", "Keep editable projects and independent code", [
        "The native application uses permanent project folders, with readable project.codeship.json, assets and retained backups. Projects do not expire. Browser development uses IndexedDB instead; export project JSON before clearing browser data.",
        "Generated source contains the chosen design and supported behavior without the CodeShip editor runtime. Downloaded source is not a lossless replacement for the original project document: keep both when you need to continue visual editing. Open Docs from the header whenever you need a workflow, and bookmark articles for local reference.",
      ]),
    ],
  },
  {
    id: "getting-started",
    title: "Building your first UI",
    category: "Getting Started",
    action: "tutorial",
    intro:
      "Build a small contact screen with a heading, a labeled form and a responsive card. This tutorial teaches the complete path from project creation to preview, saving and a reusable export.",
    related: [
      "visual-walkthrough",
      "components",
      "forms-accessibility",
      "selective-export",
    ],
    sections: [
      s("before", "Prepare a safe starting page", [
        "Open an existing project or create one through the CodeShip logo > Your workspace. Add a page with the plus beside the page selector if the current page already contains work. This tutorial inserts elements; do not load a full screen template into a page you intend to keep.",
        "The guided tour can highlight controls and record completed actions. Use Next/Back to review, Skip for an optional action, and Pause/Resume or Restart as needed. Starting the tour keeps the current project; it does not silently reset the canvas.",
      ]),
      s(
        "workspace-map",
        "Find the panels you will use",
        [
          "Insert on the left supplies content, Layers exposes nested elements, Design on the right styles the selection, and the bottom CSS tab accepts complete rules. Toggle library panel or the inspector toggle restores a hidden side panel. The screenshot is an actual bundled screen illustrating these regions.",
        ],
        {
          image: {
            src: "/docs/desktop-settings.png",
            alt: "CodeShip workspace with library, settings design, inspector and source workspace.",
            caption:
              "The library, canvas and inspector operate on the same editable document.",
          },
        },
      ),
      s("steps", "Build and label the contact card", [], {
        steps: [
          "In Insert choose Add Container. Keep it selected and add a Heading; set Element text to Contact the team.",
          "Select the container again using Layers or the breadcrumb. Add a Paragraph and change its text to Tell us what you are working on.",
          "Under COMPONENTS set Component category to All, search Contact form and insert it into the container. Clear search when you need other entries.",
          "Select the outer container and set max-width:640px, width:100%, padding:24px and margin-inline:auto through Design or Custom CSS declarations. Use box-sizing:border-box.",
          "Select a field wrapper to set display:grid and gap:8px. Select the form's group container to set gap:24px. Edit labels and input attributes separately in HTML.",
          "Select the submit button's text node to change its wording. Select the button parent for padding/radius and use Icon Factory if it needs an icon.",
        ],
      }),
      s(
        "example",
        "Add a narrow-screen adjustment",
        [
          "Give the outer card the class contact-card in HTML > CSS classes. Append the following rule in CSS source and choose Apply changes. It reduces the card's edge padding on mobile without shrinking text or the preview scale.",
        ],
        {
          code: {
            language: "css",
            text: `.contact-card { box-sizing: border-box; width: 100%; max-width: 640px; margin-inline: auto; }
@media (max-width: 480px) { .contact-card { padding: 16px; } }`,
            caption:
              "The query responds to the actual viewport. Keep the existing page stylesheet when appending this rule.",
          },
        },
      ),
      s("preview", "Verify the result in preview", [
        "Choose Mobile in the canvas controls and confirm the heading, labels and button fit. Use Preview or Preview full screen to type into fields and test native validation. Return to Design before making selection edits. Run Responsive and review proposed CSS individually; a clean analysis still needs visual review.",
        "Expected result: one centered card that can shrink, readable labels above controls, consistent field gaps and a visible focus indicator. If the card overflows, inspect fixed widths and box-sizing. If the label changed in the wrong place, select the text node in Layers rather than the whole form.",
      ]),
      s("notes", "Save and export your first component", [
        "Open Your workspace, choose Save now and wait for All changes saved. Select the complete card and open Export code > Selected elements > Reusable component. Choose a framework, inspect its files/dependencies and download the ZIP or export to a native folder. The form's local confirmation is a demonstration; implement the actual submit endpoint in your destination application.",
      ]),
    ],
  },
  {
    id: "creating-projects",
    title: "Creating projects and pages",
    category: "Getting Started",
    action: "projects",
    intro:
      "Create a project to keep pages, styles, images and reusable blocks together. A native desktop project has a permanent folder; a page is a separate screen inside that same project.",
    related: ["projects", "getting-started", "templates", "document-format"],
    sections: [
      s("steps", "Create a named project", [], {
        steps: [
          "Click the CodeShip logo or project switcher to open Your workspace. If you have unapplied source edits, apply them before switching projects.",
          "Enter a descriptive name in New project name and choose New project. CodeShip saves the current project before switching; a save failure keeps its draft open.",
          "Wait for All changes saved. In the native app choose Show folder to inspect the actual project location.",
          "Use the plus beside the active page selector to add another page. Select a page from the dropdown before editing it or loading a screen template.",
          "Save now after your first content edit. Reopen the project from Your workspace to check that pages and assets are retained.",
        ],
      }),
      s("location", "Choose the default storage directory", [
        "Native projects default to Documents/CodeShip Projects. Application settings lets you choose a default project folder for future projects; existing projects remain at their original locations. Each project has its own project.codeship.json plus asset and backup directories. Use Show folder instead of guessing the generated folder name.",
        "In browser development, projects remain in that browser's IndexedDB storage and native folder controls are unavailable. Export project JSON for a portable backup. Browser data, installed-app profiles and project folders are separate stores.",
      ]),
      s("pages", "Choose the right project boundary", [
        "Keep related screens in one project when they share tokens, assets or a block library. Entire project export generates those screens together. Selected elements export extracts a region from the active screen; Current screen excludes other pages. Loading a screen template replaces the selected page, while inserting a component adds a subtree.",
      ]),
      s("notes", "Recover from creation or switching problems", [
        "If New project does not switch, inspect Save failed and fix the current project's disk permissions or use Save as… to rescue it in a new writable empty directory. Do not close an unsaved draft to force a switch. If you need an independent copy, use Save as… rather than moving a folder during autosave. Open project file accepts an existing .codeship.json document and validates it before use.",
      ]),
    ],
  },
  {
    id: "install-desktop",
    title: "Install CodeShip",
    category: "Getting Started",
    action: "settings",
    intro:
      "Install the Windows x64 desktop application and choose a permanent projects location. Installed users need no Node.js, pnpm, account or internet connection to use the bundled editor and documentation.",
    related: ["creating-projects", "projects", "fullscreen", "troubleshooting"],
    sections: [
      s("requirements", "Before installing", [
        "The supplied package targets Windows 10/11 x64. This beta is unsigned; use the build supplied by your trusted distributor and verify its release information. ARM64, other operating systems and every Windows version are not validated targets. Keep existing project folders backed up before testing an upgrade.",
      ]),
      s("install", "Install and open the editor", [], {
        steps: [
          "Run the supplied CodeShip-0.2.0-x64.exe installer. Choose the installation directory and shortcut options; the default is a per-user installation.",
          "Launch CodeShip from the Start menu or desktop shortcut. It opens in a normal window rather than forcing full screen.",
          "Open Application settings in the header. Choose your default project folder, then create a named project through the CodeShip logo.",
          "Choose Save now and Show folder to confirm the location. Open Docs from the header for the first-screen tutorial or start the guided tour.",
        ],
      }),
      s("portable", "Use the portable package when supplied", [
        "CodeShip-0.2.0-x64-portable.exe launches a portable application package without the installer workflow. It still needs writable storage for its profile and projects. Use Application settings and Show folder to confirm where your projects are stored; do not assume that copying only the portable EXE transfers project data.",
      ]),
      s("storage", "Keep preferences separate from project data", [
        "Settings/recent-project references normally live in the Windows application profile, while projects live in their chosen directories. Changing the default folder affects future projects. Existing projects keep their recorded locations. Deleting browser storage does not move native projects, and uninstalling CodeShip does not automatically delete your project folders.",
      ]),
      s("remove", "Update, uninstall and diagnose startup", [
        "Install a newer supplied build manually; no automatic updater is included. Retain project folders and exported project JSON before an update. Windows uninstall removes application files and shortcuts while leaving projects/settings; existing-install upgrades still need release-specific validation.",
        "If startup fails, record the Windows version, package name and visible error for support. Keep your project folders intact while diagnosing the problem. Using the installed application does not require development tools.",
      ]),
    ],
  },
  {
    id: "visual-walkthrough",
    title: "Your first screen: visual walkthrough",
    category: "Getting Started",
    action: "tutorial",
    intro:
      "Follow a visual route through project creation, a real editable form, device preview and reusable source export. Use this guide alongside Building your first UI when you want a map of how the steps connect.",
    related: ["getting-started", "components", "responsive", "angular"],
    sections: [
      s(
        "map",
        "Follow one local document from design to code",
        [
          "The editable document is the source of truth. Canvas and inspector edits change it immediately; HTML/CSS source changes join it after Apply changes. Preview and export use the applied document.",
        ],
        {
          image: {
            src: "/docs/workflow.svg",
            alt: "Create a project, build a layout, preview devices, save locally and export source code.",
            caption:
              "Every design and documentation step is available offline.",
          },
        },
      ),
      s("build", "Build a contact screen", [], {
        steps: [
          "Create a named project through the CodeShip logo. Add a Container, Heading and Paragraph from Insert.",
          "Select the container, search Contact form in COMPONENTS and insert it. Use Layers to edit a label separately from the input attributes.",
          "Select each field wrapper and use an 8px label/control gap. Set about 24px between field groups and padding around the outer card.",
          "Set the outer card width to 100%, max-width to 640px and box-sizing to border-box. Use a mobile padding rule instead of shrinking text.",
        ],
      }),
      s(
        "preview",
        "Review a real mobile viewport",
        [
          "Open Preview full screen and choose Mobile (375 × 812). Type in the form and inspect label spacing. Rotate it and try a custom intermediate width. The image shows an actual bundled Settings screen at mobile width, illustrating stacked labels and a bounded form rather than a squeezed desktop sidebar.",
        ],
        {
          image: {
            src: "/docs/mobile-settings.png",
            alt: "Actual CodeShip mobile settings preview with stacked labels and inputs.",
            caption:
              "The screenshot is a reading aid; use live preview to test your own long labels and interactions.",
          },
        },
      ),
      s("ship", "Save, extract and integrate", [], {
        steps: [
          "Return to the editor and Save now. Wait for All changes saved before switching projects.",
          "Select the complete card and choose Export code > Selected elements > Reusable component. Name it MyComponent and choose Angular, Next.js or HTML / CSS.",
          "Review the file tree, code and dependency warnings. Copy files or download/export the package.",
          "Follow the matching integration guide to place all template/style/assets files together, import the component and connect real submission behavior.",
        ],
      }),
      s("review", "Check the expected result", [
        "You should have an editable project, an independently exported card and a mobile layout that does not clip fields. If the export contains only a label, reselect the outer card before generating it. If a local confirmation worked but no data reached a server, implement submission in your application; the design's demonstration handler does not provide a remote service.",
      ]),
    ],
  },
];

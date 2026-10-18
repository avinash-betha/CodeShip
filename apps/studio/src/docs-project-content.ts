import { type DocArticle, section as s } from "./docs-model";

export const projectArticles: DocArticle[] = [
  {
    id: "projects",
    title: "Saving, reopening, backups and recovery",
    category: "Projects and Desktop",
    action: "projects",
    intro:
      "Keep your editable work in permanent local project folders. Use autosave for normal edits, Save as for an independent copy and retained backups for recovery; always check the save indicator before leaving a draft.",
    related: [
      "creating-projects",
      "document-format",
      "import-assets",
      "troubleshooting",
    ],
    sections: [
      s("storage", "Locate documents and application settings", [
        "Open the CodeShip logo > Your workspace. In the native app Show folder reveals the active project's directory. The default root is Documents/CodeShip Projects; each project contains project.codeship.json, local assets and retained backups. Application settings > Default project folder > Choose another folder changes the default for future projects, while existing projects keep their paths.",
        "Appearance offers Dark, Light or Follow system. Theme, panel/tutorial preferences and recent project references are stored in the application profile, normally under %APPDATA%/CodeShip on Windows. These preferences are separate from project content. The browser development version uses IndexedDB and does not expose the native folder commands.",
      ]),
      s("steps", "Save and reopen a project", [], {
        steps: [
          "Apply any pending HTML/CSS source draft. Autosave writes applied edits; source draft text is not yet the project.",
          "Open Your workspace and choose Save now, or use Ctrl+S. Wait for All changes saved. Saving, Unsaved or Save failed means the latest document is not yet confirmed on disk.",
          "Choose Open project file in the native app to select an existing .codeship.json, or select a recent project from Your workspace. The current save must succeed before switching.",
          "To make an independent copy, choose Save as… and a new empty writable directory. The copy receives a separate project identity and keeps the current applied document.",
          "Use Project JSON for a portable editable backup, and Export code separately for application source.",
        ],
      }),
      s("recovery", "Create a backup and recover a separate copy", [], {
        steps: [
          "Before a major import or screen replacement, open Your workspace and choose Create backup. Retain its reported local path.",
          "Choose Recover backup and select a valid backup document. Recovery creates a project with a new identifier and a recovered name rather than overwriting the damaged original.",
          "Inspect pages, styles and local assets in the recovered copy. Save now and use Show folder to locate it.",
          "If opening a damaged project offers recovery, use that path while keeping the original folder for diagnosis. Do not manually overwrite a file during an active save.",
        ],
      }),
      s(
        "failure",
        "Rescue a draft when saving fails",
        [
          "Keep the editor open when Save failed is shown. Check disk space, directory availability and write permissions, then retry Save now. Switching projects is blocked if saving the current one fails. Save as… to a new writable empty folder can rescue the draft even when its original destination is unavailable.",
          "Native writes are serialized and use temporary-file/flush/rename replacement. Retained backups are separate from session Undo. These mechanisms reduce partial-write risk, but they do not replace a copy on another disk or your own backup policy. Do not move the project's folder while it is actively saving.",
        ],
        {
          callout: {
            kind: "warning",
            title: "Keep unsaved work open",
            text: "A failed save is not a saved version. Use Save now after repairing the destination or Save as… to preserve the applied draft before closing the application.",
          },
        },
      ),
      s("transfer", "Move projects, duplicate and delete deliberately", [
        "For a native transfer, copy the entire project folder with its JSON, assets and backups after saving and closing it. Open project file on the destination machine. For a portable single-file transfer use Project JSON, which embeds the in-memory assets for editing import. Source ZIP exports serve a different purpose and omit editor-only metadata.",
        "Your workspace also provides Duplicate project and Delete project actions. Native deletion requires confirmation and uses the Recycle Bin; mixed external folders protect unrelated files by deleting only the project document when appropriate. Projects do not expire automatically. Uninstall removes the application while retaining projects/settings; keep your own backups before upgrades.",
      ]),
    ],
  },
  {
    id: "document-format",
    title: "Editable project format, tokens and assets",
    category: "Projects and Desktop",
    action: "projects",
    intro:
      "Understand what an editable project preserves and why native project JSON differs from an HTML or framework export. This helps you transfer designs without losing pages, reusable blocks or asset references.",
    related: ["projects", "selective-export", "advanced-css"],
    sections: [
      s("model", "What belongs to a project", [
        "A project has an id, schemaVersion, name, timestamps, pages, activePageId, tokens, assets, reusable components and metadata. Each page stores its path, nested element root and CSS source. Elements retain editor identifiers, attributes, text, children and supported interactions. Saved blocks retain a subtree plus CSS.",
        "Public HTML id/class attributes are editable design data. Internal node IDs connect selection, CSS selectors and interaction targets. Changing IDs in raw JSON can break those relationships; use the editor for ordinary structural changes and keep an original copy before a manual format experiment.",
      ]),
      s("steps", "Create a portable editing backup", [], {
        steps: [
          "Apply source drafts and Save now. Open Your workspace and choose Project JSON.",
          "Keep the downloaded .codeship.json with the project name/date in your backup location. Native folder copies also need assets and backups.",
          "To reopen the portable file, use Import > Import source file or project and choose the JSON, or the native Open project file workflow. The document is validated before use.",
          "Check page count, images and saved blocks after reopening. Do not treat a successful file download alone as proof that a backup can be restored.",
        ],
      }),
      s("tokens", "Use shared CSS variables intentionally", [], {
        code: {
          language: "css",
          text: `:root { --brand: #446b32; --space-card: 24px; --radius-card: 16px; }
.project-card {
  color: var(--brand); padding: var(--space-card); border-radius: var(--radius-card);
}`,
          caption:
            "Append these definitions in CSS source and assign project-card through HTML > CSS classes. Selection export retains required shared values conservatively.",
        },
      }),
      s("assets", "Know which files must travel together", [
        "Native persistence stores raster assets as content-hashed files and records relative references in JSON. The app hydrates those assets in memory; Project JSON includes the portable in-memory representation. For native folder transfer, copy the whole folder after saving. Remote asset URLs remain remote and are not downloaded automatically.",
        "Generated application source localizes referenced assets under the target's emitted asset directory and transforms HTML/CSS to the chosen framework. It does not preserve the full visual editing document. Keep project JSON/folders for future editor work and source exports for integration.",
      ]),
      s("repair", "Respond to format validation errors", [
        "If import rejects a file, retain the original and read the error. Check that it is a CodeShip project rather than an arbitrary JSON file or a source ZIP. A truncated document may require Recover backup; manually removing validation is not a repair. Keep the error message and project version when reporting a format problem to support.",
      ]),
    ],
  },
  {
    id: "import-assets",
    title: "Import HTML, CSS and local assets",
    category: "Projects and Desktop",
    action: "import",
    intro:
      "Bring an existing HTML/CSS design into the editable model or add local images and SVGs. Review the replacement boundary first: an HTML import replaces the active page, while a CSS-only import replaces its applied stylesheet.",
    related: ["projects", "html-elements", "icons", "advanced-css"],
    sections: [
      s("before", "Protect the page you already have", [
        "Save and Create backup before a substantial import. Add a new page if the current page must remain intact. Header Import opens separate Import HTML source and Import CSS source fields, plus Import source file or project. Opening the dialog alone changes nothing; Import into page performs the replacement.",
        "A .codeship.json file uses the editable-project open workflow rather than HTML conversion. A .html file fills the HTML field and a .css file fills the CSS field. Imported application JavaScript is not executed or reconstructed as editable logic.",
      ]),
      s("steps", "Import a small card", [], {
        steps: [
          "Choose Import. Paste the HTML below into Import HTML source and its CSS into Import CSS source, or load your own source files.",
          "Choose Import into page. Review any report about removed/unsupported content and inspect the new tree in Layers.",
          "Check the CSS tab and Diagnostics, then open Mobile and Preview. Review widths, IDs and links before saving.",
          "Use Undo if the result replaced the wrong page. Save now when the converted document is the version you want to retain.",
        ],
      }),
      s("example", "Use semantic source with bounded layout", [], {
        code: {
          language: "html",
          text: `<section class="import-card" aria-labelledby="import-title">
  <h1 id="import-title">Project updates</h1>
  <p>Review this week's changes with your team.</p>
  <a href="#details">Read details</a>
</section>`,
          caption:
            "HTML field. Provide a real #details destination when extending this example.",
        },
      }),
      s("css", "Keep the matching stylesheet", [], {
        code: {
          language: "css",
          text: `.import-card {
  box-sizing: border-box; width: 100%; max-width: 640px;
  margin-inline: auto; padding: 24px; border: 1px solid #d7dfd6; border-radius: 16px;
}
@media (max-width: 480px) { .import-card { padding: 16px; } }`,
          caption:
            "CSS field. A CSS-only import applies this as the active page stylesheet, so retain unrelated existing rules yourself if needed.",
        },
      }),
      s("local", "Add portable raster images and vectors", [
        "Open Assets in the left library and use Upload image assets for supported local raster images up to 5MB each. Insert the image, set useful alt text in HTML and use max-width:100%; height:auto for proportional scaling. Native projects retain immutable hashed asset files; source exports include referenced local assets.",
        "Use Icon Factory > Import SVG or SVG source > Apply SVG source for sanitized vector shapes/gradients. Unsafe or unsupported SVG is rejected with an explanation. For custom vectors, edit per-layer colors/transforms in Vector studio rather than relying on disabled collection style controls.",
      ]),
      s("limitations", "Understand conversion limits", [
        "Scripts, unsafe event handlers/URLs and executable CSS are removed or rejected. Angular directives, React state and custom-element implementations do not become working application code simply by importing their HTML output. Keep original source for comparison and reimplement supported interactions deliberately.",
        "Remote image/font URLs need network access and destination configuration; they are not automatically bundled for offline use. For accurate responsive analysis of an external design, import its actual HTML together with CSS. Styling the current unrelated page with CSS alone does not recreate the external layout.",
      ]),
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting designs, saves and exports",
    category: "Projects and Desktop",
    action: "code",
    intro:
      "Start with the visible symptom, save state and applied source. Preserve the current draft while diagnosing the cause, and use document diagnostics, a real viewport and exported files to narrow the problem.",
    related: ["projects", "responsive", "css-studio", "selective-export"],
    sections: [
      s("save", "The latest work is not saved", [
        "Save failed: keep the editor open, check free disk space, permissions and destination availability, then retry Save now. Use native Save as… to a new empty writable folder when the original destination cannot be repaired. Do not clear application/browser storage to resolve a disk write failure.",
        "All changes saved but source text seems missing: check for an unapplied HTML/CSS draft. Apply changes before Save now; formatting and copying a draft do not commit it. For damaged project JSON use Recover backup as a separate project and retain the original.",
      ]),
      s("mobile", "Mobile content is clipped", [
        "Confirm the viewport width, not the displayed zoom. Inspect the affected node in Layers and Design for fixed width, min-width, nowrap, desktop grid spans, absolute positions and fixed heights. Use minmax(0,1fr) for flexible tracks, min-width:0 for shrinking items, and a scroll region for genuinely wide tables.",
        "Run Responsive, use Select affected element and Review CSS changes, then Preview before applying a recommendation. Test custom widths between presets; the analyzer samples seven widths rather than proving every possible size.",
      ]),
      s("styles", "A property or reset appears ineffective", [
        "Check CSS interactive state and Responsive style context. Hover/mobile rules do not match every preview. Inspector values are scoped declarations, not a computed-style dump. Look for inherited/library styles, higher-specificity rules and !important in CSS source.",
        "Reset draft clears custom-property entry fields only. Reset CSS property removes one scoped declaration and may expose an inherited/default value. Undo restores a document edit; Discard abandons a source draft. If Monaco cannot initialize, the source workspace offers a plain-text fallback rather than losing the document.",
      ]),
      s("behavior", "A button or form does not act", [
        "Design mode selects elements. Switch to Preview to activate supported behavior and native form validation. Check the HTML interaction event, action and target ID, and include the target in an extracted export. A sample success message does not prove a remote submission; implement the endpoint and application state in the exported app.",
      ]),
      s("export", "The destination app differs from preview", [
        "Missing image: check emitted asset files and request URLs. Missing style: retain CSS/token/keyframe files and identifiers. Unknown Angular element: import the actual standalone class and use its selector. Missing Next.js module: copy the CSS Module beside the TSX and preserve its import path.",
        "Review the destination's global CSS and containing width. Keep generated framework lifecycle code unless replacing its behavior completely. Use the exported application's package.json scripts to build it, then check the route and browser console for the first reported error.",
      ]),
      s("report", "Make a problem reproducible", [
        "Record the app/package version, Windows/browser version, action sequence, save indicator and exact visible error. Keep a minimal project copy and include the relevant HTML/CSS or exported file names. Remove private content before sharing a reproduction; preserve your original project locally while testing fixes.",
      ]),
    ],
  },
  {
    id: "faq",
    title: "Frequently asked questions",
    category: "Projects and Desktop",
    action: "projects",
    intro:
      "Answers about offline use, ownership, storage, reusable designs and the difference between a visual prototype and a connected application. Follow the linked workflow guides when you need exact controls.",
    related: ["projects", "components", "selective-export", "install-desktop"],
    sections: [
      s("offline", "Do I need an account or internet?", [
        "The installed editor, documentation, icons and local project operations work offline without an account. Initial source dependency installation and packaging downloads need a network. Remote URLs that you add to a design can still need internet; import local assets for a portable offline result.",
      ]),
      s("ownership", "Can I edit and use the exported source?", [
        "Yes. HTML/CSS/JS and framework source are independent of the CodeShip editor runtime. A reusable Angular export uses standalone component files; Next.js uses TSX/CSS Modules. Keep the generated files and referenced assets together. Exported code edits do not automatically synchronize back to the visual document.",
      ]),
      s("services", "Does a login, chat or billing screen provide a service?", [
        "No. These screens demonstrate local UI and supported sample interactions. A login screen needs your authentication flow, a chat needs message storage/transport, and billing needs your payment integration. Replace the demonstration handlers and provide loading/error states in the destination application rather than treating a local confirmation as a service response.",
      ]),
      s("storage", "Where are projects, and do they expire?", [
        "Native projects default to Documents/CodeShip Projects; use Your workspace > Show folder to locate one. Application settings changes the default for future projects. Projects do not expire. Native deletion requires explicit confirmation; uninstall does not automatically remove project data. Browser development projects live in IndexedDB and need a JSON backup before browser data is cleared.",
      ]),
      s("blocks", "Do reusable block edits update every copy?", [
        "Saved blocks are project-local snapshots. Inserting a block remaps IDs and makes an independent copy with its required styles. Editing one instance does not automatically propagate to existing copies. Save a new block version and intentionally replace/reinsert instances when you need a consistent update.",
      ]),
      s("preview", "Why does shrinking zoom not fix mobile?", [
        "Zoom scales the artboard display; viewport width controls CSS layout. Use a real Mobile viewport, remove fixed desktop constraints or add responsive rules, then inspect an intermediate custom width. Responsive recommendations require review and do not infer the business priority of each region.",
      ]),
      s("restore", "How do I protect work before an import?", [
        "Apply source drafts, Save now and Create backup. HTML import and loading a screen template replace the active page. Use a new page for experiments or Undo in the same session. For later recovery, Recover backup opens a separate project. Keep the entire native folder for transfer, or use Project JSON for a portable editable backup.",
      ]),
    ],
  },
];

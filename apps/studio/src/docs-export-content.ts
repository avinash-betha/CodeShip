import { type DocArticle, section as s } from "./docs-model";

export const exportArticles: DocArticle[] = [
  {
    id: "selective-export",
    title: "Selective Code Export",
    category: "Code Export",
    action: "export",
    intro:
      "Export the smallest complete unit your destination needs: selected elements, a screen, chosen screens or the whole project. Scope chooses content; output format chooses the package shape; framework chooses the generated source syntax.",
    related: ["angular", "nextjs", "html", "document-format"],
    sections: [
      s("before", "Prepare the applied document", [
        "Apply or discard any HTML/CSS source draft first, then save the project. Exports read the applied document, not uncommitted Monaco text. Select the outer container for a reusable region; Shift-click can select multiple roots on the active page. Nested selected roots are deduplicated.",
      ]),
      s("steps", "Generate and inspect an export", [], {
        steps: [
          "Choose Export code in the header. Set Export scope to Selected elements, Current screen, Choose screens or Entire project. For Choose screens select the pages you intend to include.",
          "Set Output format to Snippet, Reusable component, Standalone screen or Complete project. For reusable output enter Export component name, for example MyComponent.",
          "Choose HTML / CSS, Angular or Next.js. Scope and output defaults help select a component for a selection and a project for multiple pages; review both controls explicitly.",
          "Read the summary and dependency warnings. Open files in the preview tree, inspect formatted source and use Copy file if you need just that file.",
          "Use the contextual download button for a ZIP archive, even for a component export. In the native app Export to folder creates a separate output folder and Show exported folder reveals it.",
          "Integrate the files with the matching framework guide. Build the destination application and check assets, focus, interactions and responsive layout there.",
        ],
      }),
      s("formats", "Understand output shapes", [
        "Snippet and Reusable component extract one screen's content through the component exporter. HTML Snippet makes index.html a fragment, while HTML Reusable component wraps it in a standalone document. Angular and Next.js produce component files for these modes. Standalone screen uses the target's full screen/project scaffolding for one page; Complete project includes all chosen pages and target configuration.",
        "Several pages cannot silently become one snippet, component or standalone screen. Choose a single page or use Complete project. Selected elements can include multiple sibling roots from one page, but the complete interaction context may require their common parent.",
      ]),
      s("dependencies", "Review CSS, tokens, assets and interactions", [
        "Selection extraction retains required CSS, responsive/media/container rules, tokens, keyframes and local assets conservatively. It includes supported interactions attached to retained elements. An interaction target outside the selection produces a warning: include it or deliberately replace that behavior in the destination.",
        "Complex ancestor selectors can depend on structure outside the extracted region. Inspect warnings and retained CSS; move a critical style onto the component's own root or export its surrounding layout. Remote URLs are not fetched automatically. Local assets are emitted under assets/ for HTML and public/assets/ for framework outputs; keep the generated reference paths.",
      ]),
      s("example", "Choose a scope for a practical handoff", [
        "For a settings card inside an existing app: select the complete card, use Selected elements + Reusable component, and choose Angular or Next.js. For a static two-page site: choose Entire project + Complete project + HTML / CSS. For an independently runnable Angular screen: choose Current screen + Standalone screen + Angular and use its generated package scripts.",
      ]),
      s("notes", "Troubleshoot incomplete output", [
        "Only a label exported: select the outer card in Layers and regenerate. Disabled or invalid multi-page output: use Complete project. Missing styles: include retained CSS/token definitions and examine destination overrides. Missing images: copy the emitted asset directories and preserve URL paths. Broken local behavior: retain script.js or framework lifecycle code and its targets.",
        "Project JSON is a separate editable backup, not one of the framework source formats. Exporting code does not modify the native project, and changing exported files does not synchronize those edits back into the canvas. Retain both artifacts when you need further visual editing.",
      ]),
    ],
  },
  {
    id: "angular",
    title: "Angular Integration",
    category: "Code Export",
    action: "export",
    intro:
      "Install a reusable CodeShip export inside an existing Angular application, or use a complete generated Angular project. Reusable exports provide a standalone component with its HTML template and scoped stylesheet kept as separate files.",
    related: ["selective-export", "forms-accessibility", "html", "nextjs"],
    sections: [
      s("before", "Choose reusable output for an existing application", [
        "Open Export code, choose Selected elements and Reusable component, select Angular and keep the name MyComponent for this example. The reusable README targets Angular 21+ standalone components. Use the destination's existing dependency/lockfile policy; a complete generated project supplies its own Angular 21 package configuration.",
        "For MyComponent the exact files are my-component.component.ts, my-component.component.html and my-component.component.css, plus README.md and any public/assets files. The class is MyComponentComponent and the selector is app-my-component. A different export name changes those names; read the generated TypeScript rather than guessing.",
      ]),
      s("steps", "Place the generated files", [], {
        steps: [
          "Download the component ZIP and extract it. Copy the three my-component.component files together into src/app/components/my-component/ in your Angular app.",
          "Copy exported public/assets content into your application's public/assets location, preserving referenced paths. Check angular.json if your destination uses a custom asset-copy setup.",
          "In the consuming standalone component import MyComponentComponent from the generated TypeScript path and add it to imports.",
          "Place <app-my-component /> in the consuming template. Build using your existing application's build command and open its route.",
          "Check both a mobile width and the actual containing panel width. Save the CodeShip project separately for later design edits.",
        ],
      }),
      s("example", "Render the export from a standalone component", [], {
        code: {
          language: "typescript",
          text: `import { Component } from '@angular/core';
import { MyComponentComponent } from './components/my-component/my-component.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyComponentComponent],
  template: '<main><app-my-component /></main>',
})
export class AppComponent {}`,
          caption:
            "Example consuming file: src/app/app.component.ts. Keep the generated HTML and CSS beside my-component.component.ts so templateUrl/styleUrl resolve.",
        },
      }),
      s("behavior", "Integrate routing, state and form services", [
        "Generated interaction listeners query within the component host and use an AbortController that is aborted on destroy. Preserve that lifecycle code while using the demonstrations. When replacing it with Angular bindings, remove the corresponding generated listener too so one action does not run twice.",
        "For a contact form, create a component submit method and service call, bind field values using your chosen Angular form approach, and render pending/error/success state. Import the relevant forms/router modules or standalone directives in the destination when you introduce them; the static export does not create those services. Replace sample route links with your application's route configuration.",
      ]),
      s("project", "Run a complete generated Angular project", [], {
        code: {
          language: "powershell",
          text: `# In a NEW directory containing the exported package.json:
npm install
npm run build
npm start`,
          caption:
            "These are the generated application's scripts, not commands for launching CodeShip. Use a Node runtime compatible with the emitted Angular dependencies. Inspect package.json and README.md in the actual ZIP.",
        },
      }),
      s("notes", "Resolve Angular integration failures", [
        "Unknown element: confirm the generated selector and add the component to the consuming imports. Missing template/style: keep all three files together and preserve relative paths. Missing image: request its emitted /assets path in the browser and check your build's public asset configuration.",
        "Unexpected CSS: exported root/html/body rules are adjusted to :host for reusable output, but inherited destination rules and surrounding dimensions still matter. Missing behavior after navigation: retain host-scoped initialization/cleanup or replace it completely with Angular state. Custom element markup requires the real element implementation in your app; a schema only permits its syntax.",
      ]),
    ],
  },
  {
    id: "nextjs",
    title: "Next.js Integration",
    category: "Code Export",
    action: "export",
    intro:
      "Use an exported TSX component and CSS Module in an existing Next.js App Router application. Static components remain server-renderable; supported browser interactions add a client boundary and scoped effect cleanup.",
    related: [
      "selective-export",
      "angular",
      "forms-accessibility",
      "responsive",
    ],
    sections: [
      s("before", "Inspect the generated component contract", [
        "Choose Selected elements + Reusable component + Next.js in Export code. With the default MyComponent name, the files are MyComponent.tsx, MyComponent.module.css and README.md, plus referenced public/assets and custom-elements.d.ts when custom tags require it. The reusable output targets React 19 / Next.js App Router. Complete projects include the actual Next.js 16 package configuration.",
        "Keep the TSX and CSS Module together. The module creates a local root and wraps descendant selectors using :global beneath it; do not rename or remove its imported root class without updating the component. Do not replace it with an arbitrary global stylesheet.",
      ]),
      s("steps", "Install it in an App Router route", [], {
        steps: [
          "Copy MyComponent.tsx and MyComponent.module.css into a components directory beside your app directory. Copy a generated custom-elements.d.ts into a location included by your TypeScript configuration if present.",
          "Copy the contents of exported public/assets into your app's public/assets, retaining paths. Public file URLs start at /assets, not /public/assets.",
          "Create app/dashboard/page.tsx with the import below, or render the component from an existing page.",
          "Keep a generated 'use client' directive when the export contains interactions. A server page can render that client component without itself becoming a client component.",
          "Run your application's build and development scripts. Check the rendered route, browser console, mobile layout and repeated mount/unmount behavior.",
        ],
      }),
      s("example", "Render the component in a page", [], {
        code: {
          language: "tsx",
          text: `import MyComponent from '../../components/MyComponent';

export default function DashboardPage() {
  return <main><MyComponent /></main>;
}`,
          caption:
            "File: app/dashboard/page.tsx, with components/MyComponent.tsx beside app/. If your app lives under src/, keep both directories under src/ or adjust the import accordingly.",
        },
      }),
      s("behavior", "Replace sample behavior with application state", [
        "Interactive output initializes listeners inside useEffect using a host ref and aborts them on unmount. Preserve that code for the bundled interactions. When converting a widget to React state/props, remove its corresponding generated listener to avoid duplicate changes and DOM mutations competing with React.",
        "Replace sample table rows with application data, connect navigation to your route scheme, and implement form submission using your chosen server action or client request. Include loading/error messages and validation rather than leaving the demonstration confirmation as a service result. Static exports contain no remote data service.",
      ]),
      s("project", "Run a complete generated Next.js project", [], {
        code: {
          language: "powershell",
          text: `# In the extracted complete project, beside package.json:
npm install
npm run build
npm start`,
          caption:
            "Use the generated scripts and dependency versions for the exported application. For live development use npm run dev when present in its package.json.",
        },
      }),
      s("notes", "Diagnose module, asset and hydration issues", [
        "Cannot find module: check path/case and copy the matching .module.css file. Image 404: preserve public/assets and root-relative references. Browser API error in a server component: retain the generated client boundary and keep browser work in its effect.",
        "Hydration or duplicate interaction issues: compare your edits with the original TSX, avoid document-wide handlers, and choose one state owner for each widget. Test the actual containing width; a viewport media query does not respond to an embedded panel's width unless a container query is used.",
      ]),
    ],
  },
  {
    id: "html",
    title: "HTML/CSS Integration",
    category: "Code Export",
    action: "export",
    intro:
      "Export ordinary HTML and CSS for a static page or embed a selected region in an existing site. JavaScript is included only when supported interactions require it; static markup has no CodeShip runtime dependency.",
    related: ["selective-export", "import-assets", "advanced-css", "projects"],
    sections: [
      s("formats", "Know whether index.html is a fragment or a page", [
        "Selected elements + Snippet produces an HTML fragment in index.html, styles.css, README.md and script.js when needed. Reusable component wraps the selected region in a complete document. Screen/project modes generate complete pages; the active page becomes index.html with styles.css, and other pages receive path-derived HTML/CSS names. Read the file tree rather than assuming every screen is named index.",
      ]),
      s("steps", "Embed a snippet in an existing page", [], {
        steps: [
          "Export Selected elements + Snippet + HTML / CSS. Extract the ZIP into a staging directory and inspect index.html.",
          "Paste the fragment inside the appropriate region of your existing document. Do not paste a second doctype/html/head/body wrapper inside it.",
          "Link the generated styles.css once and include script.js with defer only when it exists.",
          "Copy assets and update URL prefixes consistently if moving the component under another directory. CSS url() paths resolve relative to the stylesheet; markup paths resolve relative to the document.",
          "Load the page and test the supported controls, focus order, mobile layout and any links. Save the editable CodeShip project separately.",
        ],
      }),
      s("example", "Link the generated resources", [], {
        code: {
          language: "html",
          text: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Contact</title>
    <link rel="stylesheet" href="./codeship/styles.css" />
  </head>
  <body>
    <main><!-- Insert the exported HTML fragment here. --></main>
    <script src="./codeship/script.js" defer></script>
  </body>
</html>`,
          caption:
            "This destination document assumes CSS/JS in codeship/. Include the script only if generated, and retain the fragment's data-cs-id attributes used by its scoped styles and interactions.",
        },
      }),
      s("standalone", "Use a complete static export", [
        "Extract the complete package with its assets and open index.html for a static check. Serve the directory with your existing static development server when adding fetch, modules or deployment-specific routing. Other emitted pages use their actual filenames; link to those files for a static host unless your host supplies rewrites.",
        "The JavaScript implements the chosen supported interactions, not a database or authentication service. Replace a demo submit confirmation with your endpoint request and status handling. Keep secrets on your server rather than adding them to public HTML or JavaScript.",
      ]),
      s("notes", "Resolve styling and behavior conflicts", [
        "Missing styles usually mean a broken stylesheet path, removed data-cs-id/class attributes or destination cascade overrides. Missing images need both the file and a correct reference. If copying more than one component, check public IDs and shared global token names for collisions.",
        "If interaction controls do nothing, keep script.js and its targets, ensure it loads after the markup, and check the browser console. If you replace that behavior with your own code, remove the old handler to avoid duplicate actions. CodeShip source import can read HTML/CSS back into a design but cannot reconstruct arbitrary application JavaScript or original editor metadata.",
      ]),
    ],
  },
];

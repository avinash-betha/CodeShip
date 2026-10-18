import { baseCss, libraryCss } from "./template-styles";
import { makeIcon } from "../icon-factory";
import { modernComponents } from "./modern";
import { modernScreens } from "./screens";
export { baseCss, libraryCss } from "./template-styles";
import {
  createProject,
  element as e,
  type ElementNode,
  type Project,
} from "../document-model";
export interface LibraryEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  create: () => { root: ElementNode; css: string };
}
const styled = (
  tag: string,
  text: string,
  classes: string,
  children: ElementNode[] = [],
  attrs: Record<string, string> = {},
) => e(tag, text, { class: classes, ...attrs }, children);
const button = (text: string, classes = "f-button") =>
  styled("button", text, classes, [], { type: "button" });
const icon = (name: string) => {
  const node = makeIcon(name, { size: 20, color: "#62804d" });
  node.attributes.class = "cs-template-icon";
  return node;
};
const field = (label: string, attrs: Record<string, string>, helper = "") =>
  styled("label", "", "cs-field", [
    e("span", label),
    e("input", "", { "aria-label": label, ...attrs }),
    ...(helper ? [styled("small", helper, "cs-helper")] : []),
  ]);
export const primitives: {
  tag: string;
  name: string;
  icon: string;
  category: string;
  text?: string;
  attributes?: Record<string, string>;
}[] = [
  { tag: "div", name: "Container", icon: "box", category: "Layout" },
  { tag: "section", name: "Section", icon: "layout", category: "Layout" },
  {
    tag: "div",
    name: "Flex row",
    icon: "columns",
    category: "Layout",
    attributes: { class: "cs-flex" },
  },
  {
    tag: "div",
    name: "Grid",
    icon: "grid",
    category: "Layout",
    attributes: { class: "cs-grid" },
  },
  {
    tag: "h1",
    name: "Heading",
    icon: "heading",
    category: "Text",
    text: "Your next great idea",
  },
  {
    tag: "p",
    name: "Paragraph",
    icon: "text",
    category: "Text",
    text: "A little space for something meaningful. Tell your story here.",
  },
  {
    tag: "span",
    name: "Text span",
    icon: "type",
    category: "Text",
    text: "Label",
  },
  {
    tag: "a",
    name: "Link",
    icon: "link",
    category: "Text",
    text: "Learn more",
    attributes: { href: "#" },
  },
  {
    tag: "button",
    name: "Button",
    icon: "pointer",
    category: "Forms",
    text: "Get started",
    attributes: { type: "button" },
  },
  {
    tag: "input",
    name: "Input",
    icon: "input",
    category: "Forms",
    attributes: {
      placeholder: "Enter your email",
      type: "email",
      "aria-label": "Email address",
    },
  },
  {
    tag: "label",
    name: "Label",
    icon: "tag",
    category: "Forms",
    text: "Field label",
  },
  {
    tag: "textarea",
    name: "Text area",
    icon: "text",
    category: "Forms",
    attributes: { placeholder: "Your message", "aria-label": "Message" },
  },
  {
    tag: "select",
    name: "Select",
    icon: "chevron",
    category: "Forms",
    attributes: { "aria-label": "Choose option" },
  },
  { tag: "form", name: "Form", icon: "form", category: "Forms" },
  {
    tag: "img",
    name: "Image",
    icon: "image",
    category: "Media",
    attributes: {
      src: "",
      alt: "Describe this image",
      width: "320",
      height: "200",
    },
  },
  {
    tag: "video",
    name: "Video",
    icon: "play",
    category: "Media",
    attributes: { controls: "" },
  },
  {
    tag: "audio",
    name: "Audio",
    icon: "music",
    category: "Media",
    attributes: { controls: "" },
  },
  { tag: "nav", name: "Navigation", icon: "menu", category: "Semantic" },
  { tag: "header", name: "Header", icon: "panel", category: "Semantic" },
  { tag: "footer", name: "Footer", icon: "panel", category: "Semantic" },
  { tag: "article", name: "Article", icon: "file", category: "Semantic" },
  { tag: "aside", name: "Aside", icon: "sidebar", category: "Semantic" },
  { tag: "ul", name: "List", icon: "list", category: "Content" },
  { tag: "table", name: "Table", icon: "table", category: "Content" },
  { tag: "hr", name: "Divider", icon: "minus", category: "Content" },
  { tag: "details", name: "Accordion", icon: "chevron", category: "Content" },
];
export function primitive(
  tag: string,
  text = "",
  attrs: Record<string, string> = {},
): ElementNode {
  const node = e(tag, text, attrs);
  if (tag === "table")
    node.children = [
      e("tbody", "", {}, [
        e("tr", "", {}, [e("th", "Name"), e("th", "Status")]),
        e("tr", "", {}, [e("td", "New item"), e("td", "Active")]),
      ]),
    ];
  if (tag === "ul" || tag === "ol")
    node.children = [e("li", "First item"), e("li", "Second item")];
  if (tag === "select")
    node.children = [
      e("option", "Select an option", { value: "" }),
      e("option", "Option one", { value: "one" }),
    ];
  if (tag === "details")
    node.children = [
      e("summary", "More information"),
      e("p", "Add your content here."),
    ];
  return node;
}
function nav(): ElementNode {
  return styled(
    "nav",
    "",
    "f-nav",
    [
      styled("a", "forma.", "f-brand", [], { href: "#home" }),
      styled("div", "", "f-links", [
        styled("a", "Features", "", [], { href: "#features" }),
        styled("a", "Our story", "", [], { href: "#story" }),
        styled("a", "Contact", "", [], { href: "mailto:hello@example.com" }),
      ]),
      button("Get started ↗"),
    ],
    { "aria-label": "Main navigation" },
  );
}
function workspace(): ElementNode {
  const columns = [
    [
      "TO DO · 3",
      ["Brand exploration", "Research", "Explore a fresh direction"],
      ["Website wireframes", "Design", "Make space for what matters"],
    ],
    [
      "IN PROGRESS · 2",
      ["Design system", "Design", "A shared language for our team"],
      ["Customer interviews", "Research", "Listen. Learn. Make it better."],
    ],
    [
      "DONE · 4",
      ["Project kickoff", "Planning", "Great things start with a plan"],
      ["Team workspace", "Product", "One home for every idea"],
    ],
  ];
  return styled("div", "", "f-preview", [
    styled("div", "", "f-workspace", [
      styled("aside", "", "f-side", [
        styled("p", "forma.", "f-side-title"),
        ...[
          ["home", "Overview"],
          ["grid", "My workspace"],
          ["clock", "Activity"],
          ["users", "Team members"],
        ].map(([name, label], i) =>
          styled("div", "", `f-side-item ${i === 1 ? "f-side-active" : ""}`, [
            icon(name),
            e("span", label),
          ]),
        ),
      ]),
      styled("div", "", "f-board", [
        styled("div", "", "f-board-top", [
          styled("h3", "Brand & website", "f-board-title"),
          styled("span", "", "f-board-label", [
            icon("users"),
            e("span", "Share board"),
          ]),
        ]),
        styled(
          "p",
          "A little more clarity. A lot more possibility.",
          "f-board-caption",
        ),
        styled(
          "div",
          "",
          "f-board-columns",
          columns.map((col) =>
            styled("div", "", "", [
              styled("p", col[0] as string, "f-column-title"),
              ...col
                .slice(1)
                .map((card) =>
                  styled("article", "", "f-card", [
                    styled("span", card[1], "f-card-tag"),
                    e("h4", card[0]),
                    e("p", card[2]),
                    styled("div", "", "f-card-footer", [
                      icon("users"),
                      e("span", "2 updates"),
                    ]),
                  ]),
                ),
            ]),
          ),
        ),
      ]),
    ]),
  ]);
}
function landing(): ElementNode {
  const root = e("main", "", { id: "home" }, [
    nav(),
    styled("section", "", "f-hero", [
      styled("span", "✦  A calmer way to create, together", "f-eyebrow"),
      styled("h1", "Make room for your next big idea.", "f-heading"),
      styled(
        "p",
        "Bring your projects, people, and possibilities into one thoughtful workspace. Less friction. More flow.",
        "f-description",
      ),
      styled("div", "", "f-actions", [
        button("Start building for free ↗"),
        button("See how it works", "f-button f-secondary"),
      ]),
      styled("p", "Free to start. No credit card needed.", "f-note"),
      workspace(),
    ]),
    styled("section", "", "f-logos", [
      e("p", "A little more organized. A lot more inspired."),
      styled(
        "div",
        "",
        "f-logo-row",
        ["Layers", "◈ Quotient", "Circooles", "Sisyphus", "⊕ Catalog"].map(
          (s) => e("span", s),
        ),
      ),
    ]),
    styled(
      "section",
      "",
      "f-features",
      [
        e("h2", "Good work starts with a little clarity."),
        styled(
          "div",
          "",
          "f-feature-grid",
          [
            [
              "Everything, together",
              "Your ideas, tasks, and conversations. One home for your best work.",
            ],
            [
              "Room to grow",
              "A flexible workspace that fits your team, today and tomorrow.",
            ],
            [
              "Built for your flow",
              "Thoughtful tools that get out of your way. Make progress feel natural.",
            ],
          ].map(([title, text]) =>
            styled("article", "", "f-feature", [
              icon("spark"),
              e("h3", title),
              e("p", text),
            ]),
          ),
        ),
      ],
      { id: "features" },
    ),
    styled("footer", "", "f-footer", [
      e("span", "forma.  © 2026"),
      e("span", "Made for thoughtful teams."),
    ]),
  ]);
  root.name = "Landing page";
  return root;
}
function table(kind: string): ElementNode {
  const names =
    kind === "Products"
      ? ["Studio desk", "Canvas tote", "Everyday notebook", "Arc table lamp"]
      : ["Olivia Rhye", "Phoenix Baker", "Lana Steiner", "Demi Wilkinson"];
  return styled(
    "div",
    "",
    "s-table-scroll",
    [
      e("table", "", {}, [
        e("thead", "", {}, [
          e(
            "tr",
            "",
            {},
            ["Name", "Email / SKU", "Status", "Role / Category"].map((s) =>
              e("th", s, { scope: "col" }),
            ),
          ),
        ]),
        e(
          "tbody",
          "",
          {},
          names.map((s, i) =>
            e(
              "tr",
              "",
              {},
              [
                s,
                kind === "Products"
                  ? `PRD-00${i + 1}`
                  : `${s.split(" ")[0].toLowerCase()}@example.com`,
                "Active",
                kind === "Employees"
                  ? "Engineering"
                  : kind === "Products"
                    ? "Workspace"
                    : "Member",
              ].map((t) => e("td", t)),
            ),
          ),
        ),
      ]),
    ],
    { role: "region", "aria-label": "Scrollable records", tabindex: "0" },
  );
}
function screen(kind: string): ElementNode {
  const main: ElementNode[] = [
    styled("p", "WORKSPACE / " + kind.toUpperCase(), "s-kicker"),
    e("h1", kind),
    styled("p", `A clear view of your ${kind.toLowerCase()}.`, "s-sub"),
  ];
  if (["Dashboard", "Analytics", "Admin panel"].includes(kind))
    main.push(
      styled(
        "div",
        "",
        "s-grid",
        [
          ["Total revenue", "$48,295", "↑ 12.5% this month"],
          ["Active projects", "24", "↑ 4 new projects"],
          ["Team members", "128", "↑ 8 this month"],
        ].map(([label, value, change], i) =>
          styled("article", "", "s-card", [
            icon(["wallet", "folder", "users"][i]),
            e("p", label),
            e("h2", value),
            e("small", change),
          ]),
        ),
      ),
    );
  if (kind === "Settings" || kind === "Forms")
    main.push(
      styled("section", "", "s-panel", [
        e("h2", "Workspace preferences", {}, [icon("settings")]),
        styled(
          "p",
          "Make this space feel like yours. Update your details and preferences.",
          "s-panel-description",
        ),
        e("form", "", {}, [
          styled("div", "", "s-form-grid", [
            field(
              "Workspace name",
              {
                value: "My workspace",
                required: "",
                autocomplete: "organization",
              },
              "The name your teammates will see.",
            ),
            field(
              "Contact email",
              {
                type: "email",
                value: "hello@example.com",
                required: "",
                autocomplete: "email",
              },
              "Used for workspace notifications.",
            ),
          ]),
          field(
            "Website",
            { type: "url", placeholder: "https://your-workspace.com" },
            "Optional. Share a link to your team’s home.",
          ),
          styled("div", "", "s-preferences", [
            icon("shield"),
            e("div", "", {}, [
              e("p", "Your workspace, your control"),
              e("small", "Review these details before sharing with your team."),
            ]),
          ]),
          styled("hr", "", "s-form-divider"),
          styled("div", "", "s-form-footer", [
            button("Save preferences"),
            styled("span", "Changes apply to this workspace.", "cs-helper"),
          ]),
        ]),
      ]),
    );
  else
    main.push(
      styled("section", "", "s-panel", [
        e(
          "h2",
          ["Dashboard", "Analytics"].includes(kind)
            ? "Recent activity"
            : `All ${kind.toLowerCase()}`,
        ),
        table(kind),
      ]),
    );
  return styled("div", "", "s-screen", [
    styled("aside", "", "s-sidebar", [
      e("h2", "Workspace.", {}, [icon("component")]),
      ...["Overview", "Projects", "People", "Analytics", "Settings"].map(
        (t, i) =>
          e("p", "", {}, [
            icon(["home", "folder", "users", "chart", "settings"][i]),
            e("span", t),
          ]),
      ),
    ]),
    styled("main", "", "s-main", main),
  ]);
}
function auth(register: boolean): ElementNode {
  return styled("main", "", "s-auth", [
    styled("section", "", "s-auth-card", [
      styled("span", "forma.", "f-brand"),
      e("h1", register ? "A little room for your next idea." : "Welcome back."),
      e(
        "p",
        register
          ? "Create your account and find your flow."
          : "A clearer day starts here.",
      ),
      e("form", "", {}, [
        ...(register
          ? [
              e("label", "Full name", {}, [
                e("input", "", {
                  "aria-label": "Full name",
                  required: "",
                  autocomplete: "name",
                }),
              ]),
            ]
          : []),
        e("label", "Email address", {}, [
          e("input", "", {
            type: "email",
            "aria-label": "Email address",
            required: "",
            autocomplete: "email",
          }),
        ]),
        e("label", "Password", {}, [
          e("input", "", {
            type: "password",
            "aria-label": "Password",
            required: "",
            autocomplete: register ? "new-password" : "current-password",
          }),
        ]),
        button(register ? "Create account" : "Sign in"),
      ]),
    ]),
  ]);
}
const legacyTemplates: LibraryEntry[] = [
  {
    id: "landing",
    name: "Forma landing page",
    description: "An airy workspace landing page. Thoughtful by design.",
    category: "Marketing",
    icon: "layout",
    create: () => ({ root: landing(), css: libraryCss }),
  },
  ...[
    "Dashboard",
    "Admin panel",
    "Users",
    "Employees",
    "Products",
    "Settings",
    "Analytics",
    "Forms",
  ].map((name) => ({
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    description: `An editable ${name.toLowerCase()} screen with real HTML elements.`,
    category: "Application",
    icon: "grid",
    create: () => ({ root: screen(name), css: libraryCss }),
  })),
  ...[false, true].map((register) => ({
    id: register ? "register" : "login",
    name: register ? "Registration" : "Login",
    description:
      "A focused authentication layout. Connect your own authentication service in exported code.",
    category: "Authentication",
    icon: "lock",
    create: () => ({ root: auth(register), css: libraryCss }),
  })),
];
const legacyComponents: LibraryEntry[] = [
  {
    id: "navigation",
    name: "Navigation",
    description: "Brand, links, and a primary action.",
    category: "Navigation",
    icon: "menu",
    create: () => ({ root: nav(), css: libraryCss }),
  },
  {
    id: "feature-card",
    name: "Feature card",
    description: "A clean, flexible content card.",
    category: "Content",
    icon: "box",
    create: () => ({
      root: styled("article", "", "f-feature", [
        e("h3", "A little more possibility."),
        e("p", "Build something meaningful with thoughtful tools."),
      ]),
      css: libraryCss,
    }),
  },
  {
    id: "data-table",
    name: "Data table",
    description: "Semantic table with editable rows.",
    category: "Data",
    icon: "table",
    create: () => ({ root: table("Users"), css: libraryCss }),
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "A minimal application sidebar.",
    category: "Navigation",
    icon: "sidebar",
    create: () => ({
      root: styled("aside", "", "s-sidebar", [
        e("h2", "Workspace."),
        ...["Overview", "Projects", "People", "Settings"].map((t) => e("p", t)),
      ]),
      css: libraryCss,
    }),
  },
  {
    id: "contact-form",
    name: "Contact form",
    description: "Labeled fields and a submit button.",
    category: "Forms",
    icon: "form",
    create: () => ({
      root: e("form", "", { class: "s-panel" }, [
        e("h2", "Let’s make something great.", {}, [icon("mail")]),
        field("Your name", {
          required: "",
          placeholder: "Alex Morgan",
          autocomplete: "name",
        }),
        field(
          "Email",
          {
            type: "email",
            required: "",
            placeholder: "alex@example.com",
            autocomplete: "email",
          },
          "We’ll use this to reply to your message.",
        ),
        e("label", "", { class: "cs-field" }, [
          e("span", "Message"),
          e("textarea", "", { "aria-label": "Message" }),
        ]),
        e("button", "Send message", { type: "submit", class: "f-button" }),
      ]),
      css: libraryCss,
    }),
  },
];
export function demoProject(): Project {
  const p = createProject("Forma workspace");
  const content = templates[0].create();
  p.pages[0].root = content.root;
  p.pages[0].css = `${baseCss}\n${content.css}`;
  return p;
}
export const components: LibraryEntry[] = [
  ...legacyComponents.map((entry) =>
    modernComponents.some((c) => c.id === entry.id)
      ? { ...entry, id: "legacy-" + entry.id }
      : entry,
  ),
  ...modernComponents,
];
export const templates: LibraryEntry[] = [...legacyTemplates, ...modernScreens];

import {
  element as e,
  uid,
  type ElementNode,
  type Interaction,
} from "../document-model";
import type { LibraryEntry } from "./index";
import { iconPaths } from "../icon-factory";
import { modernCss } from "./modern-styles";
const n = (
  tag: string,
  text = "",
  classes = "",
  children: ElementNode[] = [],
  attributes: Record<string, string> = {},
) => e(tag, text, { class: classes, ...attributes }, children);
export const uiIcon = (name: string) =>
  n(
    "svg",
    "",
    "ui-icon",
    [e("path", "", { d: iconPaths[name] ?? iconPaths["box"] })],
    {
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.7",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      "data-cs-icon": name,
    },
  );
const act = (
  source: ElementNode,
  action: Interaction["action"],
  target: ElementNode,
  value = "",
  event: Interaction["event"] = "click",
) => {
  source.interactions.push({ action, target: target.id, value, event });
  return source;
};
const btn = (text: string, classes = "ui-button", icon?: string) =>
  n(
    "button",
    "",
    "ui " + classes,
    [...(icon ? [uiIcon(icon)] : []), n("span", text)],
    { type: "button" },
  );
const link = (text: string) => n("a", text, "", [], { href: "#" });
const field = (
  label: string,
  type = "text",
  attributes: Record<string, string> = {},
) => {
  const input = n("input", "", "", [], {
    type,
    "aria-label": label,
    ...attributes,
  });
  return n("label", "", "ui-field", [n("span", label), input]);
};
const article = (title: string, body: string, classes = "") =>
  n("article", "", "ui ui-card " + classes, [
    uiIcon("spark"),
    n("h3", title),
    n("p", body),
  ]);
const entry = (
  id: string,
  name: string,
  category: string,
  icon: string,
  create: () => ElementNode,
  description = "Editable, responsive and independent of CodeShip at runtime.",
): LibraryEntry => ({
  id,
  name,
  category,
  icon,
  description,
  create: () => ({ root: create(), css: modernCss }),
});
const navLinks = () =>
  n("div", "", "ui-nav-links", [
    link("Overview"),
    link("Products"),
    link("Resources"),
    link("About"),
  ]);
export function navigation(kind: string): ElementNode {
  const brand = n(
      "a",
      "",
      "ui-nav-brand",
      [uiIcon("component"), n("strong", "Forma Studio")],
      { href: "#" },
    ),
    links = navLinks(),
    action = btn("Get started", "ui-button", "arrow");
  const root = n(
    "nav",
    "",
    "ui ui-nav ui-nav-" + kind,
    [brand, links, action],
    { "aria-label": kind + " navigation" },
  );
  if (kind === "centered")
    root.children = [
      links,
      brand,
      n("div", "", "ui-nav-actions", [link("Sign in"), action]),
    ];
  if (kind === "split")
    root.children = [
      n("div", "", "ui-nav-half", [brand, links]),
      n("div", "", "ui-nav-actions", [
        link("Docs"),
        btn("Contact sales", "ui-button ui-outline"),
      ]),
    ];
  if (["search", "dashboard"].includes(kind))
    root.children.splice(
      1,
      0,
      field("Search workspace", "search", {
        placeholder: "Search projects, people…",
      }),
    );
  if (["dropdown", "mega", "profile"].includes(kind)) {
    root.children = [
      brand,
      n("div", "", "ui-nav-links", [
        link("Overview"),
        n("details", "", "ui-dropdown", [
          n("summary", kind === "profile" ? "Alex Morgan" : "Explore", "", [
            uiIcon(kind === "profile" ? "user" : "down"),
          ]),
          n(
            "div",
            "",
            "ui-dropdown-panel " + (kind === "mega" ? "ui-mega" : ""),
            ["Projects", "Design systems", "Documentation", "Team"].map(
              (t, i) =>
                n(
                  "a",
                  "",
                  "ui-menu-item",
                  [
                    uiIcon(["folder", "layers", "book", "users"][i]),
                    n("span", t),
                  ],
                  { href: "#" },
                ),
            ),
          ),
        ]),
        link("Pricing"),
      ]),
      action,
    ];
  }
  if (["sidebar", "rail", "collapsible", "enterprise"].includes(kind)) {
    root.attributes.class += " ui-side-nav";
    root.children = [
      brand,
      ...["Home", "Projects", "People", "Analytics", "Settings"].map((t, i) =>
        n(
          "a",
          "",
          "ui-side-link",
          [
            uiIcon(["home", "folder", "users", "chart", "settings"][i]),
            n("span", t),
          ],
          { href: "#" },
        ),
      ),
    ];
    if (kind === "collapsible") {
      const collapse = act(
        btn("Collapse navigation", "ui-button ui-ghost", "sidebar"),
        "toggle-class",
        root,
        "is-collapsed",
      );
      root.children.push(collapse);
    }
  }
  if (kind === "bottom") {
    root.children = [
      "Home",
      "Explore",
      "Create",
      "Notifications",
      "Profile",
    ].map((t, i) =>
      n(
        "a",
        "",
        "ui-bottom-link",
        [uiIcon(["home", "search", "plus", "bell", "user"][i]), n("span", t)],
        { href: "#" },
      ),
    );
  }
  if (kind === "tabs") {
    root.children = ["Overview", "Activity", "Files", "Settings"].map(
      (text, index) =>
        n("a", text, index === 0 ? "is-active" : "", [], {
          href: "#" + text.toLowerCase(),
        }),
    );
  }
  if (kind === "breadcrumbs") {
    root.attributes["aria-label"] = "Breadcrumb";
    root.children = [
      link("Workspace"),
      uiIcon("chevron"),
      link("Projects"),
      uiIcon("chevron"),
      n("span", "Brand refresh", "", [], { "aria-current": "page" }),
    ];
  }
  if (kind === "steps") {
    root.children = ["Workspace", "Details", "Members", "Review"].map(
      (text, index) =>
        n(
          "a",
          "",
          "ui-step-link",
          [n("b", String(index + 1)), n("span", text)],
          { href: "#step-" + index },
        ),
    );
  }
  if (["mobile", "enterprise"].includes(kind)) {
    const menu = act(
      btn("Toggle menu", "ui-button ui-ghost", "menu"),
      "toggle-class",
      root,
      "is-open",
    );
    menu.attributes["aria-expanded"] = "false";
    root.children.splice(1, 0, menu);
  }
  if (kind === "announcement")
    root.children.unshift(
      n(
        "div",
        "A little more possibility. Explore the new workspace.",
        "ui-nav-announcement",
      ),
    );
  for (const child of root.children)
    if (child.tag === "a" && child.children.some((n) => n.tag === "span"))
      child.attributes["aria-label"] =
        child.children.find((n) => n.tag === "span")?.text ?? "Home";
  return root;
}
const navigationKinds = [
  "classic",
  "minimal",
  "centered",
  "split",
  "transparent",
  "glass",
  "floating",
  "pill",
  "sticky",
  "fixed",
  "dropdown",
  "mega",
  "search",
  "profile",
  "dashboard",
  "sidebar",
  "collapsible",
  "rail",
  "mobile",
  "bottom",
  "tabs",
  "breadcrumbs",
  "steps",
  "enterprise",
  "announcement",
];
export const navigationEntries = navigationKinds.map((kind) =>
  entry(
    "nav-" + kind,
    `${kind[0].toUpperCase() + kind.slice(1)} navigation`,
    "Navigation",
    "menu",
    () => navigation(kind),
    "Distinct " + kind + " layout with original icons and editable labels.",
  ),
);

export function dataTable(): ElementNode {
  const body = n(
    "tbody",
    "",
    "",
    [
      "Olivia Chen",
      "Jordan Lee",
      "Alex Morgan",
      "Sam Rivera",
      "Maya Patel",
      "Taylor Reed",
      "Noah Wilson",
      "Avery Park",
    ].map((name, i) =>
      n(
        "tr",
        "",
        "",
        [
          n("td", name),
          n("td", name.toLowerCase().replace(" ", ".") + "@example.com"),
          n("td", i % 3 === 0 ? "Review" : "Active"),
          n("td", ["Design", "Engineering", "Product"][i % 3]),
        ],
        { "data-filter-item": "", ...(i >= 4 ? { hidden: "" } : {}) },
      ),
    ),
  );
  const heading = n("thead", "", "", [
    n(
      "tr",
      "",
      "",
      ["Name", "Email", "Status", "Team"].map((title, i) =>
        n(
          "th",
          "",
          "",
          [act(btn(title, "ui-sort-button", "down"), "sort", body, String(i))],
          { scope: "col" },
        ),
      ),
    ),
  ]);
  const root = n(
    "section",
    "",
    "ui ui-card ui-data-table",
    [
      n("h3", "Team directory"),
      n("div", "", "ui-table-scroll", [n("table", "", "", [heading, body])], {
        role: "region",
        "aria-label": "Scrollable team records",
        tabindex: "0",
      }),
    ],
    { "data-page-size": "4", "data-current-page": "0" },
  );
  const search = n("input", "", "", [], {
    type: "search",
    placeholder: "Find a teammate…",
    "aria-label": "Filter team records",
  });
  act(search, "filter", root, "", "input");
  const previous = act(
      btn("Previous", "ui-button ui-outline", "chevron"),
      "paginate",
      root,
      "previous",
    ),
    next = act(
      btn("Next", "ui-button ui-outline", "arrow"),
      "paginate",
      root,
      "next",
    );
  root.children.splice(1, 0, search);
  root.children.push(
    n("div", "", "ui-row ui-pagination", [
      previous,
      n("span", "Page 1 of 2", "", [], { "data-page-label": "" }),
      next,
    ]),
  );
  return root;
}
function panels(kind: string): ElementNode {
  const root = n("section", "", "ui ui-card ui-panels", [], {
    "data-active-panel": "0",
  });
  const labels =
    kind === "stepper"
      ? ["Your details", "Preferences", "Review"]
      : kind === "carousel"
        ? ["A clearer workspace", "Made for your flow", "Room to grow"]
        : ["Overview", "Activity", "Settings"];
  const tabs = labels.map((text, index) =>
    act(
      n("button", text, "", [], {
        type: "button",
        role: "tab",
        "aria-selected": String(index === 0),
      }),
      "select-panel",
      root,
      String(index),
    ),
  );
  root.children = [
    n("div", "", "ui-tabs", tabs, {
      role: "tablist",
      "aria-label": kind + " sections",
    }),
    ...labels.map((title, index) =>
      n(
        "section",
        "",
        "ui-panel-content",
        [
          n("h3", title),
          kind === "stepper"
            ? field(index === 0 ? "Full name" : "Workspace name", "text", {
                placeholder: "Your " + (index === 0 ? "name" : "workspace"),
              })
            : n(
                "p",
                "A thoughtful space for your projects, people and best ideas.",
              ),
        ],
        {
          "data-panel": String(index),
          role: "tabpanel",
          ...(index ? { hidden: "" } : {}),
        },
      ),
    ),
    n("div", "", "ui-row", [
      act(
        btn("Back", "ui-button ui-outline"),
        "select-panel",
        root,
        "previous",
      ),
      act(btn("Continue", "ui-button", "arrow"), "select-panel", root, "next"),
    ]),
  ];
  return root;
}
function overlay(kind: string): ElementNode {
  const dialog = n(
    "dialog",
    "",
    "ui ui-dialog" + (kind === "drawer" ? " ui-drawer" : ""),
    [
      n(
        "h2",
        kind === "confirmation"
          ? "Archive this project?"
          : "A little more possibility.",
      ),
      n(
        "p",
        kind === "confirmation"
          ? "This is a local demonstration. No project files will be deleted."
          : "Your ideas deserve a thoughtful space. Explore the details and make it your own.",
      ),
    ],
  );
  dialog.children.push(
    act(btn("Close", "ui-button ui-outline"), "dialog", dialog, "close"),
  );
  return n("section", "", "ui ui-overlay-demo", [
    act(
      btn(
        kind === "drawer"
          ? "Open drawer"
          : kind === "confirmation"
            ? "Review action"
            : "Open dialog",
        "ui-button",
        "external",
      ),
      "dialog",
      dialog,
    ),
    dialog,
  ]);
}
function formComponent(kind: string): ElementNode {
  if (kind === "tags") {
    const tags = n("ul", "", "ui-tag-list", [], {
        "aria-label": "Selected tags",
        "data-tags": "",
      }),
      form = n("form", "", "ui ui-card", [
        n("h3", "Project tags"),
        field("Add a tag", "text", {
          name: "message",
          required: "",
          placeholder: "e.g. Design system",
        }),
        n("button", "Add tag", "ui-button", [], { type: "submit" }),
        tags,
      ]);
    act(form, "add-item", tags, "", "submit");
    return form;
  }
  if (["checkbox", "switch", "radio"].includes(kind))
    return n("fieldset", "", "ui ui-card ui-choice-group", [
      n("legend", kind === "radio" ? "Choose a workspace" : "Your preferences"),
      ...["Product updates", "Weekly summary", "Team activity"].map(
        (label, i) =>
          n("label", "", "ui-check", [
            n("input", "", "", [], {
              type: kind === "radio" ? "radio" : "checkbox",
              name: kind === "radio" ? "workspace" : "option-" + i,
              ...(kind === "switch" ? { role: "switch" } : {}),
            }),
            n("span", label),
          ]),
      ),
    ]);
  if (kind === "otp")
    return n("section", "", "ui ui-card", [
      n("h3", "Check your inbox"),
      n("p", "Enter your verification code."),
      field("One-time code", "text", {
        inputmode: "numeric",
        pattern: "[0-9]{6}",
        maxlength: "6",
        autocomplete: "one-time-code",
        placeholder: "000000",
      }),
      n("small", "Layout example. Connect your own verification service."),
    ]);
  if (kind === "range" || kind === "slider") {
    const output = n("output", "50"),
      input = n("input", "", "", [], {
        type: "range",
        min: "0",
        max: "100",
        value: "50",
        "aria-label": "Volume",
      });
    act(input, "range-output", output, "", "input");
    return n("section", "", "ui ui-card", [
      n("label", "Volume"),
      input,
      output,
    ]);
  }
  if (["searchable-select", "combobox", "autocomplete"].includes(kind)) {
    const listId = "choices-" + uid();
    return n("section", "", "ui ui-card", [
      field("Choose a project", "text", {
        list: listId,
        placeholder: "Start typing…",
      }),
      n(
        "datalist",
        "",
        "",
        [
          "Design system",
          "Website refresh",
          "Customer research",
          "Mobile app",
        ].map((value) => n("option", value, "", [], { value })),
        { id: listId },
      ),
      n("small", "Type to filter the local suggestions."),
    ]);
  }
  if (["select", "multi-select"].includes(kind))
    return n("label", "", "ui ui-field", [
      n("span", kind === "multi-select" ? "Choose teams" : "Workspace plan"),
      n(
        "select",
        "",
        "",
        ["Design", "Engineering", "Product", "Operations"].map((t) =>
          n("option", t, "", [], { value: t }),
        ),
        {
          "aria-label": "Workspace plan",
          ...(kind === "multi-select" ? { multiple: "" } : {}),
        },
      ),
    ]);
  if (kind === "validation") {
    const output = n("p", "", "ui-form-status", [], { role: "status" }),
      form = n("form", "", "ui ui-card", [
        n("h3", "Create a workspace"),
        field("Workspace name", "text", {
          required: "",
          placeholder: "Studio North",
        }),
        field("Contact email", "email", {
          required: "",
          placeholder: "hello@example.com",
        }),
        n("button", "Validate details", "ui-button", [], { type: "submit" }),
        output,
      ]);
    act(
      form,
      "show-message",
      output,
      "Valid details. Connect a service to create this workspace.",
      "submit",
    );
    return form;
  }
  const type: Record<string, string> = {
    password: "password",
    search: "search",
    date: "date",
    time: "time",
    file: "file",
    color: "color",
    text: "text",
  };
  if (kind === "textarea")
    return n("label", "", "ui ui-field", [
      n("span", "Project brief"),
      n("textarea", "", "", [], {
        "aria-label": "Project brief",
        placeholder: "What are you making?",
      }),
    ]);
  return n("div", "", "ui ui-card", [
    field(
      kind === "file"
        ? "Upload a local file"
        : kind === "color"
          ? "Brand color"
          : kind === "date"
            ? "Start date"
            : kind === "time"
              ? "Meeting time"
              : kind === "password"
                ? "Password"
                : "Your " + kind,
      type[kind] ?? "text",
      {
        ...(kind === "password" ? { autocomplete: "new-password" } : {}),
        ...(kind === "color" ? { value: "#739456" } : {}),
      },
    ),
  ]);
}
function cardComponent(kind: string): ElementNode {
  if (kind === "expandable")
    return n("details", "", "ui ui-card", [
      n("summary", "A clearer view of your work"),
      n(
        "p",
        "Expand this card to make room for more detail. Your content stays fully editable.",
      ),
    ]);
  if (kind === "profile")
    return n("article", "", "ui ui-card ui-profile", [
      n("span", "AM", "ui-avatar"),
      n("h3", "Alex Morgan"),
      n("p", "Product designer · Studio North"),
      btn("View profile", "ui-button ui-outline", "user"),
    ]);
  if (kind === "pricing")
    return n("article", "", "ui ui-card ui-pricing", [
      n("span", "FOR GROWING TEAMS", "ui-kicker"),
      n("h3", "Room to grow"),
      n("strong", "$24", "ui-price"),
      n("p", "per member / month"),
      n(
        "ul",
        "",
        "",
        ["Unlimited projects", "Shared design system", "Version history"].map(
          (t) => n("li", t, "", [uiIcon("check")]),
        ),
      ),
      btn("Choose plan", "ui-button", "arrow"),
    ]);
  if (kind === "statistics" || kind === "widget")
    return n("article", "", "ui ui-card", [
      uiIcon("chart"),
      n("p", "Monthly revenue"),
      n("strong", "$48,295", "ui-price"),
      n("small", "↑ 12.5% compared with last month", "ui-positive"),
    ]);
  if (kind === "product" || kind === "image-overlay")
    return n("article", "", "ui ui-card ui-product", [
      n("div", "", "ui-artwork", [uiIcon("box")]),
      n("span", "MADE FOR EVERY DAY", "ui-kicker"),
      n("h3", "The everyday collection"),
      n("p", "Thoughtful essentials. Beautiful by design."),
      btn("Explore collection", "ui-button ui-outline", "arrow"),
    ]);
  if (kind === "timeline")
    return n("article", "", "ui ui-card", [
      n("h3", "A little progress, every day"),
      ...[
        "Project created",
        "First exploration shared",
        "Design review completed",
      ].map((t, i) =>
        n("div", "", "ui-timeline-item", [
          uiIcon(i === 2 ? "checkCircle" : "clock"),
          n("div", "", "", [
            n("strong", t),
            n("small", `${i + 1} day${i ? "s" : ""} ago`),
          ]),
        ]),
      ),
    ]);
  const card = article(
    "Make room for what matters.",
    "Thoughtful tools for your next great idea. Flexible, editable, and beautifully simple.",
    "ui-card-" + kind,
  );
  if (kind === "interactive") {
    card.children.push(
      act(
        btn("Bookmark", "ui-button ui-outline", "star"),
        "toggle-class",
        card,
        "is-bookmarked",
      ),
    );
  }
  return card;
}
export function kanban(): ElementNode {
  const root = n("section", "", "ui ui-kanban", [], {
    "aria-label": "Project kanban board",
  });
  root.children = ["To do", "In progress", "Complete"].map((title, col) =>
    n("section", "", "ui-kanban-column", [
      n("h3", title),
      ...["Brand exploration", "Website wireframes", "Design system"]
        .slice(0, col === 1 ? 2 : 3)
        .map((text, i) =>
          n(
            "article",
            "",
            "ui ui-card ui-kanban-card",
            [
              n("span", ["Research", "Design", "Planning"][i], "ui-badge"),
              n("h4", text),
              n("p", "Make a little progress, together."),
              uiIcon("users"),
            ],
            { draggable: "true", "aria-label": text },
          ),
        ),
    ]),
  );
  for (const event of [
    "dragstart",
    "dragover",
    "drop",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
  ] as const)
    act(root, "drag-reorder", root, "", event);
  return root;
}
export function calendar(): ElementNode {
  return n("section", "", "ui ui-card ui-calendar", [
    n("div", "", "ui-row", [n("h3", "October 2026"), uiIcon("calendar")]),
    n("div", "", "ui-calendar-grid", [
      ...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((t) =>
        n("strong", t),
      ),
      ...Array.from({ length: 35 }, (_, i) =>
        n("div", "", "ui-calendar-day", [
          n("span", String((i % 31) + 1)),
          ...(i === 8 || i === 15 || i === 22
            ? [n("small", "Design review", "ui-calendar-event")]
            : []),
        ]),
      ),
    ]),
  ]);
}
export function chat(): ElementNode {
  const messages = n(
      "div",
      "",
      "ui-chat-messages",
      [
        n("p", "A new idea starts with a conversation.", "ui-message"),
        n("p", "Let’s make something thoughtful.", "ui-message ui-message-own"),
      ],
      { role: "log", "aria-label": "Local conversation" },
    ),
    form = n("form", "", "ui-row", [
      n("input", "", "", [], {
        name: "message",
        "aria-label": "Message",
        placeholder: "Write a message…",
        maxlength: "1000",
        required: "",
      }),
      n("button", "Send", "ui-button", [], { type: "submit" }),
    ]);
  act(form, "add-item", messages, "", "submit");
  return n("section", "", "ui ui-card ui-chat", [
    n("h3", "Team conversation"),
    messages,
    form,
    n(
      "small",
      "Messages are a local preview demonstration; they are not sent to a service.",
    ),
  ]);
}
function dataDisplay(kind: string): ElementNode {
  if (kind === "table" || kind === "grid") return dataTable();
  if (kind === "progress")
    return n("section", "", "ui ui-card", [
      n("label", "Project progress"),
      n("progress", "", "", [], {
        max: "100",
        value: "72",
        "aria-label": "Project progress",
      }),
      n("p", "72% of the way to something great."),
    ]);
  if (kind === "circular-progress")
    return n("section", "", "ui ui-card ui-circle-progress", [
      n("div", "72%", "ui-progress-ring", [], {
        role: "progressbar",
        "aria-label": "Project progress",
        "aria-valuenow": "72",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
      }),
      n("p", "Making steady progress"),
    ]);
  if (kind === "skeleton")
    return n(
      "section",
      "",
      "ui ui-card ui-skeleton",
      [
        n("span", "", "ui-skeleton-line"),
        n("span", "", "ui-skeleton-line"),
        n("span", "", "ui-skeleton-line"),
      ],
      { role: "status", "aria-label": "Loading content" },
    );
  if (kind === "tree")
    return n("section", "", "ui ui-card", [
      n("h3", "Project files"),
      n(
        "details",
        "",
        "",
        [
          n("summary", "Design system"),
          n(
            "ul",
            "",
            "",
            ["Colors", "Typography", "Components"].map((t) =>
              n("li", t, "", [uiIcon("file")]),
            ),
          ),
        ],
        { open: "" },
      ),
    ]);
  if (kind === "tooltip" || kind === "popover")
    return n("section", "", "ui ui-card", [
      n("details", "", "ui-dropdown", [
        n("summary", "More about this project", "", [uiIcon("info")]),
        n(
          "div",
          "A local workspace for thoughtful teams.",
          "ui-dropdown-panel",
        ),
      ]),
    ]);
  if (kind === "chart" || kind === "kpi")
    return n("section", "", "ui ui-card", [
      n("h3", "A little progress, every week"),
      n(
        "div",
        "",
        "ui-chart",
        Array.from({ length: 7 }, (_, i) =>
          n(
            "div",
            "",
            "ui-chart-bar",
            [n("span", String([32, 48, 42, 63, 58, 78, 91][i]) + "%")],
            {
              "data-chart-value": String([32, 48, 42, 63, 58, 78, 91][i]),
              "aria-label": `Week ${i + 1}: ${[32, 48, 42, 63, 58, 78, 91][i]} percent`,
              class: `ui-chart-bar ui-chart-bar-${i}`,
            },
          ),
        ),
      ),
      n("p", "Sample local figures · replace with your application data."),
    ]);
  if (kind === "avatar" || kind === "avatar-group")
    return n("div", "", "ui ui-row", [
      ...["AM", "JL", "SC", ...(kind === "avatar-group" ? ["+3"] : [])].map(
        (t) =>
          n("span", t, "ui-avatar", [], {
            "aria-label": t === "+3" ? "3 more teammates" : "Team member " + t,
          }),
      ),
    ]);
  if (kind === "badge" || kind === "status")
    return n("div", "", "ui ui-row", [
      n("span", "Active", "ui-badge"),
      n("span", "In review", "ui-badge ui-badge-warm"),
      n("span", "Draft", "ui-badge ui-badge-neutral"),
    ]);
  if (kind === "timeline") return cardComponent("timeline");
  return n("dl", "", "ui ui-card ui-properties", [
    n("dt", "Project"),
    n("dd", "Website refresh"),
    n("dt", "Owner"),
    n("dd", "Alex Morgan"),
    n("dt", "Status"),
    n("dd", "In progress"),
  ]);
}
export const modernComponents: LibraryEntry[] = [
  ...navigationEntries,
  ...[
    "primary",
    "secondary",
    "outline",
    "ghost",
    "text",
    "icon",
    "floating",
    "pill",
    "gradient",
    "glass",
    "split",
    "dropdown",
    "loading",
    "destructive",
    "toggle",
    "group",
  ].map((kind) =>
    entry(
      "button-" + kind,
      kind[0].toUpperCase() + kind.slice(1) + " button",
      "Buttons",
      "pointer",
      () => {
        if (kind === "group")
          return n("div", "", "ui ui-button-group", [
            btn("Day"),
            btn("Week"),
            btn("Month"),
          ]);
        if (kind === "split" || kind === "dropdown")
          return n("div", "", "ui ui-button-group", [
            btn("Create project"),
            n("details", "", "ui-dropdown", [
              n("summary", "", "ui-button", [uiIcon("down")]),
              n("div", "", "ui-dropdown-panel", [
                link("New page"),
                link("New component"),
              ]),
            ]),
          ]);
        const button = btn(
          kind === "loading"
            ? "Saving…"
            : kind === "icon"
              ? "Settings"
              : kind === "destructive"
                ? "Delete item"
                : "Make it happen",
          "ui-button ui-button-" + kind,
          kind === "loading" ? "clock" : kind === "icon" ? "settings" : "arrow",
        );
        if (kind === "loading") button.attributes.disabled = "";
        if (kind === "toggle") {
          button.attributes["aria-pressed"] = "false";
          act(button, "toggle-class", button, "is-active");
        }
        return button;
      },
    ),
  ),
  ...[
    "text",
    "password",
    "search",
    "textarea",
    "select",
    "searchable-select",
    "combobox",
    "checkbox",
    "radio",
    "switch",
    "slider",
    "date",
    "time",
    "file",
    "otp",
    "tags",
    "autocomplete",
    "multi-select",
    "color",
    "range",
    "validation",
  ].map((kind) =>
    entry(
      "form-" + kind,
      kind[0].toUpperCase() + kind.slice(1).replaceAll("-", " ") + " field",
      "Forms",
      "form",
      () => formComponent(kind),
    ),
  ),
  ...[
    "basic",
    "elevated",
    "outline",
    "glass",
    "gradient",
    "interactive",
    "expandable",
    "profile",
    "product",
    "pricing",
    "statistics",
    "widget",
    "feature",
    "image-overlay",
    "timeline",
  ].map((kind) =>
    entry(
      "card-" + kind,
      kind[0].toUpperCase() + kind.slice(1) + " card",
      "Cards",
      "box",
      () => cardComponent(kind),
    ),
  ),
  ...[
    "container",
    "stack",
    "grid",
    "split",
    "sidebar",
    "header",
    "footer",
    "hero",
    "section",
    "divider",
    "resizable",
    "masonry",
    "accordion",
    "tabs",
    "stepper",
    "scroll",
  ].map((kind) =>
    entry(
      "layout-" + kind,
      kind[0].toUpperCase() + kind.slice(1) + " layout",
      "Layout",
      "layout",
      () => {
        if (["tabs", "stepper"].includes(kind)) return panels(kind);
        if (kind === "accordion")
          return n(
            "section",
            "",
            "ui ui-card",
            [
              "A clearer workspace",
              "A little room to grow",
              "Made for your flow",
            ].map((t) =>
              n("details", "", "ui-accordion", [
                n("summary", t),
                n("p", "Thoughtful defaults with every detail ready to edit."),
              ]),
            ),
          );
        if (kind === "divider") return n("hr", "", "ui ui-divider");
        if (kind === "hero")
          return n("section", "", "ui ui-hero", [
            n("span", "A NEW WAY TO CREATE", "ui-kicker"),
            n("h1", "Make room for your next big idea."),
            n(
              "p",
              "Design a little more thoughtfully. Build a little more beautifully.",
            ),
            btn("Get started", "ui-button", "arrow"),
          ]);
        if (kind === "header" || kind === "sidebar")
          return navigation(kind === "header" ? "dashboard" : "sidebar");
        if (kind === "footer")
          return n("footer", "", "ui ui-footer", [
            n("strong", "Forma Studio"),
            n("div", "", "ui-row", [
              link("About"),
              link("Privacy"),
              link("Contact"),
            ]),
            n("small", "Thoughtfully built. © 2026"),
          ]);
        return n("section", "", "ui ui-layout ui-layout-" + kind, [
          article("One home for your ideas.", "Start with a little clarity."),
          article("Room for your best work.", "Make progress feel natural."),
          ...(kind === "grid" || kind === "masonry"
            ? [
                article(
                  "A little more possibility.",
                  "Built for what comes next.",
                ),
              ]
            : []),
        ]);
      },
    ),
  ),
  ...[
    "table",
    "grid",
    "badge",
    "avatar",
    "avatar-group",
    "tooltip",
    "popover",
    "progress",
    "circular-progress",
    "skeleton",
    "timeline",
    "chart",
    "kpi",
    "tree",
    "properties",
    "status",
  ].map((kind) =>
    entry(
      "data-" + kind,
      kind[0].toUpperCase() + kind.slice(1).replaceAll("-", " ") + " display",
      "Data",
      "chart",
      () => dataDisplay(kind),
    ),
  ),
  ...[
    "alert",
    "toast",
    "dialog",
    "modal",
    "drawer",
    "confirmation",
    "notification",
    "loading",
    "empty",
    "error",
    "success",
    "command",
  ].map((kind) =>
    entry(
      "feedback-" + kind,
      kind[0].toUpperCase() + kind.slice(1) + " feedback",
      "Feedback",
      "info",
      () => {
        if (["dialog", "modal", "drawer", "confirmation"].includes(kind))
          return overlay(kind);
        if (kind === "command") {
          const root = n("section", "", "ui ui-card", [
              n("h3", "Find your next action"),
            ]),
            list = n(
              "ul",
              "",
              "ui-command-list",
              [
                "Create project",
                "Open recent project",
                "Search components",
                "Export design",
              ].map((t) => n("li", t, "", [], { "data-filter-item": "" })),
            ),
            search = n("input", "", "", [], {
              type: "search",
              "aria-label": "Filter local commands",
              placeholder: "Type to find a command…",
            });
          act(search, "filter", list, "", "input");
          root.children.push(search, list);
          return root;
        }
        const alert = n(
          "section",
          "",
          "ui ui-card ui-feedback ui-feedback-" + kind,
          [
            uiIcon(
              kind === "error"
                ? "warning"
                : kind === "success"
                  ? "checkCircle"
                  : kind === "empty"
                    ? "folder"
                    : "info",
            ),
            n(
              "h3",
              kind === "empty"
                ? "A little space for something great."
                : kind === "error"
                  ? "Something needs your attention."
                  : kind === "success"
                    ? "All set. Nice work."
                    : "A small update for your workspace.",
            ),
            n(
              "p",
              kind === "empty"
                ? "Add your first item to get started."
                : "Your content is local and fully editable.",
            ),
          ],
          { role: kind === "error" ? "alert" : "status" },
        );
        if (["toast", "alert", "notification"].includes(kind))
          alert.children.push(
            act(
              btn("Dismiss", "ui-button ui-outline", "close"),
              "toggle-class",
              alert,
              "is-dismissed",
            ),
          );
        return alert;
      },
    ),
  ),
  entry("advanced-kanban", "Kanban board", "Advanced", "columns", kanban),
  entry("advanced-calendar", "Calendar", "Advanced", "calendar", calendar),
  entry("advanced-chat", "Chat interface", "Advanced", "chat", chat),
  entry("advanced-multistep", "Multi-step form", "Advanced", "form", () =>
    panels("stepper"),
  ),
  entry("advanced-carousel", "Image carousel", "Advanced", "image", () =>
    panels("carousel"),
  ),
  entry(
    "advanced-filter",
    "Search and filter panel",
    "Advanced",
    "filter",
    () =>
      n("section", "", "ui ui-card", [
        field("Search", "search", { placeholder: "Search records…" }),
        formComponent("multi-select"),
        formComponent("checkbox"),
      ]),
  ),
  entry("advanced-file-manager", "File manager", "Advanced", "folder", () =>
    n("section", "", "ui ui-card", [
      n("h3", "Your project files"),
      n(
        "div",
        "",
        "ui-layout ui-layout-grid",
        [
          "Brand assets",
          "Design system",
          "Website pages",
          "Research notes",
        ].map((t) => article(t, "Local project folder.", "ui-file-card")),
      ),
    ]),
  ),
  entry(
    "advanced-workspace",
    "Developer workspace",
    "Advanced",
    "terminal",
    () =>
      n("section", "", "ui ui-card ui-developer", [
        navigation("tabs"),
        n(
          "pre",
          "main {\n  display: grid;\n  gap: 24px;\n  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));\n}",
        ),
        n(
          "p",
          "Editable code presentation. Use CodeShip CSS Studio for live source editing.",
        ),
      ]),
  ),
];

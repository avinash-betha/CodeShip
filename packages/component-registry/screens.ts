import { element as e, type ElementNode } from "../document-model";
import type { LibraryEntry } from "./index";
import {
  navigation,
  chat,
  kanban,
  calendar,
  dataTable,
  uiIcon,
  modernComponents,
} from "./modern";
import { modernCss } from "./modern-styles";
const n = (
  tag: string,
  text = "",
  cls = "",
  children: ElementNode[] = [],
  attrs: Record<string, string> = {},
) => e(tag, text, { class: cls, ...attrs }, children);
const component = (id: string) =>
  modernComponents.find((c) => c.id === id)!.create().root;
const heading = (title: string, subtitle: string) =>
  n("header", "", "screen-heading", [
    n("div", "", "", [
      n("span", "YOUR WORKSPACE / " + title.toUpperCase(), "ui-kicker"),
      n("h1", title),
      n("p", subtitle),
    ]),
  ]);
const card = (title: string, body: string, icon = "folder") =>
  n("article", "", "ui ui-card", [uiIcon(icon), n("h3", title), n("p", body)]);
const stats = (kind: string) =>
  n(
    "div",
    "",
    "screen-grid screen-stats",
    [
      [
        "Total " +
          (kind === "Financial"
            ? "balance"
            : kind === "Sales"
              ? "sales"
              : "revenue"),
        "$48,295",
        "wallet",
      ],
      [
        "Active " + (kind === "CRM" ? "customers" : "projects"),
        "128",
        "folder",
      ],
      ["This month", "+12.5%", "trend"],
    ].map(([title, value, icon]) =>
      n("article", "", "ui ui-card", [
        uiIcon(icon),
        n("p", title),
        n("strong", value, "ui-price"),
        n("small", "Sample figures · edit for your application"),
      ]),
    ),
  );
export function applicationScreen(
  title: string,
  content: ElementNode[],
): ElementNode {
  return n("div", "", "ui screen-shell", [
    navigation("sidebar"),
    n("div", "", "screen-content", [
      navigation("dashboard"),
      n("main", "", "screen-main", [
        heading(title, "A little clarity for your next great idea."),
        ...content,
      ]),
    ]),
  ]);
}
function dashboard(kind: string): ElementNode {
  return applicationScreen(kind + " dashboard", [
    stats(kind),
    n("div", "", "screen-grid screen-dashboard-panels", [
      component("data-chart"),
      kind === "Developer"
        ? component("advanced-workspace")
        : kind === "Project"
          ? component("card-timeline")
          : component("card-statistics"),
    ]),
    kind === "Project" ? kanban() : dataTable(),
  ]);
}
function management(kind: string): ElementNode {
  const table = dataTable();
  table.children[0].text = kind + " directory";
  if (kind === "Inventory" || kind === "Orders" || kind === "Customers") {
    const rows = table.children.flatMap(function collect(node): ElementNode[] {
      return node.tag === "tr" ? [node] : node.children.flatMap(collect);
    });
    rows.slice(1).forEach((row, i) => {
      row.children[0].text =
        kind === "Inventory"
          ? ["Studio desk", "Canvas tote", "Arc lamp", "Everyday notebook"][
              i % 4
            ]
          : kind === "Orders"
            ? "ORD-00" + (i + 1)
            : ["North Studio", "Circles Co.", "Fieldwork", "Layers Inc."][
                i % 4
              ];
    });
  }
  return applicationScreen(kind + " management", [
    n("div", "", "screen-grid", [
      card(
        "One clear view",
        "Organize your " + kind.toLowerCase() + ", all in one place.",
        "layers",
      ),
      card(
        "Built for your team",
        "Search, sort and page through local sample records.",
        "users",
      ),
    ]),
    table,
  ]);
}
function authentication(kind: string): ElementNode {
  const isSplit = kind === "Split-screen sign in";
  const title =
    kind === "Forgot password"
      ? "A fresh start."
      : kind === "Reset password"
        ? "Choose a new password."
        : kind === "OTP verification"
          ? "Check your inbox."
          : "A clearer day starts here.";
  const form = component(
    kind === "OTP verification" ? "form-otp" : "form-validation",
  );
  form.children.unshift(n("h1", title));
  form.children.push(
    n(
      "small",
      "Editable authentication UI. Connect your own service in exported code.",
    ),
  );
  if (kind === "Reset password") {
    form.children = form.children.filter((c) => c.tag !== "label");
    form.children.splice(
      2,
      0,
      component("form-password"),
      component("form-password"),
    );
  }
  if (kind === "Forgot password") {
    form.children = form.children.filter(
      (c) =>
        !(
          c.tag === "label" &&
          c.children.some((ch) => ch.text === "Workspace name")
        ),
    );
  }
  return n(
    "main",
    "",
    "ui screen-auth" + (isSplit ? " screen-auth-split" : ""),
    [
      ...(isSplit
        ? [
            n("section", "", "screen-auth-story", [
              uiIcon("component"),
              n("h2", "Make room for your next big idea."),
              n("p", "Thoughtful tools for teams that care about the details."),
              component("card-timeline"),
            ]),
          ]
        : []),
      n("section", "", "screen-auth-form", [
        n("a", "Forma Studio", "screen-auth-brand", [], { href: "#" }),
        form,
      ]),
    ],
  );
}
function website(kind: string): ElementNode {
  const nav = navigation(
    kind === "Portfolio"
      ? "minimal"
      : kind === "E-commerce homepage"
        ? "search"
        : "classic",
  );
  const content: ElementNode[] = [];
  if (kind === "Portfolio") {
    content.push(
      n("section", "", "screen-portfolio", [
        n("span", "DESIGNER / CREATIVE DEVELOPER", "ui-kicker"),
        n("h1", "Thoughtful design. Meaningful experiences."),
        n(
          "p",
          "I’m Alex, a product designer turning complex ideas into clear, useful interfaces.",
        ),
        n("div", "", "ui-artwork", [uiIcon("brush")]),
      ]),
      n("section", "", "screen-main", [
        heading("Selected work", "A few things I’m proud to have made."),
        n("div", "", "screen-grid", [
          component("card-product"),
          component("card-image-overlay"),
          component("card-feature"),
        ]),
      ]),
    );
  } else if (kind === "Pricing page")
    content.push(
      heading("A little room to grow.", "Simple plans for thoughtful teams."),
      n("section", "", "screen-grid screen-main", [
        component("card-pricing"),
        component("card-pricing"),
        component("card-pricing"),
      ]),
      component("layout-accordion"),
    );
  else if (kind === "Contact page")
    content.push(
      heading("Let’s make something great.", "Tell us what you’re working on."),
      n("section", "", "screen-grid screen-main", [
        card(
          "A conversation starts here.",
          "hello@example.com · Monday to Friday",
          "mail",
        ),
        component("form-validation"),
      ]),
    );
  else if (kind === "Blog layout")
    content.push(
      heading(
        "Notes from the studio.",
        "Ideas, observations, and a little inspiration.",
      ),
      n("section", "", "screen-grid screen-main", [
        ...[
          "A calmer way to create",
          "Making space for good work",
          "The little things matter",
        ].map((title) =>
          n("article", "", "ui ui-card", [
            n("div", "", "ui-artwork", [uiIcon("book")]),
            n("span", "FIELD NOTES · 5 MIN READ", "ui-kicker"),
            n("h2", title),
            n(
              "p",
              "Thoughtful perspectives on the way we work, design and build.",
            ),
            n("a", "Read article →", "", [], { href: "#article" }),
          ]),
        ),
      ]),
    );
  else if (kind === "Documentation website")
    content.push(
      n("div", "", "screen-docs", [
        navigation("sidebar"),
        n("main", "", "screen-main", [
          heading(
            "Build something thoughtful.",
            "Everything you need to get started.",
          ),
          n("div", "", "screen-grid", [
            card(
              "Getting started",
              "Find your flow with a few simple first steps.",
              "rocket",
            ),
            card(
              "Core concepts",
              "A clear foundation for your next idea.",
              "book",
            ),
          ]),
          component("advanced-workspace"),
          component("layout-accordion"),
        ]),
      ]),
    );
  else if (kind === "Product detail")
    content.push(
      n("section", "", "screen-grid screen-main", [
        n("div", "", "ui-artwork screen-product-art", [uiIcon("box")]),
        n("div", "", "", [
          n("span", "THE EVERYDAY COLLECTION", "ui-kicker"),
          n("h1", "The studio essentials."),
          n(
            "p",
            "Thoughtful tools for an inspired workspace. Made to feel right, every day.",
          ),
          n("strong", "$129", "ui-price"),
          component("form-select"),
          component("button-primary"),
          component("layout-accordion"),
        ]),
      ]),
    );
  else
    content.push(
      component("layout-hero"),
      n("section", "", "screen-main", [
        heading(
          "Thoughtfully made for every day.",
          "A collection of things that make a little difference.",
        ),
        n("div", "", "screen-grid", [
          component("card-product"),
          component("card-product"),
          component("card-product"),
        ]),
      ]),
      n("section", "", "screen-main", [
        heading("A little more possibility.", "Made for where you’re going."),
        component("layout-grid"),
      ]),
    );
  return n("div", "", "ui screen-website", [
    nav,
    ...content,
    component("layout-footer"),
  ]);
}
function advanced(kind: string): ElementNode {
  const map: Record<string, () => ElementNode> = {
    "Kanban board": kanban,
    Calendar: calendar,
    "Chat interface": chat,
    "File manager": () => component("advanced-file-manager"),
    "Multi-step form": () => component("advanced-multistep"),
    "Data table management": dataTable,
    "Notification center": () =>
      n("section", "", "screen-stack", [
        component("feedback-notification"),
        component("feedback-alert"),
        component("feedback-success"),
      ]),
    "UI configuration": () =>
      n("section", "", "screen-grid", [
        component("form-color"),
        component("form-range"),
        component("form-switch"),
        component("form-select"),
      ]),
    "Profile management": () =>
      n("section", "", "screen-grid", [
        component("card-profile"),
        component("form-validation"),
      ]),
    Reports: () =>
      n("section", "", "screen-stack", [
        stats("Reports"),
        component("data-chart"),
        dataTable(),
      ]),
  };
  return applicationScreen(kind, [map[kind]()]);
}
const screenCss = `
.screen-shell{display:grid;grid-template-columns:240px minmax(0,1fr);min-height:100vh;background:#f6f9f2}.screen-shell>.ui-side-nav{border-radius:0;border:0;border-right:1px solid #dce5d7;min-height:100vh}.screen-content{min-width:0}.screen-main{padding:clamp(20px,3vw,44px);min-width:0}.screen-heading{padding:8px 0 28px}.screen-heading h1{font-size:clamp(28px,3vw,38px);margin:12px 0 10px}.screen-heading p{margin:0}.screen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:22px;margin-bottom:26px}.screen-stats{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))}.screen-stack{display:grid;gap:22px}.screen-auth{min-height:100vh;display:grid;place-items:center;padding:32px 18px;background:radial-gradient(at 0% 0%,#dbe9c9,transparent 60%),#f4f8ef}.screen-auth-form{width:min(100%,460px)}.screen-auth-brand{display:block;font-size:24px;font-weight:700;letter-spacing:-1px;margin:0 0 22px;text-align:center}.screen-auth-form h1{font-size:32px;margin:0 0 20px}.screen-auth-form form{gap:20px}.screen-auth-split{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:60px;padding:60px}.screen-auth-story{max-width:520px}.screen-auth-story>svg{width:45px;height:45px;color:#668448}.screen-auth-story h2{font-size:clamp(32px,4vw,54px);margin:28px 0}.screen-auth-story .ui-card{margin-top:32px;background:#ffffffb3}.screen-website{background:#f9fbf5;min-height:100vh}.screen-website>.screen-heading{padding:60px 6% 20px;text-align:center}.screen-portfolio{display:grid;grid-template-columns:1.1fr 1fr;gap:30px;padding:70px 6%;align-items:center}.screen-portfolio h1{font-size:clamp(34px,4.8vw,64px);max-width:680px;margin:20px 0;grid-column:1}.screen-portfolio p{grid-column:1;max-width:480px;margin:0}.screen-portfolio>.ui-artwork{grid-column:2;grid-row:1/5;height:420px;transform:rotate(3deg)}.screen-docs{display:grid;grid-template-columns:230px minmax(0,1fr)}.screen-docs>.ui-side-nav{width:100%;border-radius:0;border-block:0}.screen-product-art{height:480px}.screen-product-art>svg{width:140px;height:140px}.screen-main>h1{font-size:40px}.screen-content>.ui-nav-dashboard>.ui-nav-links{display:none}
@media(max-width:900px){.screen-shell{grid-template-columns:minmax(0,1fr)}.screen-shell>.ui-side-nav{min-height:0;border-right:0;border-bottom:1px solid #dce5d7;display:flex;flex-direction:row;flex-wrap:wrap;padding:20px}.screen-shell>.ui-side-nav>.ui-nav-brand{width:100%;margin:0}.screen-auth-split{grid-template-columns:minmax(0,1fr);gap:32px;padding:30px 20px}.screen-auth-story{display:none}.screen-portfolio{grid-template-columns:minmax(0,1fr);padding:42px 6%}.screen-portfolio>.ui-artwork{grid-column:1;grid-row:auto;height:260px;margin:20px 0 0;transform:none}.screen-docs{grid-template-columns:minmax(0,1fr)}.screen-docs>.ui-side-nav{min-height:0}.screen-product-art{height:280px}}
`;
export const modernScreens: LibraryEntry[] = [
  ...[
    "Forgot password",
    "Reset password",
    "OTP verification",
    "Split-screen sign in",
  ].map((title) => ({
    title,
    category: "Authentication",
    create: () => authentication(title),
  })),
  ...["Financial", "Sales", "Project", "Developer", "CRM"].map((kind) => ({
    title: kind + " dashboard",
    category: "Dashboards",
    create: () => dashboard(kind),
  })),
  ...["Inventory", "Customers", "Orders"].map((kind) => ({
    title: kind + " management",
    category: "Management",
    create: () => management(kind),
  })),
  ...[
    "Portfolio",
    "E-commerce homepage",
    "Product detail",
    "Pricing page",
    "Contact page",
    "Blog layout",
    "Documentation website",
  ].map((title) => ({
    title,
    category: "Websites",
    create: () => website(title),
  })),
  ...[
    "Data table management",
    "Multi-step form",
    "Kanban board",
    "Calendar",
    "Reports",
    "Notification center",
    "Chat interface",
    "File manager",
    "UI configuration",
    "Profile management",
  ].map((title) => ({
    title,
    category: "Applications",
    create: () => advanced(title),
  })),
].map((item) => ({
  id: "screen-" + item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name: item.title,
  description:
    "Complete editable " +
    item.title.toLowerCase() +
    ". Sample figures stay local; connect your own data services.",
  category: item.category,
  icon: "layout",
  create: () => ({ root: item.create(), css: modernCss + screenCss }),
}));

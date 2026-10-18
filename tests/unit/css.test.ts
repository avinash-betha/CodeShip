import { describe, it, expect } from "vitest";
import {
  assertSafeCss,
  declarations,
  duplicateStyles,
  mergeClonedStyles,
  parseCss,
  selectorFor,
  setDeclarations,
} from "../../packages/css-engine";
import { importHtml } from "../../packages/editor-core/import";
import {
  animationCss,
  defaultAnimation,
} from "../../packages/animation-engine";
describe("CSS AST round trips", () => {
  it("accepts punctuation inside valid values without accepting injected declarations", () => {
    const css = setDeclarations("", ".card", {
      "--标题": '"a;b"',
      float: "left",
      "future-layout": "magic",
      color: "red !important",
    });
    expect(declarations(css, ".card")["--标题"]).toBe('"a;b"');
    expect(css).toContain("!important");
    expect(() =>
      setDeclarations(css, ".card", { color: "red;display:none" }),
    ).toThrow();
    expect(() =>
      setDeclarations(css, ".card", { color: "red} body{display:none" }),
    ).toThrow();
  });
  it("preserves unknown inline declarations, quoted semicolons and important priority through HTML import", () => {
    const imported = importHtml(
      '<main style="future-layout: magic; --label: &quot;a;b&quot;; color: red !important"></main>',
      "",
    );
    const values = declarations(imported.css, selectorFor(imported.root.id));
    expect(values["future-layout"]).toBe("magic");
    expect(values["--label"]).toBe('"a;b"');
    expect(imported.css).toContain("!important");
  });
  it("does not let nested hover declarations overwrite a base property read", () => {
    expect(
      declarations(".card { color: red; &:hover { color:blue; } }", ".card")
        .color,
    ).toBe("red");
  });
  it("copies scoped styles without exponential shared CSS growth or undoing current global edits", () => {
    const old = selectorFor("old"),
      fresh = selectorFor("new");
    const source = `.global {color:red} ${old}{padding:20px}@media(max-width:600px){${old}{padding:10px}}`;
    const current = source.replace("color:red", "color:green");
    const merged = mergeClonedStyles(
      current,
      source,
      new Map([["old", "new"]]),
    );
    expect(declarations(merged, ".global").color).toBe("green");
    expect(merged.match(/\.global/g)).toHaveLength(1);
    expect(merged).toContain(fresh);
    expect(declarations(merged, fresh).padding).toBe("20px");
    expect(mergeClonedStyles(merged, source, new Map([["old", "new"]]))).toBe(
      merged,
    );
  });
  it("retains tracked element identities, scoped CSS and interactions when source is edited", () => {
    const first = importHtml("<main><button>Before</button></main>", "");
    const button = first.root.children[0];
    button.interactions = [
      {
        event: "click",
        action: "toggle-class",
        target: button.id,
        value: "active",
      },
    ];
    const source = `<main data-cs-id="${first.root.id}"><button data-cs-id="${button.id}" data-keep="yes">After</button></main>`;
    const edited = importHtml(
      source,
      `[data-cs-id="${button.id}"] { color: red; }`,
      first.root,
    );
    expect(edited.root.id).toBe(first.root.id);
    expect(edited.root.children[0].id).toBe(button.id);
    expect(edited.root.children[0].interactions).toEqual(button.interactions);
    expect(edited.root.children[0].text).toBe("After");
  });
  const advanced =
    '/* preserve me */\n@layer utilities { .card { --space: clamp(1rem, 4cqi, 4rem); display: grid; grid-template-columns: subgrid; &:hover { color: oklch(60% .2 40); } } }\n@container sidebar (width > 20rem) { .x::before { content: "custom"; } }\n@supports (display: grid) { .a { view-timeline-name: --reveal; } }';
  it("preserves unfamiliar declarations, nested selectors, comments, layers and at-rules", () => {
    const output = setDeclarations(advanced, ".editable", { padding: "20px" });
    expect(output).toContain(advanced);
    expect(parseCss(output).error).toBeUndefined();
    expect(declarations(output, ".editable").padding).toBe("20px");
  });
  it("updates only the intended rule and query without removing other CSS", () => {
    const css =
      ".x { color: red; } @media (max-width: 617px) { .x { color: blue; } }";
    const output = setDeclarations(
      css,
      ".x",
      { color: "green" },
      "@media (max-width: 617px)",
    );
    expect(declarations(output, ".x").color).toBe("red");
    expect(declarations(output, ".x", "@media (max-width: 617px)").color).toBe(
      "green",
    );
  });
  it("duplicates selectors across responsive and pseudo rules", () => {
    const s = selectorFor("old");
    const output = duplicateStyles(
      `${s}:hover{color:red}@media(max-width:500px){${s}{width:100%}}`,
      new Map([["old", "new"]]),
    );
    expect(output).toContain(selectorFor("new") + ":hover");
    expect(output).toContain(selectorFor("old"));
  });
  it("rejects malformed CSS and executable asset syntax", () => {
    expect(parseCss("a { color: red").error).toBeTruthy();
    for (const css of [
      '@import "x.css";',
      "a{background:url(javascript:alert(1))}",
      "a{width:expression(alert(1))}",
      "a{background:url(\\6a avascript:alert(1))}",
      "a{color:red}</style><script>bad</script>",
    ])
      expect(() => assertSafeCss(css)).toThrow();
  });
  it("imports semantic HTML, attributes and inline styles with a sanitization report", () => {
    const result = importHtml(
      '<section data-test="kept" style="width: 900px"><h1>Hello</h1><img src="javascript:bad" onerror="bad()"><script>bad()</script></section>',
      ".kept{--x: 12px}",
    );
    expect(result.root.tag).toBe("section");
    expect(result.root.attributes["data-test"]).toBe("kept");
    expect(result.root.children[1].attributes.src).toBeUndefined();
    expect(result.warnings.length).toBeGreaterThan(1);
    expect(declarations(result.css, selectorFor(result.root.id)).width).toBe(
      "900px",
    );
    expect(result.css).toContain("--x: 12px");
  });
  it("generates editable keyframes, animation declarations and reduced motion", () => {
    const output = animationCss(advanced, "node", defaultAnimation());
    expect(output).toContain("@keyframes enter-node");
    expect(output).toContain("prefers-reduced-motion");
    expect(declarations(output, selectorFor("node")).animation).toContain(
      "600ms",
    );
    expect(output).toContain(advanced);
    expect(() =>
      animationCss("", "node", { ...defaultAnimation(), duration: -1 }),
    ).toThrow();
  });
});

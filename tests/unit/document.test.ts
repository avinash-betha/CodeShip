import { describe, it, expect } from "vitest";
import {
  applyOperation,
  createProject,
  currentPage,
  duplicateNode,
  element,
  findNode,
  findParent,
  History,
  walk,
} from "../../packages/document-model";
import {
  parseProject,
  validateTree,
  safeAttribute,
  safeUrl,
} from "../../packages/validation";
describe("universal document operations", () => {
  it("migrates pre-interaction schema zero and rejects unsafe internal path identifiers", () => {
    const p = createProject("Legacy");
    const legacy = JSON.parse(JSON.stringify(p)) as Record<string, unknown>;
    legacy["schemaVersion"] = 0;
    delete legacy["components"];
    expect(parseProject(JSON.stringify(legacy)).schemaVersion).toBe(1);
    p.assets = [
      {
        id: "../../escape",
        name: "invalid",
        type: "image/png",
        url: "https://example.com/a.png",
      },
    ];
    expect(() => parseProject(JSON.stringify(p))).toThrow("Unsafe asset");
  });
  it("supports select options and enforces table and list content models", () => {
    const option = element("option", "One"),
      select = element("select");
    expect(
      applyOperation(select, {
        type: "insert",
        parentId: select.id,
        node: option,
      }).children,
    ).toHaveLength(1);
    const table = element("table");
    expect(() =>
      applyOperation(table, {
        type: "insert",
        parentId: table.id,
        node: element("div"),
      }),
    ).toThrow();
  });
  it("inserts nested elements, updates, moves, groups and removes without changing the input", () => {
    const root = element("main"),
      a = element("section"),
      b = element("section"),
      text = element("p", "Hello");
    let next = applyOperation(root, {
      type: "insert",
      parentId: root.id,
      node: a,
    });
    next = applyOperation(next, { type: "insert", parentId: root.id, node: b });
    next = applyOperation(next, { type: "insert", parentId: a.id, node: text });
    expect(root.children).toHaveLength(0);
    expect(findParent(next, text.id)?.id).toBe(a.id);
    next = applyOperation(next, {
      type: "update",
      id: text.id,
      changes: { text: "Updated", attributes: { "aria-label": "Greeting" } },
    });
    expect(findNode(next, text.id)?.text).toBe("Updated");
    next = applyOperation(next, { type: "move", id: text.id, parentId: b.id });
    expect(findParent(next, text.id)?.id).toBe(b.id);
    next = applyOperation(next, { type: "group", ids: [a.id, b.id] });
    expect(next.children[0].name).toBe("Group");
    expect(next.children[0].children).toHaveLength(2);
    next = applyOperation(next, { type: "remove", id: text.id });
    expect(findNode(next, text.id)).toBeUndefined();
  });
  it("rejects cycles, duplicate identities, invalid nesting and root deletion", () => {
    const child = element("section"),
      root = element("main", "", {}, [child]);
    expect(() =>
      applyOperation(root, { type: "move", id: child.id, parentId: child.id }),
    ).toThrow();
    expect(() =>
      applyOperation(root, { type: "insert", parentId: root.id, node: child }),
    ).toThrow("unique");
    expect(() =>
      applyOperation(root, {
        type: "insert",
        parentId: root.id,
        node: element("li", "Wrong nesting"),
      }),
    ).toThrow();
    expect(() =>
      applyOperation(root, { type: "remove", id: root.id }),
    ).toThrow();
  });
  it("duplicates stable internal references and omits duplicate HTML IDs", () => {
    const node = element("section", "", { id: "original" }, [
      element("button", "Toggle"),
    ]);
    node.children[0].interactions = [
      {
        event: "click",
        action: "toggle-class",
        target: node.id,
        value: "active",
      },
    ];
    const copy = duplicateNode(node);
    expect(copy.id).not.toBe(node.id);
    expect(copy.attributes.id).toBeUndefined();
    expect(copy.children[0].interactions[0].target).toBe(copy.id);
  });
  it("maintains bounded undo and redo transaction history", () => {
    const history = new History<number>(2);
    history.record(0);
    history.record(1);
    history.record(2);
    expect(history.undo(3)).toBe(2);
    expect(history.undo(2)).toBe(1);
    expect(history.undo(1)).toBeUndefined();
    expect(history.redo(1)).toBe(2);
    history.record(2);
    expect(history.canRedo).toBe(false);
  });
  it("serializes a complete versioned project and rejects future schema versions", () => {
    const p = createProject("Portable");
    p.tokens["--brand"] = "#123456";
    expect(parseProject(JSON.stringify(p))).toEqual(p);
    expect(() =>
      parseProject(JSON.stringify({ ...p, schemaVersion: 9 })),
    ).toThrow("schema");
    expect(currentPage(p).root.tag).toBe("main");
  });
  it("reports accessibility guidance and duplicate HTML ids", () => {
    const root = element("main", "", {}, [
      element("input"),
      element("img"),
      element("div", "", { id: "same" }),
      element("div", "", { id: "same" }),
    ]);
    const issues = validateTree(root);
    expect(issues.some((i) => i.message.includes("label"))).toBe(true);
    expect(issues.some((i) => i.message.includes("alternative"))).toBe(true);
    expect(issues.some((i) => i.message.includes("Duplicate HTML"))).toBe(true);
  });
  it("rejects unsafe URLs, executable attributes and prototype pollution", () => {
    expect(safeUrl("java\nscript:alert(1)")).toBe(false);
    expect(safeUrl("https://example.com")).toBe(true);
    expect(safeAttribute("onclick", "alert(1)")).toBe(false);
    expect(safeAttribute("data-custom", "preserved")).toBe(true);
    expect(() => parseProject('{"__proto__":{"polluted":true}}')).toThrow(
      "Unsafe",
    );
    const p = createProject();
    p.pages[0].root.attributes.srcdoc = "<script>bad</script>";
    expect(() => parseProject(JSON.stringify(p))).toThrow();
  });
  it("handles a representative large tree within a practical operation budget", () => {
    const root = element(
      "main",
      "",
      {},
      Array.from({ length: 1500 }, (_, i) => element("p", `Item ${i}`)),
    );
    const start = performance.now();
    const next = applyOperation(root, {
      type: "update",
      id: root.children[1499].id,
      changes: { text: "Changed" },
    });
    let count = 0;
    walk(next, () => count++);
    expect(count).toBe(1501);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

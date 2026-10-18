import { describe, it, expect } from "vitest";
import {
  analyzeMeasurements,
  applyRecommendation,
  type Measurement,
} from "../../packages/responsive-engine";
const measurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  id: "measured",
  name: "section",
  tag: "section",
  viewport: 617,
  width: 900,
  height: 200,
  scrollWidth: 900,
  parentWidth: 617,
  left: 0,
  right: 900,
  display: "block",
  columns: "none",
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: 20,
  padding: 20,
  fontSize: 16,
  position: "static",
  overlap: false,
  ...overrides,
});
describe("measured responsive recommendations", () => {
  it("bases fluid width recommendations on measured constraints", () => {
    const r = analyzeMeasurements([measurement()]);
    expect(r[0].title).toContain("fluid");
    expect(r[0].explanation).toContain("617px");
    const css = applyRecommendation(".unrelated{color:red}", r[0]);
    expect(css).toContain("max-width:100%");
    expect(css).toContain(".unrelated");
  });
  it("derives actual flex breakpoints from the first observed failing width", () => {
    const r = analyzeMeasurements([
      measurement({ display: "flex", viewport: 617 }),
      measurement({ display: "flex", viewport: 480 }),
    ]);
    const flex = r.find((r) => r.id.endsWith(":flex"))!;
    expect(flex.context).toContain("617px");
    expect(flex.alternatives?.[0].styles["flex-direction"]).toBe("column");
  });
  it("uses container queries when an actual container was measured", () => {
    const r = analyzeMeasurements([
      measurement({ display: "flex", containerId: "container" }),
    ]);
    expect(r.find((r) => r.id.endsWith(":flex"))?.context).toContain(
      "@container",
    );
  });
  it("offers grid, table, media, typography, spacing and overlap guidance", () => {
    const r = analyzeMeasurements([
      measurement({
        id: "grid",
        display: "grid",
        columns: "300px 300px 300px",
      }),
      measurement({ id: "table", tag: "table" }),
      measurement({ id: "img", tag: "img" }),
      measurement({
        id: "title",
        tag: "h1",
        fontSize: 100,
        padding: 200,
        gap: 100,
        overlap: true,
      }),
    ]);
    for (const kind of [
      "grid",
      "table",
      "media",
      "type",
      "padding",
      "gap",
      "overlap",
    ])
      expect(r.some((r) => r.id.endsWith(":" + kind))).toBe(true);
    expect(r.find((r) => r.id.endsWith(":overlap"))?.confidence).toBeLessThan(
      0.7,
    );
  });
  it("does not invent issues for a fitting layout", () => {
    expect(
      analyzeMeasurements([
        measurement({
          width: 400,
          scrollWidth: 400,
          right: 400,
          parentWidth: 617,
        }),
      ]),
    ).toHaveLength(0);
  });
});

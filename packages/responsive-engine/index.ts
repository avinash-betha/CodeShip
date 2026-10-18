import { selectorFor, setDeclarations } from "../css-engine";
import type { Styles } from "../document-model";
export interface Measurement {
  id: string;
  name: string;
  tag: string;
  viewport: number;
  width: number;
  height: number;
  scrollWidth: number;
  parentWidth: number;
  left: number;
  right: number;
  display: string;
  columns: string;
  flexDirection: string;
  flexWrap: string;
  gap: number;
  padding: number;
  fontSize: number;
  position: string;
  overlap: boolean;
  containerId?: string;
  containerWidth?: number;
}
export interface Recommendation {
  id: string;
  nodeId: string;
  title: string;
  explanation: string;
  confidence: number;
  severity: "critical" | "warning" | "info";
  viewport: number;
  selector: string;
  styles: Styles;
  context: string;
  alternatives?: { label: string; styles: Styles; context: string }[];
  status: "pending" | "applied" | "rejected";
}
export function measureDocument(
  doc: Document,
  viewport: number,
): Measurement[] {
  const win = doc.defaultView;
  if (!win) return [];
  return [...doc.querySelectorAll<HTMLElement>("[data-cs-id]")].map((el) => {
    const r = el.getBoundingClientRect(),
      style = win.getComputedStyle(el),
      parent = el.parentElement;
    const siblings = parent
      ? [...parent.children].filter(
          (n) => n !== el && n instanceof win.HTMLElement,
        )
      : [];
    const overlap =
      !["absolute", "fixed"].includes(style.position) &&
      siblings.some((s) => {
        const b = s.getBoundingClientRect();
        const ss = win.getComputedStyle(s);
        return (
          ss.position === "static" &&
          Math.min(r.right, b.right) - Math.max(r.left, b.left) > 4 &&
          Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top) > 4
        );
      });
    let containerId: string | undefined;
    let containerWidth: number | undefined;
    let ancestor = parent;
    while (ancestor) {
      if (win.getComputedStyle(ancestor).containerType !== "normal") {
        containerId = ancestor.dataset["csId"];
        containerWidth = ancestor.clientWidth;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    return {
      id: el.dataset["csId"] ?? "",
      name: el.getAttribute("aria-label") ?? el.tagName.toLowerCase(),
      tag: el.tagName.toLowerCase(),
      viewport,
      width: r.width,
      height: r.height,
      scrollWidth: el.scrollWidth,
      parentWidth: parent?.clientWidth ?? viewport,
      left: r.left,
      right: r.right,
      display: style.display,
      columns: style.gridTemplateColumns,
      flexDirection: style.flexDirection,
      flexWrap: style.flexWrap,
      gap: parseFloat(style.gap) || 0,
      padding:
        (parseFloat(style.paddingLeft) || 0) +
        (parseFloat(style.paddingRight) || 0),
      fontSize: parseFloat(style.fontSize) || 16,
      position: style.position,
      overlap,
      containerId,
      containerWidth,
    };
  });
}
export function analyzeMeasurements(samples: Measurement[]): Recommendation[] {
  const suggestions = new Map<string, Recommendation>();
  const add = (
    m: Measurement,
    kind: string,
    title: string,
    explanation: string,
    styles: Styles,
    confidence: number,
    severity: Recommendation["severity"] = "warning",
    conditional = false,
    alternatives?: Recommendation["alternatives"],
  ) => {
    const id = `${m.id}:${kind}`,
      existing = suggestions.get(id);
    const context = conditional
      ? `${m.containerId ? "@container" : "@media"} (max-width: ${Math.ceil(m.containerWidth ?? m.viewport)}px)`
      : "";
    const candidate: Recommendation = {
      id,
      nodeId: m.id,
      title,
      explanation,
      styles,
      confidence,
      severity,
      viewport: m.viewport,
      selector: selectorFor(m.id),
      context,
      status: "pending",
      alternatives,
    };
    if (!existing || m.viewport > existing.viewport)
      suggestions.set(id, candidate);
  };
  for (const m of samples) {
    if (m.width < 1 || m.height < 1) continue;
    const overflow =
      m.scrollWidth > m.width + 3 ||
      m.width > m.parentWidth + 3 ||
      m.right > m.viewport + 3 ||
      m.left < -3;
    if (
      overflow &&
      ["p", "span", "h1", "h2", "h3", "a", "code", "pre"].includes(m.tag) &&
      m.scrollWidth > m.width + 3
    )
      add(
        m,
        "wrapping",
        "Let long text wrap within its container",
        `Text requires ${Math.ceil(m.scrollWidth)}px inside a ${Math.ceil(m.width)}px box at ${m.viewport}px. Wrap long words without changing the content.`,
        { "overflow-wrap": "anywhere", "min-width": "0" },
        0.89,
      );
    if (
      ["img", "video", "canvas"].includes(m.tag) &&
      (overflow || m.width > m.parentWidth)
    )
      add(
        m,
        "media",
        "Let media scale with its container",
        `At ${m.viewport}px, this ${m.tag} extends beyond its available space. A fluid width preserves its aspect ratio.`,
        { "max-width": "100%", height: "auto" },
        0.98,
      );
    else if (m.tag === "table" && overflow)
      add(
        m,
        "table",
        "Keep this table horizontally scrollable",
        `The table needs ${Math.ceil(m.scrollWidth)}px at a ${m.viewport}px viewport. Preserve the columns using a scroll region.`,
        { display: "block", "max-width": "100%", "overflow-x": "auto" },
        0.93,
        "warning",
        true,
      );
    else if (overflow && m.width > m.parentWidth + 3)
      add(
        m,
        "width",
        "Replace a rigid width with a fluid constraint",
        `This element measures ${Math.ceil(m.width)}px inside ${Math.ceil(m.parentWidth)}px of available space at ${m.viewport}px.`,
        { "max-width": "100%", "min-width": "0", "box-sizing": "border-box" },
        0.94,
        "critical",
      );
    if (
      m.display === "flex" &&
      m.flexDirection === "row" &&
      m.flexWrap === "nowrap" &&
      overflow
    )
      add(
        m,
        "flex",
        "Give this row room to wrap",
        `Content overflows its flex row at ${m.viewport}px. Wrapping preserves the reading order; stacking is an alternative when a vertical layout fits your intent.`,
        { "flex-wrap": "wrap" },
        0.88,
        "warning",
        true,
        [
          {
            label: "Stack vertically",
            styles: { "flex-direction": "column", "align-items": "stretch" },
            context: `@media (max-width: ${m.viewport}px)`,
          },
        ],
      );
    if (m.display === "grid" && overflow && m.columns.split(" ").length > 1)
      add(
        m,
        "grid",
        "Make grid columns fit the available space",
        `The rendered ${m.columns.split(" ").length}-column grid overflows at ${m.viewport}px. Intrinsic columns adapt without a device-specific breakpoint.`,
        {
          "grid-template-columns":
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        },
        0.87,
      );
    if (m.padding > m.viewport * 0.28 && m.viewport <= 768)
      add(
        m,
        "padding",
        "Recover space from oversized padding",
        `Horizontal padding uses ${Math.round((m.padding / m.viewport) * 100)}% of this viewport. Fluid spacing leaves room for content.`,
        { "padding-inline": "clamp(16px, 4vw, 48px)" },
        0.85,
        "warning",
        true,
      );
    if (m.gap > m.viewport * 0.1 && m.viewport <= 768)
      add(
        m,
        "gap",
        "Let spacing scale with the screen",
        `A ${m.gap}px gap consumes too much horizontal room at ${m.viewport}px.`,
        { gap: "clamp(12px, 3vw, 32px)" },
        0.82,
        "info",
        true,
      );
    if (
      /^h[1-3]$/.test(m.tag) &&
      m.fontSize > m.viewport * 0.1 &&
      m.viewport <= 768
    )
      add(
        m,
        "type",
        "Use fluid heading typography",
        `This heading is ${Math.round(m.fontSize)}px at ${m.viewport}px. clamp() preserves hierarchy while improving narrow-screen wrapping.`,
        {
          "font-size": `clamp(28px, 5vw, ${Math.round(m.fontSize)}px)`,
          "overflow-wrap": "break-word",
        },
        0.83,
        "info",
      );
    if (m.overlap)
      add(
        m,
        "overlap",
        "Review overlapping content",
        `Measured sibling boxes overlap at ${m.viewport}px. This may be intentional; review spacing before applying a change.`,
        { gap: "16px" },
        0.5,
        "warning",
        true,
        [
          {
            label: "Allow wrapping",
            styles: { "flex-wrap": "wrap" },
            context: `@media (max-width: ${m.viewport}px)`,
          },
        ],
      );
  }
  return [...suggestions.values()].sort((a, b) => b.confidence - a.confidence);
}
export function applyRecommendation(css: string, r: Recommendation): string {
  return setDeclarations(css, r.selector, r.styles, r.context);
}
export const analysisWidths = [1280, 1024, 880, 768, 640, 480, 375];

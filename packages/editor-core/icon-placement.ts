import {
  currentPage,
  element,
  findNode,
  findParent,
  type ElementNode,
  type Project,
} from "../document-model";
import { selectorFor, setDeclarations } from "../css-engine";

export type IconPlacement =
  "before-text" | "after-text" | "above-text" | "below-text" | "icon-only";
export const iconPlacements: { value: IconPlacement; label: string }[] = [
  { value: "before-text", label: "Before text" },
  { value: "after-text", label: "After text" },
  { value: "above-text", label: "Above text" },
  { value: "below-text", label: "Below text" },
  { value: "icon-only", label: "Icon only" },
];
export const buttonLabel = (node: ElementNode): string =>
  node.tag === "svg"
    ? ""
    : [node.text, ...node.children.map(buttonLabel)]
        .filter(Boolean)
        .join(" ")
        .trim();

/** Used inside a store transaction: existing vectors move without changing identity. */
export function placeButtonIcon(
  project: Project,
  icon: ElementNode,
  buttonId: string,
  placement: IconPlacement,
): void {
  const page = currentPage(project),
    button = findNode(page.root, buttonId);
  if (!button || !["button", "a"].includes(button.tag) || icon.tag !== "svg")
    throw new Error("Choose an SVG icon and a button or link.");
  if (!iconPlacements.some((p) => p.value === placement))
    throw new Error("Choose an icon placement.");
  const existing = findNode(page.root, icon.id);
  if (existing) {
    const parent = findParent(page.root, icon.id);
    if (!parent)
      throw new Error("The page root cannot be moved into a button.");
    parent.children.splice(
      parent.children.findIndex((child) => child.id === icon.id),
      1,
    );
    icon = existing;
  }
  const label =
    button.attributes["aria-label"] || buttonLabel(button) || "Action";
  if (button.text) {
    button.children.unshift(element("span", button.text));
    button.text = "";
  }
  if (["before-text", "above-text", "icon-only"].includes(placement))
    button.children.unshift(icon);
  else button.children.push(icon);
  button.attributes["data-cs-icon-layout"] = placement;
  if (placement === "icon-only") button.attributes["aria-label"] ||= label;
  page.css = setDeclarations(page.css, selectorFor(button.id), {
    display: "inline-flex",
    "align-items": "center",
    "justify-content": "center",
    gap: "8px",
    "flex-direction": ["above-text", "below-text"].includes(placement)
      ? "column"
      : "row",
  });
  page.css = setDeclarations(page.css, selectorFor(icon.id), {
    position: "static",
    left: "auto",
    top: "auto",
    right: "auto",
    bottom: "auto",
    margin: "0",
    transform: "none",
    "flex-shrink": "0",
    "pointer-events": "auto",
  });
  page.css = setDeclarations(
    page.css,
    selectorFor(button.id) + " > :not(svg)",
    {
      display: placement === "icon-only" ? "none" : "",
    },
  );
}

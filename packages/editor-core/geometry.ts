export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function snapAxis(
  value: number,
  size: number,
  targets: number[],
  tolerance = 6,
): { value: number; guide: number | null } {
  let closest = tolerance,
    offset = 0,
    guide: number | null = null;
  for (const point of [value, value + size / 2, value + size])
    for (const target of targets) {
      const distance = Math.abs(target - point);
      if (distance < closest) {
        closest = distance;
        offset = target - point;
        guide = target;
      }
    }
  return { value: value + offset, guide };
}
export function cssLength(
  value: string,
  reference: number,
  fallback: number,
): number {
  const number = parseFloat(value);
  return Number.isFinite(number)
    ? value.trim().endsWith("%")
      ? (reference * number) / 100
      : number
    : fallback;
}
export interface ResizeConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  snap?: number;
  aspect?: boolean;
}
export function resizeBounds(
  start: Bounds,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  limits: ResizeConstraints = {},
): Bounds {
  const horizontal = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0,
    vertical = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
  const snap = Math.max(1, limits.snap ?? 1),
    ratio = start.width / Math.max(1, start.height);
  let width = horizontal
    ? Math.round((start.width + dx * horizontal) / snap) * snap
    : start.width;
  let height = vertical
    ? Math.round((start.height + dy * vertical) / snap) * snap
    : start.height;
  if (limits.aspect) {
    if (horizontal && (!vertical || Math.abs(dx) >= Math.abs(dy) * ratio))
      height = width / ratio;
    else width = height * ratio;
    const min = Math.max(
        (limits.minWidth ?? 16) / start.width,
        (limits.minHeight ?? 16) / start.height,
      ),
      max = Math.min(
        (limits.maxWidth ?? Infinity) / start.width,
        (limits.maxHeight ?? Infinity) / start.height,
      );
    const factor = Math.max(min, Math.min(max, width / start.width));
    width = start.width * factor;
    height = start.height * factor;
  } else {
    width = Math.max(
      limits.minWidth ?? 16,
      Math.min(limits.maxWidth ?? Infinity, width),
    );
    height = Math.max(
      limits.minHeight ?? 16,
      Math.min(limits.maxHeight ?? Infinity, height),
    );
  }
  return {
    x: start.x + (horizontal === -1 ? start.width - width : 0),
    y: start.y + (vertical === -1 ? start.height - height : 0),
    width,
    height,
  };
}

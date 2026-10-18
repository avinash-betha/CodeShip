import postcss from "postcss";
import { assertSafeCss, selectorFor, setDeclarations } from "../css-engine";
export interface Keyframe {
  offset: number;
  opacity: string;
  transform: string;
}
export interface AnimationConfig {
  name: string;
  duration: number;
  delay: number;
  easing: string;
  iterations: string;
  direction: string;
  fill: string;
  frames: Keyframe[];
}
export const defaultAnimation = (): AnimationConfig => ({
  name: "enter",
  duration: 600,
  delay: 0,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  iterations: "1",
  direction: "normal",
  fill: "both",
  frames: [
    { offset: 0, opacity: "0", transform: "translateY(24px)" },
    { offset: 100, opacity: "1", transform: "translateY(0)" },
  ],
});
export function animationCss(
  css: string,
  nodeId: string,
  config: AnimationConfig,
): string {
  if (!/^[a-zA-Z][\w-]*$/.test(config.name) || config.frames.length < 2)
    throw new Error("Animation needs a valid name and at least two keyframes.");
  if (
    !Number.isFinite(config.duration) ||
    config.duration < 0 ||
    config.duration > 120000 ||
    !Number.isFinite(config.delay) ||
    config.delay < 0
  )
    throw new Error(
      "Use a duration between 0 and 120000 ms and a non-negative delay.",
    );
  if (!/^(infinite|\d+(\.\d+)?)$/.test(config.iterations))
    throw new Error("Iterations must be a number or infinite.");
  if (
    !["normal", "reverse", "alternate", "alternate-reverse"].includes(
      config.direction,
    ) ||
    !["none", "forwards", "backwards", "both"].includes(config.fill)
  )
    throw new Error("Select a valid animation direction and fill mode.");
  if (
    !/^(ease|linear|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\([\d.\s,-]+\)|steps\([\w\s,-]+\))$/.test(
      config.easing,
    )
  )
    throw new Error("Enter a valid easing keyword or cubic-bezier curve.");
  const name = `${config.name}-${nodeId}`,
    root = postcss.parse(css);
  root.walkAtRules("keyframes", (a) => {
    if (a.params === name) a.remove();
  });
  const at = postcss.atRule({ name: "keyframes", params: name });
  for (const frame of [...config.frames].sort((a, b) => a.offset - b.offset)) {
    if (
      frame.offset < 0 ||
      frame.offset > 100 ||
      /[{};]/.test(frame.transform) ||
      !Number.isFinite(Number(frame.opacity)) ||
      Number(frame.opacity) < 0 ||
      Number(frame.opacity) > 1
    )
      throw new Error(
        "Use offsets and opacity in range, with one transform value.",
      );
    const rule = postcss.rule({ selector: `${frame.offset}%` });
    rule.append(
      { prop: "opacity", value: frame.opacity },
      { prop: "transform", value: frame.transform },
    );
    at.append(rule);
  }
  root.append(at);
  assertSafeCss(root.toString());
  let result = setDeclarations(root.toString(), selectorFor(nodeId), {
    animation: `${name} ${config.duration}ms ${config.easing} ${config.delay}ms ${config.iterations} ${config.direction} ${config.fill}`,
  });
  result = setDeclarations(
    result,
    selectorFor(nodeId),
    { animation: "none", transition: "none" },
    "@media (prefers-reduced-motion: reduce)",
  );
  return result;
}

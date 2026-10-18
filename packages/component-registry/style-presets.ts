export interface StylePreset {
  name: string;
  icon: string;
  values: Record<string, string>;
}
const preset = (
  name: string,
  background: string,
  color: string,
  radius: string,
  shadow = "none",
  border = "1px solid transparent",
): StylePreset => ({
  name,
  icon: "brush",
  values: {
    background,
    color,
    ...(color === "inherit" ? {} : { "--ui-ink": color }),
    ...(["Dark modern", "Futuristic"].includes(name)
      ? { "--ui-muted": "#bed0c3", "--ui-line": "#53645b" }
      : {}),
    "border-radius": radius,
    "box-shadow": shadow,
    border,
  },
});
export const stylePresets: StylePreset[] = [
  preset(
    "Minimalistic",
    "#ffffff",
    "#202b26",
    "8px",
    "none",
    "1px solid #e1e6e1",
  ),
  preset(
    "Glassmorphism",
    "rgba(241,249,245,.88)",
    "#172d23",
    "20px",
    "0 16px 44px #142b2420",
    "1px solid #ffffffaa",
  ),
  preset(
    "Soft UI",
    "#f0f4ef",
    "#273d2d",
    "20px",
    "8px 8px 24px #a6b4a92e, -8px -8px 24px #ffffff",
  ),
  preset(
    "Neumorphism",
    "#e9edf0",
    "#26333b",
    "18px",
    "8px 8px 18px #c6c9cc, -8px -8px 18px #ffffff",
  ),
  preset(
    "Dark modern",
    "#1d2526",
    "#e6f2ed",
    "14px",
    "0 12px 32px #00000030",
    "1px solid #394645",
  ),
  preset(
    "Light modern",
    "#f8fbf7",
    "#23372a",
    "14px",
    "0 8px 26px #23372a0d",
    "1px solid #dde6dc",
  ),
  preset(
    "Gradient",
    "linear-gradient(125deg,#d7f5bd,#dcecfb)",
    "#223c31",
    "20px",
  ),
  preset(
    "Elevated surfaces",
    "#ffffff",
    "#23312b",
    "14px",
    "0 8px 28px #17291f1a",
  ),
  preset("Flat", "#e7efe0", "#243226", "0"),
  preset(
    "Outline",
    "transparent",
    "inherit",
    "10px",
    "none",
    "1.5px solid currentColor",
  ),
  preset(
    "Material-inspired",
    "#edf2fb",
    "#1d315a",
    "24px",
    "0 2px 5px #172e5020",
  ),
  preset(
    "Enterprise",
    "#ffffff",
    "#1d3045",
    "6px",
    "0 2px 8px #1224390a",
    "1px solid #dce2e9",
  ),
  preset(
    "Luxury minimal",
    "#faf7ef",
    "#302b24",
    "2px",
    "none",
    "1px solid #ded5c0",
  ),
  preset(
    "Futuristic",
    "linear-gradient(120deg,#10282c,#182132)",
    "#baf3ec",
    "16px",
    "0 0 24px #59ead21a",
    "1px solid #4c827b",
  ),
  preset(
    "Bento grid",
    "#f1f0eb",
    "#282c27",
    "28px",
    "none",
    "1px solid #e6e5dd",
  ),
  preset(
    "High-contrast",
    "#ffffff",
    "#111111",
    "4px",
    "none",
    "2px solid #111111",
  ),
];
export interface GlassSettings {
  tint: string;
  opacity: number;
  blur: number;
  saturation: number;
  borderOpacity: number;
  radius: number;
  shadow: number;
  dark: boolean;
  gradient: boolean;
}
export const defaultGlass: GlassSettings = {
  tint: "#f0faf5",
  opacity: 88,
  blur: 18,
  saturation: 140,
  borderOpacity: 60,
  radius: 20,
  shadow: 20,
  dark: false,
  gradient: false,
};
export function glassValues(s: GlassSettings): Record<string, string> {
  const limit = (value: number, min: number, max: number, fallback: number) =>
    Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  s = {
    ...s,
    opacity: limit(s.opacity, 10, 100, 88),
    blur: limit(s.blur, 0, 80, 18),
    saturation: limit(s.saturation, 0, 250, 140),
    borderOpacity: limit(s.borderOpacity, 0, 100, 60),
    radius: limit(s.radius, 0, 80, 20),
    shadow: limit(s.shadow, 0, 70, 20),
  };
  const tint = /^#[a-f0-9]{6}$/i.test(s.tint) ? s.tint : "#f0faf5",
    rgb = [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16)).join(",");
  return {
    background: s.gradient
      ? `linear-gradient(125deg,rgba(${rgb},${s.opacity / 100}),rgba(${rgb},${Math.max(0.05, s.opacity / 100 - 0.18)}))`
      : `rgba(${rgb},${s.opacity / 100})`,
    color: s.dark ? "#f5faf7" : "#152d23",
    "--ui-ink": s.dark ? "#f5faf7" : "#152d23",
    "--ui-muted": s.dark ? "#c0d4c8" : "#526c5e",
    "--ui-line": s.dark ? "#617568" : "#d7e4da",
    "backdrop-filter": `blur(${s.blur}px) saturate(${s.saturation}%)`,
    "-webkit-backdrop-filter": `blur(${s.blur}px) saturate(${s.saturation}%)`,
    border: `1px solid rgba(255,255,255,${s.borderOpacity / 100})`,
    "border-radius": s.radius + "px",
    "box-shadow": `0 12px 40px rgba(9,27,20,${s.shadow / 100})`,
    transition: "background 180ms ease, box-shadow 180ms ease",
  };
}

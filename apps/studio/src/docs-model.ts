export interface DocCode {
  language: string;
  text: string;
  caption: string;
}
export interface DocSection {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
  code?: DocCode;
  callout?: { kind: "info" | "warning"; title: string; text: string };
  image?: { src: string; alt: string; caption: string };
  links?: { id: string; label: string }[];
}
export interface DocArticle {
  id: string;
  title: string;
  category: string;
  group?: string;
  intro: string;
  action: DocAction;
  sections: DocSection[];
  related?: string[];
}
export const docActions = [
  "canvas",
  "projects",
  "settings",
  "components",
  "templates",
  "layers",
  "design",
  "html-inspector",
  "motion",
  "code",
  "responsive",
  "icons",
  "tutorial",
  "focus-canvas",
  "full-preview",
  "export",
  "import",
] as const;
export type DocAction = (typeof docActions)[number];
export const docsVersion = "0.2";
export const section = (
  id: string,
  title: string,
  paragraphs: string[],
  extra: Partial<DocSection> = {},
): DocSection => ({ id, title, paragraphs, ...extra });

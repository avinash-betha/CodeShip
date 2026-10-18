import { type DocArticle } from "./docs-model";
import { startArticles } from "./docs-start-content";
import { designerArticles } from "./docs-designer-content";
import { cssArticles } from "./docs-css-content";
import { libraryArticles } from "./docs-library-content";
import { reviewArticles } from "./docs-review-content";
import { exportArticles } from "./docs-export-content";
import { projectArticles } from "./docs-project-content";

export const docArticles: DocArticle[] = [
  ...startArticles,
  ...designerArticles.filter((a) => a.id !== "animations"),
  ...cssArticles,
  ...designerArticles.filter((a) => a.id === "animations"),
  ...libraryArticles,
  ...reviewArticles,
  ...exportArticles,
  ...projectArticles,
];
export const docSearchIndex = docArticles.map((article) => ({
  article,
  text: [
    article.id,
    article.id.replaceAll("-", " "),
    article.title,
    article.category,
    article.intro,
    ...article.sections.flatMap((s) => [
      s.title,
      ...(s.paragraphs ?? []),
      ...(s.steps ?? []),
      s.code?.text ?? "",
      s.code?.caption ?? "",
      s.callout?.title ?? "",
      s.callout?.text ?? "",
      s.image?.alt ?? "",
      s.image?.caption ?? "",
      ...(s.links ?? []).map((l) => l.label),
    ]),
  ]
    .join(" ")
    .toLowerCase(),
}));
export function findDocs(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return docSearchIndex
    .filter((entry) => terms.every((t) => entry.text.includes(t)))
    .map((entry) => entry.article);
}
export function docHeadings(article: DocArticle) {
  return [
    { id: "introduction", title: "Introduction" },
    ...article.sections.map(({ id, title }) => ({ id, title })),
  ];
}

/** Older shared headings resolve into the expanded article rather than losing saved links. */
export function resolveDocSection(article: DocArticle, requested?: string) {
  if (docHeadings(article).some((h) => h.id === requested)) return requested!;
  const aliases: Record<string, Record<string, string>> = {
    "css-studio": { surfaces: "example" },
    animations: { states: "steps" },
    angular: { "existing-app": "example", "angular-review": "behavior" },
    nextjs: { "existing-app": "example", "next-review": "behavior" },
    html: { "existing-page": "steps" },
    "forms-accessibility": { semantic: "begin", review: "behavior" },
    "modern-workflows": { sidebar: "dashboard" },
    "import-assets": { import: "steps", compatibility: "limitations" },
  };
  const alias = requested && aliases[article.id]?.[requested];
  if (alias) return alias;
  if (requested === "steps")
    return (
      article.sections.find((s) => s.steps?.length)?.id ??
      article.sections[0].id
    );
  if (requested === "example")
    return article.sections.find((s) => s.code)?.id ?? article.sections[0].id;
  if (requested === "notes") return article.sections.at(-1)!.id;
  return "introduction";
}

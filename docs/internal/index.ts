import { internalArticles } from "./platform-content";
import { desktopArticles } from "./desktop-content";

const articles = [...internalArticles, ...desktopArticles];
export const internalGuideArticles = [
  "architecture",
  "development-setup",
  "run-locally",
  "extending-library",
  "testing",
  "build-windows",
  "build-troubleshooting",
  "release-checklist",
].map((id) => articles.find((article) => article.id === id)!);

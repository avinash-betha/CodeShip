import { writeFile } from "node:fs/promises";
import { buildWindowsArticle } from "../docs/internal/desktop-content";
import { internalGuideArticles } from "../docs/internal";
import { renderInternalDocs } from "./internal-docs";
const a = buildWindowsArticle;
let markdown = `# ${a.title}\n\n${a.intro}\n\nInternal engineering reference. This guide is not bundled in the customer application. Update docs/internal/desktop-content.ts and run pnpm docs:build. Open docs/internal/developer-guide.html for the complete standalone reference.\n\n`;
for (const s of a.sections) {
  markdown += `## ${s.title}\n\n` + (s.paragraphs ?? []).join("\n\n") + "\n\n";
  if (s.steps)
    markdown += s.steps.map((t, i) => `${i + 1}. ${t}`).join("\n") + "\n\n";
  if (s.code)
    markdown += `\`\`\`${s.code.language}\n${s.code.text}\n\`\`\`\n\n${s.code.caption}\n\n`;
  if (s.callout) markdown += `> **${s.callout.title}** ${s.callout.text}\n\n`;
}
markdown +=
  "Primary references for release maintainers: [Electron distribution](https://www.electronjs.org/docs/latest/tutorial/distribution-overview), [electron-builder 26 Windows signing](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/). The application's built-in documentation is fully offline.\n";
await writeFile("docs/DESKTOP_BUILD_GUIDE.md", markdown);
await writeFile(
  "docs/internal/developer-guide.html",
  renderInternalDocs(internalGuideArticles),
);
console.log(
  "Updated the separate HTML developer reference and Windows Markdown guide. Neither is shipped in the application.",
);

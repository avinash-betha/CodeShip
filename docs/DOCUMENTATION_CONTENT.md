# Documentation content maintenance

The customer Documentation Center contains 37 offline guides. Eight internal developer guides are maintained separately in `docs/internal/developer-guide.html` and are excluded from the production application. The October 18 content overhaul replaces the old shared Try it/Example/Things to know mapping with feature-specific instructions, real examples, expected results and troubleshooting. All customer article IDs remain available. Internal guide IDs are retained as standalone HTML chapter anchors.

## Content ownership

| Navigation area                      | Source module                                                                       | Scope                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Getting Started                      | `apps/studio/src/docs-start-content.ts`                                             | Introduction, install, project creation, first UI, visual walkthrough                                                  |
| Visual Designer                      | `apps/studio/src/docs-designer-content.ts`                                          | Selection/layers/history, drag/nesting, resize/guides, spacing, layout modes, shortcuts, full-screen modes             |
| HTML and CSS Studio                  | `apps/studio/src/docs-css-content.ts`, Motion article in `docs-designer-content.ts` | HTML/attributes, forms, all property groups, custom CSS, state/query scope, Flex/Grid, accessibility and animations    |
| Design Library                       | `apps/studio/src/docs-library-content.ts`                                           | Components, navigation, presets, glass, screen templates and modern recipes                                            |
| Icon Factory / Responsive Lab        | `apps/studio/src/docs-review-content.ts`                                            | Collection/custom vectors, button/field insertion, icon output, real viewport measurement and reviewed recommendations |
| Code Export                          | `apps/studio/src/docs-export-content.ts`                                            | Scope/mode/dependencies, HTML integration, Angular standalone integration, Next.js App Router integration              |
| Projects and Desktop                 | `apps/studio/src/docs-project-content.ts`                                           | Native folders, autosave/Save As, backup/recovery, project format/assets/import, FAQ and troubleshooting               |
| Internal reference (outside the app) | `docs/internal/platform-content.ts`, `desktop-content.ts`                           | Architecture, extension, tests, toolchain, local run, Windows packaging, troubleshooting and release gates             |

## Editing rules

Keep article IDs stable. `DocArticle` and `DocSection` in `docs-model.ts` define the supported structure. Add descriptive section headings and copyable code in the appropriate language; reference the actual UI labels and exported files. Practical examples may use explicit classes instead of generated node IDs, but must explain where to assign those classes and apply their CSS.

The registry defines navigation order and a local search index covering stable IDs and their word forms, titles, paragraphs, steps, code, captions, callouts and link labels. Use `related` for intentional next steps; explicit related IDs take precedence over category fallback. Only customer content is imported by the production registry. Internal source lives outside `apps/`, and no customer links target internal articles. No remote search or new content dependency is required.

Old generic section fragments (`steps`, `example`, `notes`) and renamed supplementary section addresses resolve through `resolveDocSection`. Extend its aliases when replacing another established heading. Unknown fragments return to the article introduction. Customer bookmarks keep their article IDs. Previously stored internal-guide URLs/preferences safely fall back to the customer introduction and do not expose internal content.

Choose a supported `DocAction` for Try in the editor. The shell can reveal Insert/Layers, Design/HTML/Motion, source, responsive analysis, factory, import, export, projects, settings, tour or a view mode. Actions may change temporary workspace state or generate recommendations; they must not load a template, import source, create a project or apply recommendations automatically. Those mutations require a separate deliberate user operation.

The original shared `documentation.ts` now provides only the existing safe syntax tokenizer. The obsolete shallow article array and supplementary mapping have been removed.

## Validation

`tests/unit/documentation.test.ts` checks stable IDs, category boundaries, references, illustrations, old fragments, full-content search, CSS/TypeScript example syntax and real reusable-export filenames. `tests/e2e/documentation-content.spec.ts` loads every article and compares rendered code with its source, tests search/copy/deep links and exercises every used editor action while comparing the saved project before/after. Existing documentation browser tests retain bookmark, navigation, accessibility, full-screen and narrow-window coverage.

Run lint, typecheck, unit tests, the focused documentation browser checks and a production build after changing content/rendering. `pnpm docs:build` generates the standalone, self-contained `docs/internal/developer-guide.html` and the companion `docs/DESKTOP_BUILD_GUIDE.md` from internal sources. The HTML has offline search, chapter links, code copy, theme switching and print support. Neither artifact belongs in the production renderer or public assets. `pnpm docs:verify-production` checks the built renderer for internal content leaks; add `--packaged` to inspect the actual ASAR payload as well. The native smoke also checks the expanded Components tutorial and current guide count. Rebuild desktop packages before presenting them as containing updated guides.

No article section remains scheduled for this content overhaul. Future work is triggered by feature/control changes and release-specific manual validation; the pre-existing signing/clean-VM/upgrade gates remain separate from documentation completeness.

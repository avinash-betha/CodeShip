# Desktop migration baseline

The new desktop-only PROJECT_SPEC supersedes the archived browser specification in specs/PROJECT_SPEC.browser-v1.md. No Supabase, Firebase, login, retention or remote database implementation exists to remove. Browser data is retained; desktop projects use native files, and existing portable schema-v1 JSON remains importable.

| Preserved feature                                        | Source                                          | Existing regression coverage                      | Change strategy                                                          |
| -------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Document operations/history and schema-v1 projects       | packages/document-model, validation             | document.test.ts                                  | Preserve IDs and format; test additions                                  |
| DOM canvas, selection, drag, resizing and source editing | canvas.component, code-workspace                | authoring.spec.ts, studio.spec.ts                 | Extend transactions and pointer geometry                                 |
| CSS AST preservation, responsiveness and animation       | css-engine, responsive-engine, animation-engine | css/responsive unit tests; source/analyzer E2E    | Keep engines and exported CSS                                            |
| Browser persistence and portable import                  | persistence, store                              | persistence-export.test.ts; lifecycle E2E         | Retain fallback adapter; inject native desktop repository                |
| Eleven screens, five blocks and primitives               | component-registry                              | all templates at eight widths                     | Expand original registry with distinct editable variants                 |
| Original icon factory and SVG boundaries                 | icon-factory; factory component                 | icon-factory.test.ts; upgrade.spec.ts             | Preserve registry, vectors and saved definitions                         |
| Welcome and live tutorials                               | tutorial service/components                     | learning-accessibility.spec.ts                    | Extend with desktop/local/export guidance                                |
| Independent HTML, Angular and Next.js outputs            | codegen-core/exporters                          | 35 unit tests, generated builds, 45 browser cases | Add extraction and component outputs without replacing project exporters |

Known baseline limits: one resize handle, no filesystem shell, only whole-project export, small reusable library, no app light theme, short Learning Center rather than a complete manual, and sampled responsive analysis. Those are tracked as desktop implementation work rather than silently marked finished. Electron security follows the official context isolation, sandbox and sender-validation guidance.

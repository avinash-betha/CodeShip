# Offline Documentation Center

`docs-registry.ts` composes 42 versioned offline guides from the original stable article IDs and structured feature/development content. `DocumentationComponent` provides the dedicated header, collapsible category navigation, bounded article column, heading-aware TOC, search/highlighting, bookmarks, section links, code copy, related reading, previous/next links, print styling and expanded reading mode. Appearance follows the shared theme preference.

Content covers the visual editor, layout/CSS, component and template workflows, modern surfaces, original icons, responsiveness, motion, local projects, granular exports, framework integration, accessibility, document/assets and actual Windows development/build/install troubleshooting. Local screenshots and an original workflow diagram are bundled as assets. The build article generates `DESKTOP_BUILD_GUIDE.md` through `pnpm docs:build`.

The Learning Center remains a shorter workflow guide. The 22-step tour supports real actions, Next, Back, Skip, Pause, Resume and Restart, with native/local progress. It introduces canvas focus, full-screen preview and integration guides. Existing progress is preserved. Articles, icons, Monaco and formatting require no CDN or documentation service.

Keep content aligned with real behaviors and boundaries. Sample interfaces must explain when application services are required. Registry tests validate every internal link, heading and image; browser cases cover search, bookmarks, links, reading mode and accessibility; native smoke verifies documentation offline and copied `codeship://app` section URLs. See DOCUMENTATION_ARCHITECTURE.md and DEVELOPMENT_PROGRESS.md for implementation and exact results.

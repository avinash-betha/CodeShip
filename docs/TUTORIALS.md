# Welcome and learning

First launch shows a dismissible welcome with blank canvas, templates, components, HTML/CSS import, Icon Factory, documentation, a local visual walkthrough and guided-tour entry points. Opening it preserves the current project. Experienced users can skip it. The Learning Center can be reopened with the book icon or from Help.

The live 22-step tour covers project creation, a container, heading, button, input, content/attributes, CSS properties, mobile preview, responsive analysis, icon insertion, saving, resizing, layout modes, a style preset, selected component export final downloading, component insertion, direct spacing, navigation, canvas focus, full-screen preview and integration reading. A border highlights the relevant real control and a guidance card explains the action. Steps advance on editor activity rather than a sequence of static slides. Next, Back, skip step, pause, resume and restart are supported. Only completed actions count toward the completion percentage; skipping a step does not falsely mark it completed.

The analyzer step explains that a clean layout may have no recommendations. Suggested repairs remain user-reviewed; the tour does not force CSS changes or invent findings.

`TutorialService` stores welcome dismissal, current step and completed actions in `codeship-onboarding-v1` localStorage. Reload pauses an in-progress tour so it can be resumed deliberately from Learning Center. Invalid stored preferences start fresh. The desktop app also persists this progress in its native preferences. No cloud account or synchronization is configured.

Learning Center has ten searchable topics with practical examples and links back to the appropriate tools: getting started, visual building, semantic HTML/forms, CSS, responsive layout, animation, icons, templates, exports and advanced editing.

The bundled Documentation Center adds 42 full offline guides, navigation/search, code examples, copy, related articles and contextual actions. See DOCUMENTATION_GUIDE.md.

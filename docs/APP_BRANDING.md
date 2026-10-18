# CodeShip app branding

The supplied `C:/Projects/Neon UI Builder App Icon.png` was edited with the built-in imagegen tool. The original remains unchanged. The approved square transparent master is `apps/studio/public/brand/codeship-master.png`.

The desktop app/window, executable, installer/uninstaller, favicon, touch icon, app header and Docs header use this artwork. Functional tool icons and user-created project icons remain editable SVGs.

Re-export sizes with `pnpm exec tsx scripts/generate-app-icon.ts`. It resamples the approved master into PNG sizes 16, 24, 32, 48, 64, 128, 180, 256 and 512, creates a seven-resolution ICO and updates legacy SVG image wrappers. It does not regenerate artwork. Desktop assets are `apps/desktop/icon.png` and `apps/desktop/icon.ico`; browser variants are in `apps/studio/public/brand/`, with favicon/touch assets in `apps/studio/public/`.

Prompt used (built-in edit mode, supplied artwork as edit target, transparent background):

> Edit the supplied app icon for CodeShip, retaining its identity closely: luminous cyan-to-violet folded C surrounding a play triangle, three small builder/code blocks on the right, glossy dark navy rounded-square tile and crisp neon rim. Produce ONE polished square app icon on a truly transparent background, with the rounded-square tile filling roughly 92 percent of the square canvas. Remove the large surrounding black rectangular background and excessive outer haze. Simplify tiny resize handles/dashed selection lines slightly so the mark remains readable at 32 pixels, preserving the C/play and builder code block composition. Balanced centered proportions, clean anti-aliased silhouette, restrained edge glow, no text, no lettering, no wordmark, no mockup, no extra icons. Output a square high-resolution production app-icon master.

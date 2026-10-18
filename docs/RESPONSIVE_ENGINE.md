# Viewports and responsive defaults

The canvas is a real isolated iframe. Its width and height are CSS viewport dimensions; zoom is a visual transform applied outside that viewport. Desktop, tablet and mobile presets, custom widths and viewport rotation use this same rendering path. Device changes reset scroll to show the top of the layout. Width input is clamped to 240–3840px. The artboard identifies mobile, tablet, desktop or interactive preview correctly.

The shared screen stylesheet addresses the reported fixed-sidebar and board-column overflow. It uses intrinsic grids, shrinking tracks, wrapping navigation, fluid typography, stacked mobile boards and internal table scrolling. Canvas rendering and all framework exports use the same document CSS.

Browser verification covers all eleven templates at 320, 375, 390, 430, 768, 1024, 1280 and 1440px. It checks document/body overflow, label gaps and usable input height/width. A separate live-editor test verifies actual iframe dimensions, column changes, rotation and that changing zoom does not change the layout viewport.

The analyzer independently measures seven rendered widths. It checks layout overflow, sizing, grids, flex, content wrapping, spacing and other supported constraints, then proposes intrinsic or query-based changes. Users review changes and alternatives before applying. Existing limits remain: sampled analysis cannot guarantee every intermediate width or infer arbitrary imported design intent. See LIMITATIONS.md for detail.

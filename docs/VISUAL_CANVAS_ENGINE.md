# Visual canvas engine

`CanvasComponent` renders the universal document in an iframe. An independent input surface owns pointer, wheel, keyboard, text and drag actions. Coordinates divide screen deltas by zoom, so document geometry remains in CSS pixels.

Eight resize handles use the pure `resizeBounds` helper. Edge/corner movement respects min/max dimensions, optional 8px snapping and aspect locking. Absolutely positioned elements preserve the opposite edge when the top/left handles move. Flow elements retain CSS flow semantics. Pointer cancellation restores temporary styles; release commits a single undoable resize.

Freeform containers establish a relative positioning context and position existing children. New children receive editable absolute offsets. Normal flow, flex and grid remain available; returning to those modes clears child positioning. Alt-drag gives flow elements relative offsets. Arrow keys nudge each selected element independently; Shift changes the step from 1px to 10px. Context-menu alignment operates on absolute elements within their containing blocks. Group, ungroup, reorder, copy, paste and duplicate share the document history.

The spacing overlay drags padding, margin and gap values without typing CSS. Current declarations and actual element dimensions remain visible. DOM drop targets are highlighted, nested moves reject invalid HTML/cycles, and edge scrolling helps reach long pages. The parent-edge resize guide provides a measured snapping target.

`authoring.spec.ts`, `enterprise.spec.ts` and the geometry unit cases cover representative text, handles, history and spacing operations. More sophisticated constraint solvers, arbitrary transformed-coordinate editing, rotation handles, rich multi-selection proportional scaling and complete Figma-style snapping are not claimed.

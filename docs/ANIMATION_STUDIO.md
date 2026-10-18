# Animation Studio

The Motion inspector authors transitions and ordinary CSS keyframes. Timing controls include duration, delay, easing, iteration, direction and fill behavior. Frames expose offsets, opacity and transforms; markers can be dragged or edited numerically. A cubic-bezier editor shows its curve.

`packages/animation-engine` validates values and writes CSS. Changes are undoable, survive source editing and travel with project exports. Reduced-motion alternatives accompany generated effects. Selective extraction carries keyframes referenced by the retained declarations.

Preview runs the browser's animation implementation in an isolated frame. The product does not include a video renderer or a full graph-based animation sequencer. Browser authoring tests verify CSS/keyframe generation and source persistence; not every timing combination has a dedicated automated assertion.

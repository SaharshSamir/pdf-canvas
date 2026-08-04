import type { EditorContext } from "../../../types";

export type Strategy = {
  onMouseDown: (ctx: EditorContext) => void;
  onMouseMove: (ctx: EditorContext) => void;
  onMouseUp: (ctx: EditorContext) => void;
}

import type { Coord, DragArea } from "../../../types";

export function drawRubberBand(origin: Coord, current: Coord, ctx: CanvasRenderingContext2D): DragArea {
  const w = origin.x - current.x;
  const h = origin.y - current.y;

  ctx.fillStyle = "rgba(105, 160, 243, 0.14)"
  ctx.fillRect(origin.x, origin.y, -w, -h);

  ctx.strokeStyle = "rgba(24, 84, 219, 0.63)"
  ctx.strokeRect(origin.x, origin.y, -w, -h);

  return {
    origin,
    end: { x: current.x, y: current.y }
  }

}

import type { Coord } from "../../../types";

export function drawRubberBand(origin: Coord, current: Coord, ctx: CanvasRenderingContext2D) {
  const w = origin.x - current.x;
  const h = origin.y - current.y;

  ctx.fillStyle = "rgba(102, 149, 218, 0.34)"
  ctx.fillRect(origin.x, origin.y, -w, -h);

  ctx.strokeStyle = "rgba(24, 84, 219, 0.63)"
  ctx.strokeRect(origin.x, origin.y, -w, -h);
}

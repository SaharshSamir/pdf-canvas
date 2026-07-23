import type { Camera, Coord, DragArea, Entity } from "../../../types";
import { canvasToWorld, isEntityWithinSelection, worldToCanvas } from "../../../utils";
import type { World } from "../world/world";

export function drawRubberBand(origin: Coord, current: Coord, ctx: CanvasRenderingContext2D, camera: Camera): DragArea {

  const originCanvas = worldToCanvas(origin, ctx, camera);
  const currentCanvas = worldToCanvas(current, ctx, camera);

  const w = originCanvas.x - currentCanvas.x;
  const h = originCanvas.y - currentCanvas.y;

  ctx.fillStyle = "rgba(105, 160, 243, 0.14)"
  ctx.fillRect(originCanvas.x, originCanvas.y, -w, -h);

  ctx.strokeStyle = "rgba(24, 84, 219, 0.63)"
  ctx.strokeRect(originCanvas.x, originCanvas.y, -w, -h);

  return {
    origin,
    end: current,
  }

}

export function findEntitiesUnderRubberBand(world: World, dragArea: DragArea): Entity[] {
  const entities: Entity[] = [];
  world.entityStore.forEach(e => {
    const res = isEntityWithinSelection(e, dragArea);
    if (res) {
      entities.push(e);
    }
  });
  return entities;
}

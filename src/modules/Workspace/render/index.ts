import type { Coord, Entity, EntityStore } from "../../../types";


//culling
function isVisible(screenCoords: Coord, entity: Entity, canvasW: number, canvasH: number) {
  const e_left = screenCoords.x;
  const e_right = screenCoords.x + entity.width;
  const e_top = screenCoords.y;
  const e_bottom = screenCoords.y + entity.height;

  const c_left = 0;
  const c_right = canvasW;
  const c_top = 0;
  const c_bottom = canvasH;

  if (
    e_right < c_left ||
    e_left > c_right ||
    e_bottom < c_top ||
    e_top > c_bottom
  ) {
    return false;
  }
  return true;

}

export function render(entityStore: EntityStore, ctx: CanvasRenderingContext2D, camera: Coord) {

  const canvasHeight = ctx.canvas.clientHeight;
  const canvasWidth = ctx.canvas.clientWidth;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let [_, entity] of entityStore) {

    const screenX = (entity.worldCoord.x - camera.x) + ctx.canvas.clientWidth / 2;
    const screenY = (entity.worldCoord.y - camera.y) + ctx.canvas.clientHeight / 2;

    if (!isVisible({ x: screenX, y: screenY }, entity, canvasWidth, canvasHeight)) {
      entity.isRendered = false;
      continue;
    } else {
      entity.isRendered = true;
    }

    switch (entity.type) {
      case "cube":
        ctx.fillStyle = entity.fillColor;
        ctx.fillRect(screenX, screenY, entity.width, entity.height);
        break;
      case "page":
        console.log(entity.pageCanvas.width, entity.pageCanvas.height);
        ctx.drawImage(entity.pageCanvas, screenX, screenY, entity.width, entity.height);
        break;
    }

  }

}

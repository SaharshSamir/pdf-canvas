import type { Coord, Entity, EntityStore, Camera } from "../../../types";
import { canvasToWorld, worldToCanvas, type Size } from "../../../utils";


//culling
function isVisible(screenCoords: Coord, entity: Entity, canvasSize: Size, zoom: number) {
  const e_left = screenCoords.x;
  const e_right = screenCoords.x + entity.width * zoom;
  const e_top = screenCoords.y;
  const e_bottom = screenCoords.y + entity.height * zoom;

  const c_left = 0;
  const c_right = canvasSize.width;
  const c_top = 0;
  const c_bottom = canvasSize.height;

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

export function render(
  entityStore: EntityStore,
  ctx: CanvasRenderingContext2D,
  camera: Camera,
) {

  const canvasSize = {
    height: ctx.canvas.clientHeight,
    width: ctx.canvas.clientWidth,
  }

  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  for (let [_, entity] of entityStore) {

    const { x: screenX, y: screenY } = worldToCanvas(
      entity.worldCoord,
      { height: ctx.canvas.height, width: ctx.canvas.width },
      camera
    )

    if (!isVisible({ x: screenX, y: screenY }, entity, canvasSize, camera.zoom)) {
      entity.isRendered = false;
      continue;
    } else {
      entity.isRendered = true;
    }

    switch (entity.type) {
      case "cube":
        console.log('screenX, screenY: ', screenX, screenY);
        ctx.fillStyle = entity.fillColor;
        ctx.fillRect(
          screenX,
          screenY,
          entity.width * camera.zoom,
          entity.height * camera.zoom
        );
        break;
      case "page":
        ctx.drawImage(
          entity.pageCanvas,
          screenX,
          screenY,
          entity.width * camera.zoom,
          entity.height * camera.zoom
        );
        break;
      case "text":
        console.log('drawing text');
        ctx.fillStyle = entity.fillColor;
        ctx.font = `${30 * camera.zoom}px Jetbrains Mono`;
        ctx.fillText(entity.text, screenX, screenY);
    }

  }

}

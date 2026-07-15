import type { Coord, Entity, EntityStore, Camera, CubeEntity, SelectedEntities } from "../../../types";
import { worldToCanvas, type Size } from "../../../utils";
import { drawText, type CanvasTextConfig } from "canvas-txt";
import type { World } from "../world";
import { useAppState } from "../../state/app";

const SELECT_STROKE_GAP = 5;
const SELECT_STROKE_WIDTH = 3;
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

type DrawCubeConfig = {
  ctx: CanvasRenderingContext2D,
  screenCoords: Coord,
  entity: CubeEntity,
  zoom: number,
  selected: boolean
}
function drawCube(config: DrawCubeConfig) {
  const { ctx, screenCoords, entity, zoom, selected } = config;
  const { x: screenX, y: screenY } = screenCoords;
  ctx.fillStyle = "rgb(169, 220, 250)"
  ctx.fillRect(
    screenX,
    screenY,
    (entity.width) * zoom,
    (entity.height) * zoom
  );

  if (selected) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = SELECT_STROKE_WIDTH;
    ctx.strokeRect(
      screenX - SELECT_STROKE_GAP,
      screenY - SELECT_STROKE_GAP,
      ((entity.width) * zoom) + SELECT_STROKE_GAP * 2,
      ((entity.height) * zoom) + SELECT_STROKE_GAP * 2
    )
  } else {

  }
}

export function render(
  world: World,
  ctx: CanvasRenderingContext2D,
) {
  const selectedEntities = useAppState.getState().selectedEntities;

  const { camera, entityStore } = world;
  const canvasSize = {
    height: ctx.canvas.clientHeight,
    width: ctx.canvas.clientWidth,
  }

  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  for (let [_, entity] of entityStore) {

    const selected = selectedEntities.has(entity.id);
    const { x: screenX, y: screenY } = worldToCanvas(
      entity.worldCoord,
      ctx,
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
        const config: DrawCubeConfig = {
          ctx,
          entity,
          screenCoords: { x: screenX, y: screenY },
          zoom: camera.zoom,
          selected
        }
        drawCube(config);
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
        if (!entity.text) break;
        ctx.fillStyle = entity.fillColor;
        const textConfig: CanvasTextConfig = {
          height: Math.round(entity.height * camera.zoom),
          width: Math.round(entity.width * camera.zoom),
          x: screenX,
          y: screenY,
          fontSize: Math.round((entity.fontSize || 30) * camera.zoom),
          align: "left",
        }
        drawText(ctx, entity.text, textConfig);
        break;
      default:
        console.log("bruh")

    }

  }

}


import type { Coord, Entity, Camera, CubeEntity, TextEntity, PageEntity, SelectedEntities } from "../../../types";
import { worldToCanvas, type Size } from "../../../utils";
import { drawText, type CanvasTextConfig } from "canvas-txt";
import type { World } from "../world/world";
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

type DrawConfig<E = CubeEntity | TextEntity | PageEntity> = {
  ctx: CanvasRenderingContext2D,
  entity: E,
  zoom: number,
  selected: boolean
}

function drawSelectBoundary<E extends Entity>(config: DrawConfig<E>) {
  const { zoom, ctx, selected, entity } = config;
  if (selected) {
    const gap = SELECT_STROKE_GAP / zoom;
    const lineWidth = SELECT_STROKE_WIDTH / zoom;

    ctx.strokeStyle = "white";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(
      config.entity.worldCoord.x - gap,
      config.entity.worldCoord.y - gap,
      entity.width + gap * 2,
      entity.height + gap * 2
    )
  };
}

function drawMultiSelectionBoundary(selectedEntities: Entity[], ctx: CanvasRenderingContext2D) {
  let smallest_x = Infinity;
  let smallest_y = Infinity;
  let biggest_x = -Infinity;
  let biggest_y = -Infinity;

  console.log(selectedEntities);
  for (const e of selectedEntities) {
    smallest_x = e.worldCoord.x < smallest_x ? e.worldCoord.x : smallest_x;
    smallest_y = e.worldCoord.y < smallest_y ? e.worldCoord.y : smallest_y;

    biggest_x = e.worldCoord.x + e.width > biggest_x ? e.worldCoord.x + e.width : biggest_x;
    biggest_y = e.worldCoord.y + e.height > biggest_y ? e.worldCoord.y + e.height : biggest_y;
  }

  console.log(smallest_x, smallest_y, biggest_x, biggest_y);
  const width = biggest_x - smallest_x;
  const height = biggest_y - smallest_y;
  ctx.setLineDash([10, 10]);
  ctx.strokeRect(smallest_x, smallest_y, width, height);
}

function drawCube(config: DrawConfig<CubeEntity>) {
  const { ctx, entity } = config;
  ctx.fillStyle = "rgb(169, 220, 250)"
  ctx.fillRect(
    config.entity.worldCoord.x,
    config.entity.worldCoord.y,
    (entity.width),
    (entity.height),
  );

  drawSelectBoundary(config);
}

function drawTextEntity(config: DrawConfig<TextEntity>, textConfig: CanvasTextConfig) {

  drawText(config.ctx, config.entity.text, textConfig);

  drawSelectBoundary(config);

}

function drawPageEntity(config: DrawConfig<PageEntity>) {
  const { ctx, entity } = config;

  ctx.drawImage(
    entity.pageCanvas,
    entity.worldCoord.x,
    entity.worldCoord.y,
    entity.width,
    entity.height,
  );

  drawSelectBoundary(config);
}

function applyCameraTransform(ctx: CanvasRenderingContext2D, canvasSize: Size, camera: Camera) {
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    canvasSize.width / 2 - camera.x * camera.zoom,
    canvasSize.height / 2 - camera.y * camera.zoom
  )
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

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.restore();

  ctx.save();
  applyCameraTransform(ctx, canvasSize, camera);

  const selected_es: Entity[] = [];
  for (const [_, entity] of entityStore) {

    const selected = selectedEntities.has(entity.id);
    if (selected) selected_es.push(entity);
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
        const config: DrawConfig<CubeEntity> = {
          ctx,
          entity,
          zoom: camera.zoom,
          selected
        }
        drawCube(config);
        break;
      case "page":
        drawPageEntity({
          ctx,
          entity,
          zoom: camera.zoom,
          selected
        })
        break;
      case "text":
        if (!entity.text) break;
        ctx.fillStyle = entity.fillColor;

        const textConfig: CanvasTextConfig = {
          height: entity.height,
          width: entity.width,
          x: entity.worldCoord.x,
          y: entity.worldCoord.y,
          fontSize: entity.fontSize ?? 30,
          align: "left",
        }
        const drawConfig: DrawConfig<TextEntity> = {
          ctx,
          entity,
          selected,
          zoom: camera.zoom
        }
        drawTextEntity(drawConfig, textConfig);
        break;
      default:
        console.log("bruh")
    }

  }
  //draw multi-selection boundary for > 1 entities are selected
  if (selectedEntities.size > 1) {
    drawMultiSelectionBoundary(selected_es, ctx);
  }
  ctx.restore();

}

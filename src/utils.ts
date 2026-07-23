import type { RefObject } from "react";
import type { Camera, Coord, DragArea, DraggableEvent, Entity } from "./types";
import type { World } from "./modules/Workspace/world/world";

export function randomIdGenerator(): string {
  const alphabets = (new Array(26).fill("") as string[]).map((_s, idx) => String.fromCharCode(idx + 65));
  const char_space = [...alphabets, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const chars = new Array(4).fill("");
  let picker = 0;
  for (let i = 0; i < chars.length; ++i) {
    picker = Math.floor(Math.random() * 10) % char_space.length;
    chars[i] = char_space[picker];
  }

  return chars.join("").toLowerCase();

}

type TrackMouse = {
  e: DraggableEvent,
  mouseWorldPosition: React.RefObject<Coord>,
  mouseCanvasPosition: React.RefObject<Coord>,
  ctx: CanvasRenderingContext2D,
  camera: Camera
}
export function trackMouse({ e, mouseWorldPosition, mouseCanvasPosition, ctx, camera }: TrackMouse) {
  const rect = ctx.canvas.getBoundingClientRect();
  const mouseCanvasCoord: Coord = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  mouseCanvasPosition.current.x = mouseCanvasCoord.x;
  mouseCanvasPosition.current.y = mouseCanvasCoord.y;

  const mouseWorldCoord = canvasToWorld(mouseCanvasCoord, ctx, camera);

  mouseWorldPosition.current.x = mouseWorldCoord.x;
  mouseWorldPosition.current.y = mouseWorldCoord.y;
}

export type Size = {
  height: number;
  width: number;
}

/**
 * Map a Coord in the world to a Coord on the canvas element
 */
export function worldToCanvas(worldCoord: Coord, ctx: CanvasRenderingContext2D, camera: Camera): Coord {
  const canvas: Size = {
    height: ctx.canvas.clientHeight,
    width: ctx.canvas.clientWidth
  }

  const screenX = (worldCoord.x - camera.x) * camera.zoom + canvas.width / 2;
  const screenY = (worldCoord.y - camera.y) * camera.zoom + canvas.height / 2;

  return { x: screenX, y: screenY };
}
/**
 * Map a Coord in the canvas element to a Coord in the world
 */
export function canvasToWorld(canvasCoord: Coord, ctx: CanvasRenderingContext2D, camera: Camera): Coord {

  const canvas: Size = {
    height: ctx.canvas.clientHeight,
    width: ctx.canvas.clientWidth
  }

  const worldX = (canvasCoord.x - (canvas.width / 2)) / camera.zoom + camera.x;
  const worldY = (canvasCoord.y - (canvas.height / 2)) / camera.zoom + camera.y;

  return { x: worldX, y: worldY };
}


/**
 * Checks whether a world coordinate is inside an entity's bounds.
 */
export function isPointOnEntity(point: Coord, entity: Entity) {
  const entityLeft = entity.worldCoord.x;
  const entityRight = entity.worldCoord.x + entity.width;
  const entityTop = entity.worldCoord.y;
  const entityBottom = entity.worldCoord.y + entity.height;

  return (
    point.x >= entityLeft &&
    point.x <= entityRight &&
    point.y >= entityTop &&
    point.y <= entityBottom
  );
}


/**
 * dragArea should have it's coordinates based on world coordinate system
 */
export function isEntityWithinSelection(entity: Entity, dragArea: DragArea): boolean {

  const left = Math.min(dragArea.origin.x, dragArea.end.x);
  const right = Math.max(dragArea.origin.x, dragArea.end.x);
  const top = Math.min(dragArea.origin.y, dragArea.end.y);
  const bottom = Math.max(dragArea.origin.y, dragArea.end.y);

  const entityLeft = entity.worldCoord.x;
  const entityRight = entity.worldCoord.x + entity.width;
  const entityTop = entity.worldCoord.y;
  const entityBottom = entity.worldCoord.y + entity.height;

  //console.log(entityLeft, left, entityRight, right, entityTop, top, entityBottom, bottom);

  return (
    entityLeft >= left &&
    entityRight <= right &&
    entityTop >= top &&
    entityBottom <= bottom
  );
}


type TrackHoveredEntityCtx = {
  mouseWorldPosRef: RefObject<Coord>,
  world: World,
  hoveredEntityIdRef: RefObject<string>
}
//mouseWorldPosRef | world | hoveredEntityIdRef
export function trackHoveredEntity(ctx: TrackHoveredEntityCtx) {
  const { mouseWorldPosRef, world, hoveredEntityIdRef } = ctx;
  const mouseWorldCoord = mouseWorldPosRef.current;
  for (let [id, e] of world.entityStore) {
    if (isPointOnEntity(mouseWorldCoord, e)) {
      hoveredEntityIdRef.current = id;
      document.body.style.cursor = "move";
      break;
    } else {
      hoveredEntityIdRef.current = "";
      document.body.style.cursor = "default";
    }
  }
}

export function dragEntity(entity: Entity, entityStartWorldCoord: Coord, dragArea: DragArea) {
  const dx = dragArea.origin.x - dragArea.end.x;
  const dy = dragArea.origin.y - dragArea.end.y;

  entity.worldCoord.x = entityStartWorldCoord.x - dx;
  entity.worldCoord.y = entityStartWorldCoord.y - dy;
}

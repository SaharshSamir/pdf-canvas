import type { Camera, Coord, DraggableEvent } from "./types";

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

export function getMousePosition(
  e: DraggableEvent,
  mousePosition: React.RefObject<Coord>,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();
  mousePosition.current.x = e.clientX - rect.left;
  mousePosition.current.y = e.clientY - rect.top;
}

export type Size = {
  height: number;
  width: number;
}

/** 
 * Map a Coord in the world to a Coord on the canvas element
 */
export function worldToCanvas(worldCoord: Coord, canvas: Size, camera: Camera): Coord {
  const screenX = (worldCoord.x - camera.x) * camera.zoom + canvas.width / 2;
  const screenY = (worldCoord.y - camera.y) * camera.zoom + canvas.height / 2;

  return { x: screenX, y: screenY };
}
/** 
 * Map a Coord in the canvas element to a Coord in the world
 */
export function canvasToWorld(canvasCoord: Coord, canvas: Size, camera: Camera): Coord {
  const worldX = (canvasCoord.x - (canvas.width / 2)) / camera.zoom + camera.x;
  const worldY = (canvasCoord.y - (canvas.height / 2)) / camera.zoom + camera.y;

  return { x: worldX, y: worldY };
}

export function zoomTowardsCursor(mousePos: Coord, canvas: Size, zoomFactor: number, camera: Camera) {
  const worldCoordUnderMouseBeforeZoom = canvasToWorld(
    mousePos,
    canvas,
    camera
  );

  camera.zoom *= zoomFactor;

  const worldCoordUnderMouseAfterZoom = canvasToWorld(
    mousePos,
    canvas,
    camera
  );
  const zoomXDrift = worldCoordUnderMouseBeforeZoom.x - worldCoordUnderMouseAfterZoom.x;
  const zoomYDrift = worldCoordUnderMouseBeforeZoom.y - worldCoordUnderMouseAfterZoom.y;

  camera.x += zoomXDrift;
  camera.y += zoomYDrift;

}

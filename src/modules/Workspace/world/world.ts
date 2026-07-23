import type { Camera, Coord, Entity } from "../../../types";
import { canvasToWorld, randomIdGenerator, type Size } from "../../../utils";

interface WorldActions {
  /** returns the id of the entity **/
  addEntity: (entity: Entity) => string,
  removeEntity: (id: string) => void,
  panCamera: (dx: number, dy: number) => void
  zoomTowardsCursor: (mousePos: Coord, ctx: CanvasRenderingContext2D, zoomFactor: number, camera: Camera) => void,
  clearEntities: () => void

}

export interface World extends WorldActions {
  entityStore: Map<string, Entity>,
  camera: Camera,
}



export function createWorld(): World {
  const entityStore = new Map<string, Entity>();
  const camera = { x: 0, y: 0, zoom: 1 };

  const addEntity = (entity: Entity) => {
    const id = randomIdGenerator();
    entity.id = id;
    entityStore.set(entity.id, entity);
    return id;
  }

  const removeEntity = (id: string) => {
    entityStore.delete(id);
  }

  const panCamera = (dx: number, dy: number) => {
    camera.x += dx;
    camera.y += dy
  }

  const zoomTowardsCursor = (mousePos: Coord, ctx: CanvasRenderingContext2D, zoomFactor: number, camera: Camera) => {
    const worldCoordUnderMouseBeforeZoom = canvasToWorld(mousePos, ctx, camera);

    camera.zoom *= zoomFactor;

    const worldCoordUnderMouseAfterZoom = canvasToWorld(mousePos, ctx, camera);
    const zoomXDrift = worldCoordUnderMouseBeforeZoom.x - worldCoordUnderMouseAfterZoom.x;
    const zoomYDrift = worldCoordUnderMouseBeforeZoom.y - worldCoordUnderMouseAfterZoom.y;

    camera.x += zoomXDrift;
    camera.y += zoomYDrift;

  }

  const clearEntities = () => {
    entityStore.clear();
  }

  return {
    entityStore,
    camera,
    addEntity,
    removeEntity,
    panCamera,
    zoomTowardsCursor,
    clearEntities
  }
}

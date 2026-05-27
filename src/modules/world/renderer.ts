//renderer is responsible for syncing DOM with our world entities
//it needs the entity store and the render surface div

import type { Coord } from ".";
import type { Entity } from "./objects";
import type { EntityStore } from "./objects";

export type RenderSurface = {
  div: HTMLDivElement;
  center: Coord;
  height: number;
  width: number;
}

function isIntersecting(surface: RenderSurface, entity: Entity) {

  const surfaceRight = surface.center.x + (surface.width / 2);
  const surfaceLeft = surface.center.x - (surface.width / 2);
  const surfaceTop = surface.center.y + (surface.height / 2);
  const surfaceBottom = surface.center.y - (surface.height / 2);

  const entityRight = entity.worldCoord.x + (entity.width / 2);
  const entityLeft = entity.worldCoord.x - (entity.width / 2);
  const entityTop = entity.worldCoord.y + (entity.height / 2);
  const entityBottom = entity.worldCoord.y - (entity.height / 2);

  console.log(entity);
  console.log(surfaceRight, surfaceLeft, surfaceTop, surfaceBottom);
  console.log(entityLeft, entityRight, entityBottom, entityTop);

  if (
    surfaceRight < entityLeft ||
    surfaceLeft > entityRight ||
    surfaceTop < entityBottom ||
    surfaceBottom > entityTop
  ) {
    console.log("no");
    return false;
  }
  console.log("yes");
  return true;
}

export function entitiesToRender(entities: EntityStore, surface: RenderSurface, cameraCoord: Coord) {
  const surfaceCenterPx: Coord = { x: surface.div.clientWidth / 2, y: surface.div.clientHeight / 2 };
  for (const [_, e] of entities) {
    if (isIntersecting(surface, e)) {
      const entityRenderX = surfaceCenterPx.x + (e.worldCoord.x - cameraCoord.x);
      const entityRenderY = surfaceCenterPx.y + (e.worldCoord.y - cameraCoord.y);

      if (e.container) {
        e.container.style.top = `${entityRenderY}px`;
        e.container.style.left = `${entityRenderX}px`;

        surface.div.appendChild(e.container);
        e.isRendered = true;
      }
    }
    e.isRendered = false;
  }
}

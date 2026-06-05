//renderer is responsible for syncing DOM with our world entities
//it needs the entity store and the render surface div

import type { Coord, Entity, EntityStore } from "../../types";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api";

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

  if (
    surfaceRight < entityLeft ||
    surfaceLeft > entityRight ||
    surfaceTop < entityBottom ||
    surfaceBottom > entityTop
  ) {
    return false;
  }
  return true;
}

function renderEntityAtPoint(entity: Entity, surface: RenderSurface, cameraCoord: Coord) {
  if (!entity.container) return;
  const surfaceCenterPx: Coord = { x: surface.div.clientWidth / 2, y: surface.div.clientHeight / 2 };

  const entityRenderX = surfaceCenterPx.x + (entity.worldCoord.x - cameraCoord.x);
  const entityRenderY = surfaceCenterPx.y + (entity.worldCoord.y - cameraCoord.y);

  entity.container.style.top = `${entityRenderY - (entity.height / 2)}px`;
  entity.container.style.left = `${entityRenderX - (entity.width / 2)}px`;

  surface.div.appendChild(entity.container);
  entity.isRendered = true;

}

export async function entitiesToRender(entities: EntityStore, surface: RenderSurface, cameraCoord: Coord) {
  console.log('rendering entities here: ', entities);
  //debugger;
  for (const [_, e] of entities) {
    //e.worldCoord = { ...cameraCoord };

    if (isIntersecting(surface, e)) {

      if (e.type === "page") {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) continue;
        canvas.width = e.width;
        canvas.height = e.height;
        const viewport = e.page.getViewport({ scale: 1 });

        await e.page.render({ canvasContext: context, viewport }).promise;

        if (!e.container) {
          const container = document.createElement("div");
          container.setAttribute("style", `height: ${canvas.height}px; width: ${canvas.width}px`);
          container.style.height = `${canvas.height}px`;
          container.style.width = `${canvas.width}px`;
          container.style.position = "absolute";
          container.append(canvas);
          e.container = container;
        }

      }

      if (e.container) {
        renderEntityAtPoint(e, surface, cameraCoord);

      }
    } else {
      if (e.container?.parentNode) {
        surface.div.removeChild(e.container as Node);
      }
    }
    e.isRendered = false;
  }
}

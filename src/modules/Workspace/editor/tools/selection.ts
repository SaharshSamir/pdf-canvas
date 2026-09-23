import type { Camera, Coord, Area, DragType, Entity } from "../../../../types";
import { dragEntity, isEntityWithinSelection, worldToCanvas } from "../../../../utils";
import type { World } from "../../world/world";
import type { Strategy } from "../types";

export function drawRubberBand(origin: Coord, current: Coord, ctx: CanvasRenderingContext2D, camera: Camera): Area {

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

export function findEntitiesUnderRubberBand(world: World, dragArea: Area): Entity[] {
  const entities: Entity[] = [];
  world.entityStore.forEach(e => {
    const res = isEntityWithinSelection(e, dragArea);
    if (res) {
      entities.push(e);
    }
  });
  return entities;
}

type SelectionDragState = {
  isDragging: DragType,
  dragEntityStartWorldCoord: Coord | null,
  draggingEntityId: string | null,
  dragOrigin: Coord,
  groupedSelection: Area
}

export function selection(): Strategy {

  const dragState: SelectionDragState = {
    isDragging: undefined,
    dragEntityStartWorldCoord: null,
    draggingEntityId: null,
    dragOrigin: { x: Infinity, y: Infinity },
    //origin here might be useless because we can get groupedSelection.origin from dragOrigin^
    groupedSelection: { origin: { x: Infinity, y: Infinity }, end: { x: Infinity, y: Infinity } }
  }

  return {
    onMouseDown(ctx) {
      dragState.dragOrigin = { ...ctx.mouseWorldPosRef.current };
      //select entity under mouse
      const hoveredEntityId = ctx.hoveredEntityIdRef.current;
      ctx.selectedEntities.clear();
      if (hoveredEntityId) {
        dragState.isDragging = "Entity";
        ctx.selectedEntities.add(hoveredEntityId);
        const entity = ctx.world.entityStore.get(hoveredEntityId);
        if (!entity) throw new Error("Entity doesn't exist");
        dragState.dragEntityStartWorldCoord = { ...entity.worldCoord };
        dragState.draggingEntityId = hoveredEntityId;
      } else {
        dragState.isDragging = "Rubberband";
      }
    },

    onMouseMove(ctx) {
      const hoveredEntityId = ctx.hoveredEntityIdRef.current;
      if (hoveredEntityId !== "" && dragState.isDragging === undefined) {
        document.body.style.cursor = "move";
      } else {
        document.body.style.cursor = "default";
      }
      //selection stuff
      if (dragState.isDragging === "Rubberband") {
        const dragArea = drawRubberBand(
          dragState.dragOrigin,
          ctx.mouseWorldPosRef.current,
          ctx.canvasCtx,
          ctx.world.camera
        );

        ctx.world.entityStore.forEach(e => {
          const res = isEntityWithinSelection(e, dragArea);
          if (res) {
            ctx.addToSelectedEntities([e.id]);
          } else {
            ctx.removeFromSelectedEntities(e.id);
          }
        });
      }
      //dragging stuff
      const { draggingEntityId } = dragState;
      if (dragState.isDragging == "Entity" && draggingEntityId && ctx.selectedEntities.has(draggingEntityId)) {
        const entity = ctx.world.entityStore.get(draggingEntityId);
        if (!entity || !dragState.dragEntityStartWorldCoord) throw new Error("This entity does not exist in the store");
        //area = {start = mouse pos from where the drag starts, end = current mous pos}
        const dragArea: Area = {
          origin: dragState.dragOrigin,
          end: ctx.mouseWorldPosRef.current
        }
        dragEntity(entity, dragState.dragEntityStartWorldCoord, dragArea)
      }
    },

    onMouseUp(_ctx) {
      if (dragState.isDragging) {
        dragState.isDragging = undefined;
      }
    }
  } satisfies Strategy;
}

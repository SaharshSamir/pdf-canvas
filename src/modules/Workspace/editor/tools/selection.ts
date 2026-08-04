import type { Camera, Coord, DragArea, DragType, Entity } from "../../../../types";
import { dragEntity, isEntityWithinSelection, worldToCanvas } from "../../../../utils";
import type { World } from "../../world/world";
import type { Strategy } from "../types";

export function drawRubberBand(origin: Coord, current: Coord, ctx: CanvasRenderingContext2D, camera: Camera): DragArea {
  console.log(origin, current, ctx, camera);

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

export function findEntitiesUnderRubberBand(world: World, dragArea: DragArea): Entity[] {
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
  dragOrigin: Coord
}

export function selection(): Strategy {

  const dragState: SelectionDragState = {
    isDragging: undefined,
    dragEntityStartWorldCoord: null,
    draggingEntityId: null,
    dragOrigin: {x: Infinity, y: Infinity}
  }

  return {
    onMouseDown(ctx) {
      dragState.dragOrigin = { ...ctx.mouseWorldPosRef.current };
      //select entity under mouse
      const hoveredEntityId = ctx.hoveredEntityIdRef.current;
      if (hoveredEntityId) {
        dragState.isDragging = "Entity";
        ctx.selectedEntities.clear();
        ctx.selectedEntities.add(hoveredEntityId);
        const entity = ctx.world.entityStore.get(hoveredEntityId);
        if (!entity) throw new Error("Entity doesn't exist");
        dragState.dragEntityStartWorldCoord = { ...entity.worldCoord };
        dragState.draggingEntityId = hoveredEntityId;
      } else {
        dragState.isDragging = "Rubberband";
        console.log('draw rubber band');
        ctx.selectedEntities.clear();
      }
    },

    onMouseMove(ctx) {
      const hoveredEntityId = ctx.hoveredEntityIdRef.current;
      if (hoveredEntityId !== "") {
        document.body.style.cursor = "move";
      } else {
        document.body.style.cursor = "default";
      }
      //selection stuff
      if (hoveredEntityId === "" && dragState.isDragging === "Rubberband") {
        console.log('drawing rubber band');
        const dragArea = drawRubberBand(
          dragState.dragOrigin,
          ctx.mouseWorldPosRef.current,
          ctx.canvasCtx,
          ctx.world.camera
        );
        //const entities = findEntitiesUnderRubberBand(world, dragArea)
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
        console.log("start drag");
        const entity = ctx.world.entityStore.get(draggingEntityId);
        if (!entity || !dragState.dragEntityStartWorldCoord) throw new Error("This entity does not exist in the store");
        //drag area = {start = mouse pos from where the drag starts, end = current mous pos}
        const dragArea: DragArea = {
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

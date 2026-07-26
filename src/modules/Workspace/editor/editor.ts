import type { RefObject } from "react";
import { useAppState } from "../../state/app";
import type { EditorContext, PageEntity, DraggableEvent, Coord, Camera, DocMeta, DragState, DragArea } from "../../../types";
import { dragEntity, isEntityWithinSelection, trackHoveredEntity, trackMouse } from "../../../utils";
import { render } from "../render/render";
import { drawRubberBand } from "../tools/selection";
import type { World } from "../world/world";
import { addEntity } from "./addEntities";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;


export function createEditor(editorCtx: EditorContext, ctx: CanvasRenderingContext2D, world: World) {

  const dragState: DragState = {
    dragOrigin: { x: 0, y: 0 },
    isDragging: undefined,
    dragEntityStartWorldCoord: null,
    draggingEntityId: null
  }

  const onWheel = (
    e: WheelEvent,
    zoomTowardsCursor: (mousePos: Coord, ctx: CanvasRenderingContext2D, zoomFactor: number, camera: Camera) => void,
  ) => {
    e.preventDefault();
    const isEditing = useAppState.getState().isEditing;
    if (isEditing) return;

    if (e.ctrlKey) {
      e.preventDefault();

      if (e.deltaY < 0) {
        zoomTowardsCursor(
          editorCtx.mouseCanvasPosRef.current,
          ctx,
          1.03,
          world.camera
        );
      } else {
        zoomTowardsCursor(
          editorCtx.mouseCanvasPosRef.current,
          ctx,
          0.97,
          world.camera
        );
      }

      render(
        world,
        ctx,
      );
    } else {
      // divide be 2 because otherwise the pan speed is too high
      world.camera.x += (ctx.canvas ? (e as WheelEvent).deltaX : e.movementX) / 2;
      world.camera.y += (ctx.canvas ? (e as WheelEvent).deltaY : e.movementY) / 2;

      render(world, ctx);
    }

  }

  const handleMouseMove = (
    e: DraggableEvent,
  ) => {
    //track mouse
    trackMouse({
      e,
      mouseWorldPosition: editorCtx.mouseWorldPosRef,
      mouseCanvasPosition: editorCtx.mouseCanvasPosRef,
      ctx,
      camera: world.camera
    });
    trackHoveredEntity({
      hoveredEntityIdRef: editorCtx.hoveredEntityIdRef,
      mouseWorldPosRef: editorCtx.mouseWorldPosRef,
      world
    });


    if (
      editorCtx.activeTool === "selection"
    ) {
      render(world, ctx);

      const hoveredEntityId = editorCtx.hoveredEntityIdRef.current;
      if (hoveredEntityId !== "") {
        document.body.style.cursor = "move";
      } else {
        document.body.style.cursor = "default";
      }
      //selection stuff
      if (hoveredEntityId === "" && dragState.isDragging === "Rubberband") {
        const dragArea = drawRubberBand(dragState.dragOrigin, editorCtx.mouseWorldPosRef.current, ctx, world.camera);
        //const entities = findEntitiesUnderRubberBand(world, dragArea)
        world.entityStore.forEach(e => {
          const res = isEntityWithinSelection(e, dragArea);
          if (res) {
            editorCtx.addToSelectedEntities([e.id]);
          } else {
            editorCtx.removeFromSelectedEntities(e.id);
          }
        });
      }
      //dragging stuff
      const { draggingEntityId } = dragState;
      if (dragState.isDragging == "Entity" && draggingEntityId && editorCtx.selectedEntities.has(draggingEntityId)) {
        console.log("start drag");
        const entity = world.entityStore.get(draggingEntityId);
        if (!entity || !dragState.dragEntityStartWorldCoord) throw new Error("This entity does not exist in the store");
        //drag area = {start = mouse pos from where the drag starts, end = current mous pos}
        const dragArea: DragArea = {
          origin: dragState.dragOrigin,
          end: editorCtx.mouseWorldPosRef.current
        }
        dragEntity(entity, dragState.dragEntityStartWorldCoord, dragArea)
      }
    }
  }


  const handleMouseDown = () => {
    dragState.dragOrigin.x = editorCtx.mouseWorldPosRef.current.x
    dragState.dragOrigin.y = editorCtx.mouseWorldPosRef.current.y
    if (editorCtx.activeTool === "selection") {
      //select entity under mouse
      const hoveredEntityId = editorCtx.hoveredEntityIdRef.current;
      if (hoveredEntityId) {
        dragState.isDragging = "Entity";
        editorCtx.selectedEntities.clear();
        editorCtx.selectedEntities.add(hoveredEntityId);
        const entity = world.entityStore.get(hoveredEntityId);
        if (!entity) throw new Error("Entity doesn't exist");
        dragState.dragEntityStartWorldCoord = { ...entity.worldCoord };
        dragState.draggingEntityId = hoveredEntityId;
      } else {
        dragState.isDragging = "Rubberband";
        editorCtx.selectedEntities.clear();
      }
    }
    render(world, ctx);
  }

  const handleMouseUp = (
    currentEditingTextId: RefObject<string>,
    setEditing: (isEditing: boolean) => void,
  ) => {
    if (editorCtx.activeTool === "selection" && dragState.isDragging) {
      dragState.isDragging= undefined;
      render(world, ctx);
      return;
    }
    const coord = { ...editorCtx.mouseWorldPosRef.current };
    addEntity({
      activeTool: editorCtx.activeTool,
      ctx,
      currentEditingTextId,
      mouseWorldCoord: coord,
      world,
      setEditing,
    })
  }
  const createPageEntities = async (docMeta: DocMeta) => {

    for (let i = 1; i <= docMeta.pageCount; ++i) {
      const page = await docMeta.doc?.getPage(i);
      if (!page) break;

      const pageCanvas = document.createElement("canvas");
      const viewport = page.getViewport({ scale });

      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height

      await page.render({ canvasContext: pageCanvas.getContext("2d")!, viewport }).promise;

      const pageHeight = viewport.height / 2;
      const pageWidth = viewport.width / 2;
      const worldCoord: Coord = {
        x: -pageWidth / 2,
        y: -pageHeight / 2 + (i - 1) * (pageHeight + PAGE_BUFFER),
      }
      world.addEntity({
        worldCoord,
        pageCanvas,
        height: pageHeight,
        width: pageWidth,
        isRendered: false,
        type: "page"
      } as PageEntity)

    }
    render(world, ctx);
  }


  return {
    onWheel,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    createPageEntities,
  }
}

export type Editor = ReturnType<typeof createEditor>;

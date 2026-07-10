import type { RefObject } from "react";
import { useAppState } from "../../state/app";
import type { EditorContext, TextEntity, DraggableEvent, Coord, Camera } from "../../../types";
import { getMousePosition, type Size } from "../../../utils";
import { render } from "../render";
import { canvasToWorld } from "../../../utils";
import { addText, editText } from "../tools/text";
import { drawRubberBand, findEntitiesUnderRubberBand } from "../tools/selection";
import type { World } from "../world";

export type Editor = {
  onWheel: (e: WheelEvent, zoomTowardsCursor: (mousePos: Coord, ctx: CanvasRenderingContext2D, zoomFactor: number, camera: Camera) => void) => void;
  handleCanvasClick: (currentEditingTextId: RefObject<string>, setEditing: (isEditing: boolean) => void) => void;
  handleMouseMove: (e: DraggableEvent, isDragging: RefObject<boolean>, dragOrigin: RefObject<Coord>, canvas?: HTMLCanvasElement) => void;
  handleMouseDown: (dragOrigin: RefObject<Coord>, isDragging: RefObject<boolean>) => void;
  handleMouseUp: (isDragging: RefObject<boolean>, currentEditingTextId: RefObject<string>, setEditing: (isEditing: boolean) => void) => void;
}

export function createEditor(editorCtx: EditorContext, ctx: CanvasRenderingContext2D, world: World): Editor {
  //@TODO: move this to editor
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
          editorCtx.mousePosRef.current,
          ctx,
          1.03,
          world.camera
        );
      } else {
        zoomTowardsCursor(
          editorCtx.mousePosRef.current,
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

  const handleCanvasClick = (
    currentEditingTextId: RefObject<string>,
    setEditing: (isEditing: boolean) => void,
  ) => {

    const coord = { ...editorCtx.mousePosRef.current };

    switch (editorCtx.activeTool) {
      case "square":
        world.addEntity({
          id: "",
          type: "cube",
          worldCoord: coord,
          height: 100,
          width: 100,
          fillColor: "rgb(200, 20, 50)",
          isRendered: true
        })

        break;
      case "text":
        if (currentEditingTextId.current !== "") {
          break;
        }
        const id = addText(coord, world.addEntity)
        currentEditingTextId.current = id;
        setEditing(true);
        editText(
          coord,
          id,
          currentEditingTextId,
          world,
          ctx,
          setEditing
        );
        break;
      default:
        console.log('chill');

    }
    const entities = Array.from(world.entityStore.values()).map(e => e.worldCoord);
    render(world, ctx);
  }

  //@TODO: move to editor
  const handleMouseMove = (
    e: DraggableEvent,
    isDragging: RefObject<boolean>,
    dragOrigin: RefObject<Coord>,
  ) => {
    //track mouse
    getMousePosition({
      e,
      mousePosition: editorCtx.mousePosRef,
      ctx,
      camera: world.camera
    });
    if (
      editorCtx.activeTool === "selection" &&
      isDragging.current &&
      dragOrigin
    ) {
      render(world, ctx);

      const dragArea = drawRubberBand(dragOrigin.current, editorCtx.mousePosRef.current, ctx, world.camera);
      const entities = findEntitiesUnderRubberBand(world, dragArea)
      editorCtx.addToSelectedEntities(entities.map(e => e.id));
    }
  }


  //@TODO: move to editor
  const handleMouseDown = (dragOrigin: RefObject<Coord>, isDragging: RefObject<boolean>) => {
    //const dragOriginWorld = canvasToWorld(editorCtx.mousePosRef.current, ctx, world.camera);
    dragOrigin.current.x = editorCtx.mousePosRef.current.x
    dragOrigin.current.y = editorCtx.mousePosRef.current.y
    if (editorCtx.activeTool === "selection") {
      isDragging.current = true;
    }
  }

  //@TODO: move to editor
  const handleMouseUp = (
    isDragging: RefObject<boolean>,
    currentEditingTextId: RefObject<string>,
    setEditing: (isEditing: boolean) => void,
  ) => {
    if (editorCtx.activeTool === "selection" && isDragging.current) {
      isDragging.current = false;
      render(world, ctx);
      return;
    }

    handleCanvasClick(currentEditingTextId, setEditing);
  }

  return {
    onWheel,
    handleCanvasClick,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp
  }

}

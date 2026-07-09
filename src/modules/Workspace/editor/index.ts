import type { RefObject } from "react";
import { useAppState } from "../../state/app";
import type { EditorContext, TextEntity, DraggableEvent, Coord, Camera } from "../../../types";
import { getMousePosition, type Size } from "../../../utils";
import { render } from "../render";
import { canvasToWorld } from "../../../utils";
import { addText, editText } from "../tools/text";
import { drawRubberBand } from "../tools/selection";
import type { World } from "../world";

export type Editor = {
  onWheel: (e: WheelEvent, zoomTowardsCursor: (mousePos: Coord, canvas: Size, zoomFactor: number, camera: Camera) => void) => void;
  handleCanvasClick: (currentEditingTextId: RefObject<string>, setEditing: (isEditing: boolean) => void) => void;
  handleMouseMove: (e: DraggableEvent, isDragging: RefObject<boolean>, dragOrigin: RefObject<Coord>, canvas?: HTMLCanvasElement) => void;
  handleMouseDown: (dragOrigin: RefObject<Coord>, isDragging: RefObject<boolean>) => void;
  handleMouseUp: (isDragging: RefObject<boolean>, currentEditingTextId: RefObject<string>, setEditing: (isEditing: boolean) => void) => void;
}

export function createEditor(editorCtx: EditorContext, ctx: CanvasRenderingContext2D, world: World): Editor {
  //@TODO: move this to editor
  const onWheel = (
    e: WheelEvent,
    zoomTowardsCursor: (mousePos: Coord, canvas: Size, zoomFactor: number, camera: Camera) => void,
  ) => {
    console.log('wheeling');
    e.preventDefault();
    const isEditing = useAppState.getState().isEditing;
    if (isEditing) return;

    if (e.ctrlKey) {
      e.preventDefault();

      if (e.deltaY < 0) {
        zoomTowardsCursor(
          editorCtx.mousePosRef.current,
          { height: ctx.canvas.clientHeight, width: ctx.canvas.clientWidth },
          1.03,
          world.camera
        );
      } else {
        zoomTowardsCursor(
          editorCtx.mousePosRef.current,
          { height: ctx.canvas.clientHeight, width: ctx.canvas.clientWidth },
          0.97,
          world.camera
        );
      }

      render(
        world,
        ctx,
      );
    } else {
      world.camera.x += ctx.canvas ? (e as WheelEvent).deltaX : e.movementX;
      world.camera.y += ctx.canvas ? (e as WheelEvent).deltaY : e.movementY;

      render(world, ctx);
    }

  }

  const handleCanvasClick = (
    currentEditingTextId: RefObject<string>,
    setEditing: (isEditing: boolean) => void,
  ) => {
    console.log('click triggered: ', editorCtx.activeTool);

    const screenCoords = editorCtx.mousePosRef.current;

    const canvasSize = {
      height: ctx.canvas.clientHeight,
      width: ctx.canvas.clientWidth
    }
    const worldCoord = canvasToWorld(
      screenCoords,
      { width: canvasSize.width, height: canvasSize.height },
      world.camera
    );

    switch (editorCtx.activeTool) {
      case "square":
        world.addEntity({
          id: "",
          type: "cube",
          worldCoord,
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
        const id = addText(worldCoord, world.addEntity)
        currentEditingTextId.current = id;
        setEditing(true);
        editText(
          screenCoords,
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
    render(world, ctx);
  }

  //@TODO: move to editor
  const handleMouseMove = (
    e: DraggableEvent,
    isDragging: RefObject<boolean>,
    dragOrigin: RefObject<Coord>,
    canvas?: HTMLCanvasElement
  ) => {
    console.log('moving mouse');
    //track mouse
    getMousePosition(
      e,
      editorCtx.mousePosRef,
      canvas ? canvas : e.currentTarget as HTMLCanvasElement
    );
    if (
      editorCtx.activeTool === "selection" &&
      isDragging.current &&
      dragOrigin
    ) {
      render(world, ctx);
      const dragArea = drawRubberBand(dragOrigin.current, editorCtx.mousePosRef.current, ctx);

    }
  }


  //@TODO: move to editor
  const handleMouseDown = (dragOrigin: RefObject<Coord>, isDragging: RefObject<boolean>) => {
    console.log('mouse down running');
    dragOrigin.current.x = editorCtx.mousePosRef.current.x;
    dragOrigin.current.y = editorCtx.mousePosRef.current.y;
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
    console.log('mouse up ', editorCtx.activeTool);
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

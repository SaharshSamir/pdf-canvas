import type { RefObject } from "react";
import { useAppState } from "../../state/app";
import type { EditorContext, PageEntity, DraggableEvent, Coord, Camera, DocMeta } from "../../../types";
import { getMousePosition } from "../../../utils";
import { render } from "../render";
import { addText, editText } from "../tools/text";
import { drawRubberBand, findEntitiesUnderRubberBand } from "../tools/selection";
import type { World } from "../world";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;

export function createEditor(editorCtx: EditorContext, ctx: CanvasRenderingContext2D, world: World) {
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

  const handleCanvasClick = (
    currentEditingTextId: RefObject<string>,
    setEditing: (isEditing: boolean) => void,
  ) => {

    const coord = { ...editorCtx.mouseWorldPosRef.current };

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
      mouseWorldPosition: editorCtx.mouseWorldPosRef,
      mouseCanvasPosition: editorCtx.mouseCanvasPosRef,
      ctx,
      camera: world.camera
    });
    if (
      editorCtx.activeTool === "selection" &&
      isDragging.current &&
      dragOrigin
    ) {
      render(world, ctx);

      const dragArea = drawRubberBand(dragOrigin.current, editorCtx.mouseWorldPosRef.current, ctx, world.camera);
      const entities = findEntitiesUnderRubberBand(world, dragArea)
      editorCtx.addToSelectedEntities(entities.map(e => e.id));
    }
  }


  //@TODO: move to editor
  const handleMouseDown = (dragOrigin: RefObject<Coord>, isDragging: RefObject<boolean>) => {
    //const dragOriginWorld = canvasToWorld(editorCtx.mousePosRef.current, ctx, world.camera);
    dragOrigin.current.x = editorCtx.mouseWorldPosRef.current.x
    dragOrigin.current.y = editorCtx.mouseWorldPosRef.current.y
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

    //if (ctx) {
    //  render(worldRef.current, ctx);
    //}
  }
  return {
    onWheel,
    handleCanvasClick,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    createPageEntities
  }

}

export type Editor = ReturnType<typeof createEditor>;

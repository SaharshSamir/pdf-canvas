import { useAppState } from "../../state/app";
import type { EditorContext, PageEntity, DraggableEvent, Coord, Camera, DocMeta, Tools } from "../../../types";
import { render } from "../render/render";
import { trackHoveredEntity, trackMouse } from "../../../utils";
import { selection } from "./tools/selection";
import { square } from "./tools/square";
import { text } from "./tools/text";
import type { Strategy } from "./types";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;


export function createEditor(
  ctx: EditorContext,
) {

  const strategy: Record<Tools, Strategy> = {
    selection: selection(),
    square: square(),
    text: text(),
  }

  const tool = strategy[ctx.activeTool];

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
          ctx.mouseCanvasPosRef.current,
          ctx.canvasCtx,
          1.03,
          ctx.world.camera
        );
      } else {
        zoomTowardsCursor(
          ctx.mouseCanvasPosRef.current,
          ctx.canvasCtx,
          0.97,
          ctx.world.camera
        );
      }

      render(
        ctx.world,
        ctx.canvasCtx,
      );
    } else {
      // divide be 2 because otherwise the pan speed is too high
      ctx.world.camera.x += (ctx.canvasCtx.canvas ? (e as WheelEvent).deltaX : e.movementX) / 2;
      ctx.world.camera.y += (ctx.canvasCtx.canvas ? (e as WheelEvent).deltaY : e.movementY) / 2;

      render(ctx.world, ctx.canvasCtx);
    }

  }

  const handleMouseMove = (
    e: DraggableEvent,
  ) => {
    //track mouse
    trackMouse({
      e,
      mouseWorldPosition: ctx.mouseWorldPosRef,
      mouseCanvasPosition: ctx.mouseCanvasPosRef,
      ctx: ctx.canvasCtx,
      camera: ctx.world.camera
    });
    trackHoveredEntity({
      hoveredEntityIdRef: ctx.hoveredEntityIdRef,
      mouseWorldPosRef: ctx.mouseWorldPosRef,
      world: ctx.world
    });

    render(ctx.world, ctx.canvasCtx);
    tool.onMouseMove(ctx);

  }

  const handleMouseDown = () => {
    tool.onMouseDown(ctx);
    render(ctx.world, ctx.canvasCtx);
  }

  const handleMouseUp = (
  ) => {
    tool.onMouseUp(ctx);
    render(ctx.world, ctx.canvasCtx);
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
      ctx.world.addEntity({
        worldCoord,
        pageCanvas,
        height: pageHeight,
        width: pageWidth,
        isRendered: false,
        type: "page"
      } as PageEntity)
    }
    render(ctx.world, ctx.canvasCtx);
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

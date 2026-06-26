import { useEffect, useState, useRef } from "react";
import type { Coord, DocMeta, PageEntity, Camera, DraggableEvent, Tools, TextEntity } from "../../types";
import { render } from "./render";
import { createEntity, entityStore } from "./utils";
import { canvasToWorld, getMousePosition, worldToCanvas, zoomTowardsCursor } from "../../utils";
import { drawSquare } from "./tools/square";
import { addText, editText } from "./tools/text";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;

type Props = {
  docMeta: DocMeta;
  currentTool: Tools
}


function Whiteboard({ docMeta, currentTool }: Props) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0
  });

  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mousePosRef = useRef<Coord>({ x: 0, y: 0 });
  const currentEditingTextId = useRef<string>("");

  let isDragging = useRef<boolean>(false);
  let beginDragging = useRef<boolean>(false);


  useEffect(() => {
    const viewport = document.getElementById("viewport");
    if (!viewport) return;
    setSize({
      height: viewport.clientHeight,
      width: viewport.clientWidth
    })

  }, []);

  useEffect(() => {
    //handle panning
    document.addEventListener("keydown", (e) => {
      if (e.shiftKey) {
        isDragging.current = true;
        //setIsDragging(true);
      }
    })
    document.addEventListener("keyup", (e) => {
      isDragging.current = false;
      //setIsDragging(false);
    })

    //handle zoom and panning
    document.addEventListener("wheel", (e) => {
      const ctx = canvasCtxRef.current;
      if (!ctx) return;

      isDragging.current = true;
      //setIsDragging(true);

      handleDrag(e, ctx.canvas);

      if (e.ctrlKey) {
        e.preventDefault();

        if (e.deltaY < 0) {
          zoomTowardsCursor(
            mousePosRef.current,
            { height: ctx.canvas.clientHeight, width: ctx.canvas.clientWidth },
            1.05,
            cameraRef.current
          );
        } else {
          zoomTowardsCursor(
            mousePosRef.current,
            { height: ctx.canvas.clientHeight, width: ctx.canvas.clientWidth },
            0.93,
            cameraRef.current
          );
        }

        render(
          entityStore,
          ctx,
          cameraRef.current,
        );
      }
      isDragging.current = false;

    }, { passive: false })
  }, []);


  useEffect(() => {
    if (size.height === 0 || size.width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvasCtxRef.current = ctx;

  }, [size]);

  useEffect(() => {

    async function renderPages() {

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
        createEntity({
          worldCoord,
          pageCanvas,
          height: pageHeight,
          width: pageWidth,
          isRendered: false,
          type: "page"
        } as PageEntity)

      }


      const ctx = canvasCtxRef.current;
      if (ctx) {
        render(entityStore, ctx, cameraRef.current);
      }
    }

    renderPages();
  }, [docMeta.pageCount])

  //add square entity
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isDragging.current || beginDragging.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const screenCoords = mousePosRef.current;

    const canvasSize = {
      height: canvas.clientHeight,
      width: canvas.clientWidth
    }
    const worldCoord = canvasToWorld(
      screenCoords,
      { width: canvasSize.width, height: canvasSize.height },
      cameraRef.current
    );

    //@TODO: we don't really need drawSquare or addTextBox. These functions are just creating the entity
    switch (currentTool) {
      case "square":
        drawSquare(worldCoord);
        break;
      case "text":
        if (currentEditingTextId.current !== "") {
          break;
        }
        const id = addText(worldCoord)
        currentEditingTextId.current = id;
        editText(
          screenCoords,
          entityStore.get(id) as TextEntity,
          currentEditingTextId,
          ctx,
          cameraRef.current
        );
        break;
      default:
        addText(worldCoord, "Nigga");
        console.log('chill');

    }
    render(entityStore, ctx, cameraRef.current);

  }

  const handleDrag = (e: DraggableEvent, canvas?: HTMLCanvasElement) => {
    getMousePosition(e, mousePosRef, canvas ? canvas : e.currentTarget as HTMLCanvasElement);
    if (isDragging.current) {
      cameraRef.current.x += canvas ? (e as WheelEvent).deltaX : e.movementX;
      cameraRef.current.y += canvas ? (e as WheelEvent).deltaY : e.movementY;

      const ctx = canvasCtxRef.current;
      if (ctx) render(entityStore, ctx, cameraRef.current);
    }
  }

  return (
    <canvas
      style={{ backgroundColor: "#1d1d1d", height: "100%", width: "100%" }}
      id="canvas"
      ref={canvasRef}
      width={size.width}
      height={size.height}
      onMouseDown={(e) => {
        handleCanvasClick(e);
        beginDragging.current = true
      }}
      onMouseUp={() => beginDragging.current = false}
      //onClick={(e) => handleCanvasClick(e)}
      onMouseMove={(e) => handleDrag(e)}
    ></canvas>
  )
}

export default function Workspace({ docMeta, currentTool }: Props) {
  return (
    <div id="viewport" className="h-full w-full absolute flex justify-center items-center">
      <Whiteboard docMeta={docMeta} currentTool={currentTool} />
    </div>
  )
}

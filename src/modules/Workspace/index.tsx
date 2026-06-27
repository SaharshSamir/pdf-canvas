import { useEffect, useState, useRef, type RefObject } from "react";
import type { Coord, DocMeta, PageEntity, Camera, DraggableEvent, Tools, TextEntity } from "../../types";
import { render } from "./render";
import { canvasToWorld, getMousePosition, zoomTowardsCursor } from "../../utils";
import { addText, editText } from "./tools/text";
import { useAppState } from "../state/app";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;

type Props = {
  docMeta: DocMeta;
}


function Whiteboard({ docMeta }: Props) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0
  });

  const { addEntity, activeTool, canvasCtx, camera, entityStore } = useAppState();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
      }
    })
    document.addEventListener("keyup", (e) => {
      isDragging.current = false;
      //setIsDragging(false);
    })

    //handle zoom and panning
    document.addEventListener("wheel", (e) => {
      const ctx = canvasCtx;
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
            camera
          );
        } else {
          zoomTowardsCursor(
            mousePosRef.current,
            { height: ctx.canvas.clientHeight, width: ctx.canvas.clientWidth },
            0.93,
            camera
          );
        }

        render(
          entityStore,
          ctx,
          camera
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
    useAppState.setState({ canvasCtx: ctx })

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
        addEntity({
          worldCoord,
          pageCanvas,
          height: pageHeight,
          width: pageWidth,
          isRendered: false,
          type: "page"
        } as PageEntity)

      }


      const ctx = canvasCtx;
      if (ctx) {
        render(entityStore, ctx, camera);
      }
    }

    renderPages();
  }, [docMeta.pageCount])

  //add square entity
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isDragging.current || beginDragging.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasCtx;
    if (!canvas || !ctx) return;

    const screenCoords = mousePosRef.current;

    const canvasSize = {
      height: canvas.clientHeight,
      width: canvas.clientWidth
    }
    const worldCoord = canvasToWorld(
      screenCoords,
      { width: canvasSize.width, height: canvasSize.height },
      camera
    );

    //@TODO: we don't really need drawSquare or addTextBox. These functions are just creating the entity
    switch (activeTool) {
      case "square":
        addEntity({
          id: "",
          type: "cube",
          worldCoord: { x: 0, y: 0 },
          height: 10,
          width: 10,
          fillColor: "rgb(200, 20, 50)",
          isRendered: true
        })

        break;
      case "text":
        if (currentEditingTextId.current !== "") {
          break;
        }
        const id = addText(worldCoord, addEntity)
        currentEditingTextId.current = id;
        editText(
          screenCoords,
          entityStore.get(id) as TextEntity,
          currentEditingTextId,
          ctx,
          camera,
          entityStore
        );
        break;
      default:
        console.log('chill');

    }
    render(entityStore, ctx, camera);

  }

  const handleDrag = (e: DraggableEvent, canvas?: HTMLCanvasElement) => {
    getMousePosition(e, mousePosRef, canvas ? canvas : e.currentTarget as HTMLCanvasElement);
    if (isDragging.current) {
      camera.x += canvas ? (e as WheelEvent).deltaX : e.movementX;
      camera.y += canvas ? (e as WheelEvent).deltaY : e.movementY;

      const ctx = canvasCtx;
      if (ctx) render(entityStore, ctx, camera);
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

export default function Workspace({ docMeta }: Props) {
  return (
    <div id="viewport" className="h-full w-full absolute flex justify-center items-center">
      <Whiteboard docMeta={docMeta} />
    </div>
  )
}

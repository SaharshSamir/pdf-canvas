import { useEffect, useState, useRef, type RefObject } from "react";
import type { Coord, DocMeta, PageEntity, Camera, DraggableEvent, Tools, TextEntity } from "../../types";
import { render } from "./render";
import { canvasToWorld, getMousePosition, zoomTowardsCursor } from "../../utils";
import { addText, editText } from "./tools/text";
import { useAppState } from "../state/app";
import { drawRubberBand } from "./tools/selection";

const PAGE_BUFFER = 10;
const scale = window.devicePixelRatio;

type Props = {
  docMeta: DocMeta;
}


export default function Workspace({ docMeta }: Props) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0
  });

  const {
    addEntity,
    activeTool,
    canvasCtx,
    camera,
    entityStore,
    setEditing,
  } = useAppState();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<Coord>({ x: 0, y: 0 });
  const currentEditingTextId = useRef<string>("");
  const dragOrigin = useRef<Coord>({ x: 0, y: 0 });

  let isDragging = useRef<boolean>(false);


  useEffect(() => {
    const viewport = document.getElementById("viewport");
    if (!viewport) return;
    setSize({
      height: viewport.clientHeight,
      width: viewport.clientWidth
    })

  }, []);

  useEffect(() => {
    if (!canvasCtx) return;
    //handle panning
    const onKeydown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        isDragging.current = true;
      }
    }


    const onKeyup = (e: KeyboardEvent) => {
      isDragging.current = false;
      //setIsDragging(false);
    }

    //handle zoom and panning
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const isEditing = useAppState.getState().isEditing;
      if (isEditing) return;
      const ctx = canvasCtx;
      if (!ctx) return;


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
      } else {
        camera.x += ctx.canvas ? (e as WheelEvent).deltaX : e.movementX;
        camera.y += ctx.canvas ? (e as WheelEvent).deltaY : e.movementY;

        render(entityStore, canvasCtx, camera);
      }

    }

    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
    document.addEventListener("wheel", onWheel, { passive: false })

    return () => {
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("keyup", onKeyup);
      document.removeEventListener("keydown", onKeydown);
    }

  }, [canvasCtx, activeTool]);


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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

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
        const id = addText(worldCoord, addEntity)
        currentEditingTextId.current = id;
        setEditing(true);
        editText(
          screenCoords,
          entityStore.get(id) as TextEntity,
          currentEditingTextId,
          ctx,
          camera,
          entityStore,
          setEditing
        );
        break;
      default:
        console.log('chill');

    }
    render(entityStore, ctx, camera);
  }

  const handleMouseMove = (e: DraggableEvent, canvas?: HTMLCanvasElement) => {
    //track mouse
    getMousePosition(e, mousePosRef, canvas ? canvas : e.currentTarget as HTMLCanvasElement);

    if (!canvasCtx) return;

    if (isDragging.current && activeTool === "selection") {
      render(entityStore, canvasCtx, camera);
      drawRubberBand(dragOrigin.current, mousePosRef.current, canvasCtx);

    }
  }

  const handleMouseDown = () => {
    dragOrigin.current.x = mousePosRef.current.x;
    dragOrigin.current.y = mousePosRef.current.y;
    if (activeTool === "selection") {
      isDragging.current = true;
    }
  }

  const handleDragEnd = () => {
    if (activeTool === "selection") {
      isDragging.current = false;
    }
  }
  return (
    <div id="viewport" className="h-full w-full absolute flex justify-center items-center">
      <canvas
        style={{ backgroundColor: "#1d1d1d", height: "100%", width: "100%" }}
        id="canvas"
        ref={canvasRef}
        width={size.width}
        height={size.height}
        onMouseUp={(e) => {
          handleCanvasClick(e);
          handleDragEnd()
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      ></canvas>
    </div>
  )
}

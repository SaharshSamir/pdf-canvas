import { useEffect, useState, useRef, type RefObject, useMemo } from "react";
import type { Coord, DocMeta, PageEntity, EditorContext } from "../../types";
import { render } from "./render";
import { useAppState } from "../state/app";
import { type Editor, createEditor } from "./editor";
import { createWorld, type World } from "./world";

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
    activeTool,
    selectedEntities,
    addToSelectedEntities,
    setEditing,

  } = useAppState();

  const worldRef = useRef<World>(createWorld())
  const editorRef = useRef<Editor>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** World coord */
  const mousePosRef = useRef<Coord>({ x: 0, y: 0 });
  const currentEditingTextId = useRef<string>("");
  /** World coord */
  const dragOrigin = useRef<Coord>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);


  useEffect(() => {
    const viewport = document.getElementById("viewport");
    if (!viewport) return;
    setSize({
      height: viewport.clientHeight,
      width: viewport.clientWidth
    })
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const editorCtx: EditorContext = {
      activeTool,
      selectedEntities,
      mousePosRef,
      addToSelectedEntities
    }
    editorRef.current = createEditor(editorCtx, ctx, worldRef.current);
  }, [activeTool]);

  //attach all the listeners
  useEffect(() => {
    if (!editorRef.current) return;
    document.addEventListener(
      "wheel",
      (e) => editorRef.current?.onWheel(e, worldRef.current.zoomTowardsCursor), { passive: false }
    )

    return () => {
      document.removeEventListener(
        "wheel",
        (e) => editorRef.current?.onWheel(e, worldRef.current.zoomTowardsCursor)
      );
    }

  }, [activeTool]);


  useEffect(() => {
    if (size.height === 0 || size.width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    useAppState.setState({ canvasCtx: ctx })

  }, [size]);

  useEffect(() => {

    //@TODO:move this to editor also
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
        worldRef.current.addEntity({
          worldCoord,
          pageCanvas,
          height: pageHeight,
          width: pageWidth,
          isRendered: false,
          type: "page"
        } as PageEntity)

      }

      //if (ctx) {
      //  render(worldRef.current, ctx);
      //}
    }

    renderPages();
  }, [docMeta.pageCount])


  return (
    <div id="viewport" className="h-full w-full absolute flex justify-center items-center">
      <canvas
        style={{ backgroundColor: "#1d1d1d", height: "100%", width: "100%" }}
        id="canvas"
        ref={canvasRef}
        width={size.width}
        height={size.height}
        onMouseUp={() => editorRef.current?.handleMouseUp(isDragging, currentEditingTextId, setEditing)}
        onMouseDown={() => editorRef.current?.handleMouseDown(dragOrigin, isDragging)}
        onMouseMove={(e) => editorRef.current?.handleMouseMove(e, isDragging, dragOrigin)}
      ></canvas>
    </div>
  )
}

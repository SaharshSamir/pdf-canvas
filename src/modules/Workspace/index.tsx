import { useEffect, useState, useRef } from "react";
import type { Coord, DocMeta } from "../../types";
import { render } from "./render";
import { createEntity, entityStore } from "./utils";

type Props = {
  docMeta: DocMeta;
  isDragging: boolean;
}

function Whiteboard({ docMeta, isDragging }: Props) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0
  });
  const cameraRef = useRef<Coord>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
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
    if (size.height === 0 || size.width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvasCtxRef.current = ctx;

  }, [size]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    console.log('beginDragging: ', beginDragging.current);

    console.log(isDragging, beginDragging.current);
    if (isDragging || beginDragging.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const entity = createEntity({
      id: "",
      type: "cube",
      worldCoord: { x: 0, y: 0 },
      height: 10,
      width: 10,
      fillColor: "rgb(200, 20, 50)",
      isRendered: true
    })

    entity.worldCoord.x = clickX - (canvas.width / 2) + cameraRef.current.x;
    entity.worldCoord.y = clickY - (canvas.height / 2) + cameraRef.current.y;

    render(entityStore, ctx, cameraRef.current);

  }

  const handleDrag = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isDragging && beginDragging.current) {
      cameraRef.current.x -= e.movementX;
      cameraRef.current.y -= e.movementY;

      const ctx = canvasCtxRef.current;
      if (ctx) render(entityStore, ctx, cameraRef.current);
    }
  }

  return (
    <canvas
      style={{ backgroundColor: "pink" }}
      id="canvas"
      ref={canvasRef}
      width={size.width - 20}
      height={size.height - 20}
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

export default function Workspace({ docMeta, isDragging }: Props) {
  return (
    <div id="viewport" className="h-full w-full bg-green-200 absolute flex justify-center items-center">
      <Whiteboard docMeta={docMeta} isDragging={isDragging} />
    </div>
  )
}

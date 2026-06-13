import { useEffect, useState, useRef } from "react";

function Whiteboard() {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
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

    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    ctx.fillStyle = "rgb(200, 20, 50)";
    ctx.fillRect(clickX, clickY, 10, 10);

  }

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      width={size.width - 20}
      height={size.height - 20}
      onClick={(e) => handleCanvasClick(e)}
    ></canvas>
  )
}

export default function Workspace() {
  return (
    <div id="viewport" className="h-full w-full bg-green-200 absolute flex justify-center items-center">
      <Whiteboard />
    </div>
  )
}

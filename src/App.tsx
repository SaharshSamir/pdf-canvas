import { useState, useEffect } from "react";
import './App.css'
import { usePdf } from "./modules/pdf";
import { centerWorldToCamera, useInitControls } from "./modules/world/controls";
import { entities, makeRandomSquares } from "./modules/world/objects";
import { entitiesToRender, type RenderSurface } from "./modules/world/renderer";
import type { Coord } from "./modules/world/controls";

function addPointToOrigin(parent: HTMLDivElement) {
  const point = document.getElementById("origin-point");
  if (!point) return;
  point.style.height = "5px"
  point.style.width = "5px"
  point.style.backgroundColor = "#FFFFFF";

  parent.appendChild(point);

  point.style.transform = `translate(${(parent.clientHeight / 2) - 2.5}px, ${(parent.clientWidth / 2) - 2.5}px)`;

}


function App() {
  const { pageCount, uploadFile, containerRef: worldRef } = usePdf();
  const [cameraCoord, setCameraCoord] = useState<Coord>({ x: 0, y: 0 });

  useEffect(() => {
    const world = worldRef.current;
    if (world) {
      makeRandomSquares();
      addPointToOrigin(world);
      centerWorldToCamera(world);
    }
  }, []);
  useInitControls(worldRef, setCameraCoord);
  useEffect(() => {
    const world = worldRef.current;
    if (world) {
      const renderSurface: RenderSurface = {
        div: world,
        height: world.clientHeight,
        width: world.clientWidth,
        center: cameraCoord
      }
      entitiesToRender(entities, renderSurface, cameraCoord);
    }
  }, [cameraCoord]);

  return (
    <div className="min-h-screen flex flex-col items-center ">
      <p>Upload a pdf</p>
      <input className="border border-white" type="file" onChange={(e) => uploadFile(e)} />
      <p>pages: {pageCount}</p>
      {cameraCoord && (
        <>
          <p>Camera x,y: {cameraCoord.x}, {cameraCoord.y}</p>
        </>
      )}
      <div id="viewport" className="relative overflow-hidden bg-gray-300 m-5 h-[1000px] w-[1000px]">
        <div
          id="world"
          className="relative bg-slate-700 h-[1250px] w-[1250px]" ref={worldRef}
        >
          <div id="origin-point"></div>
        </div>
      </div>
    </div>
  )
}

export default App

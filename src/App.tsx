import { useState, useEffect, useRef } from "react";
import './App.css'
import { usePdf } from "./modules/pdf";
import { centerWorldToCamera, useInitControls } from "./modules/world/controls";
import { createPageEntities, entities } from "./modules/world/objects";
import { entitiesToRender, type RenderSurface } from "./modules/world/renderer";
import type { Coord } from "./types";

function addPointToOrigin(parent: HTMLDivElement) {
  const point = document.getElementById("origin-point");
  if (!point) return;
  point.style.height = "5px"
  point.style.width = "5px"
  point.style.backgroundColor = "#FFFFFF";

  parent.appendChild(point);

  point.style.transform = `translate(${(parent.clientHeight / 2) - 2.5}px, ${(parent.clientWidth / 2) - 2.5}px)`;

}

//given the doc, go thru all it's pages and make entities out of them 
//and add em to the entity store

function App() {
  const { pageCount, uploadFile, doc, pageHeight, pageWidth } = usePdf();
  const [cameraCoord, setCameraCoord] = useState<Coord>({ x: 0, y: 0 });
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    if (world) {
      addPointToOrigin(world);
      centerWorldToCamera(world);
    }
  }, []);
  useEffect(() => {
    async function createAndRenderPages() {
      if (!doc) return;
      await createPageEntities(doc, pageHeight, pageWidth);
      const world = worldRef.current;
      if (world) {
        const renderSurface: RenderSurface = {
          div: world,
          height: world.clientHeight,
          width: world.clientWidth,
          center: cameraCoord
        }
        await entitiesToRender(entities, renderSurface, cameraCoord);
      }
    }
    createAndRenderPages();

  }, [pageCount]);
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



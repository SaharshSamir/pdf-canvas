import { useState, useEffect, useRef } from 'react'
import '../../App.css'
import { useUploadDoc } from './upload';
import { computeRenderWindow, computeVisiblePage } from './virtualization';
import { useDisplayPages } from "./display";
import type { RenderWindow } from './display';
import addScrollListener from './addScrollListener';
import { fillRandomSquares } from '../world';
import type { Coord } from '../world';


const renderedPagesMap: Map<number, HTMLDivElement> = new Map();

function Pdf() {
  const [file, setFile] = useState<File | null>(null);
  const [renderWindow, setRenderWindow] = useState<RenderWindow>({ start: 0, end: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const visiblePagesRef = useRef<number>(0);
  const currentVisiblePageRef = useRef<number>(1);
  const [cameraCoord, setCameraCoord] = useState<Coord>({ x: 0, y: 0 });

  useEffect(() => {
    const world = containerRef.current?.children[0] as HTMLDivElement;
    if (world) {
      fillRandomSquares(world, setCameraCoord);
    }
  }, []);

  //get doc metadata
  const { doc, pageCount, pageHeight } = useUploadDoc(file);

  //get initial render window
  useEffect(() => {
    if (doc && pageHeight > 0) {
      visiblePagesRef.current = Math.ceil(window.innerHeight / pageHeight);
      currentVisiblePageRef.current = computeVisiblePage(pageHeight);
      const { start, end } = computeRenderWindow(
        visiblePagesRef.current,
        pageCount, currentVisiblePageRef.current
      );
      setRenderWindow({ start, end });
    }
  }, [file, pageCount]);

  const { isInitialWindowMounted } = useDisplayPages({ renderWindow, renderedPagesMap, doc, container: containerRef.current });

  useEffect(() => {
    if (isInitialWindowMounted) {
      addScrollListener(pageHeight, pageCount, currentVisiblePageRef, visiblePagesRef.current, setRenderWindow);
    }
  }, [isInitialWindowMounted]);


  const uploadFile = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    setFile(files[0]);
  }

  return (
    <div>
      <p>Upload a pdf</p>
      <input className="border border-white" type="file" onChange={(e) => uploadFile(e)} />
      <p>pages: {pageCount}</p>
      {cameraCoord && (
        <>
          <p>Camera x,y: {cameraCoord.x}, {cameraCoord.y}</p>
        </>
      )}
      <div id="viewport" className="relative overflow-hidden bg-gray-300 m-5 h-[500px] w-[1000px]" ref={containerRef}>
        <div
          style={{
            transform: `translate(${cameraCoord.x}px, ${cameraCoord.y}px)`
          }}
          className="relative bg-slate-700 h-[10000px] w-[10000px]"
        >
        </div>
      </div>
    </div>
  )
}

export default Pdf;

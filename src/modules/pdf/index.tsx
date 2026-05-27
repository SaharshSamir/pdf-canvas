import { useState, useEffect, useRef } from 'react'
import '../../App.css'
import { useUploadDoc } from './upload';
import { computeRenderWindow, computeVisiblePage } from './virtualization';
import { useDisplayPages } from "./display";
import type { RenderWindow } from './display';
import addScrollListener from './addScrollListener';


const renderedPagesMap: Map<number, HTMLDivElement> = new Map();

export function usePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [renderWindow, setRenderWindow] = useState<RenderWindow>({ start: 0, end: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const visiblePagesRef = useRef<number>(0);
  const currentVisiblePageRef = useRef<number>(1);

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

  return {
    pageCount,
    uploadFile,
    containerRef
  }
}


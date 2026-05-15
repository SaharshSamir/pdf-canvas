import { useState, useEffect, useRef } from 'react'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist';

const PAGES_BUFFER = 2;

/* @TODO: map page number to wrapper div instead of the canvas */
/** maps the page number to the canvas element that renders the page */
const renderedPages: Map<number, HTMLDivElement> = new Map();

function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const visiblePagesRef = useRef<number>(0);
  const firstRenderedPageIdxRef = useRef<number>(1);
  const lastRenderedPageIdxRef = useRef<number>(0);
  const scrollTopRef = useRef<number>(0);
  const pageHeightRef = useRef<number>(0);
  const currentVisiblePage = useRef<number>(1);

  function yieldToBrowser() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    })
  }

  useEffect(() => {
    //render pages
    if (!files || files.length === 0) return;
    const load = async () => {
      const file = await files[0].arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: file }).promise;

      documentRef.current = doc;

      setPageCount(doc.numPages);
      const container = containerRef.current!;
      container.innerHTML = "";

      //this is where we need to calculate the total pages to render at a given moment
      const viewportHeight = window.innerHeight;
      const pageHeight = (await doc.getPage(1)).getViewport({ scale: 1 }).height;
      pageHeightRef.current = pageHeight;

      const pagesVisible = Math.ceil(viewportHeight / pageHeight);
      visiblePagesRef.current = pagesVisible;

      lastRenderedPageIdxRef.current = Math.min(pagesVisible + PAGES_BUFFER, doc.numPages);

      await moveRenderWindow(firstRenderedPageIdxRef.current, lastRenderedPageIdxRef.current); //initial load
      addScrollListener();
    }

    load();

  }, [files]);

  function addScrollListener() {
    window.addEventListener('scroll', () => {
      scrollTopRef.current = window.scrollY + 50;
      if (pageHeightRef.current && documentRef.current) {
        const currentPage = Math.ceil(scrollTopRef.current / pageHeightRef.current);
        const totalpages = documentRef.current.numPages;
        //if visible page changed
        if (currentPage !== currentVisiblePage.current) {
          currentVisiblePage.current = currentPage;

          firstRenderedPageIdxRef.current = Math.max(currentVisiblePage.current - PAGES_BUFFER, 1);
          lastRenderedPageIdxRef.current = Math.min(firstRenderedPageIdxRef.current + visiblePagesRef.current + PAGES_BUFFER, totalpages);

          console.log(firstRenderedPageIdxRef.current, visiblePagesRef.current, PAGES_BUFFER, totalpages, currentPage);
          moveRenderWindow(firstRenderedPageIdxRef.current, lastRenderedPageIdxRef.current);
        }

      }

    })
  }


  function unmountPages() {
    renderedPages.forEach((pageWrapper, pageNumber) => {
      if (pageWrapper.hasChildNodes()) {
        if (pageNumber < firstRenderedPageIdxRef.current || pageNumber > lastRenderedPageIdxRef.current) {
          const canvas = pageWrapper.children[0] as HTMLCanvasElement;
          canvas.remove();
        }
      }
    })
  }


  //this function will be for rendering the next pages when scrolling down
  const moveRenderWindow = async (start: number, end: number) => {
    const doc = documentRef.current!;
    const container = containerRef.current!;
    // [start....end] window represents the range of pages to render

    if (start >= doc.numPages) return;

    //pages and the loop counter are both 1 indexed
    //load first x pages to render
    for (let i = start; i <= end; i++) {

      if (renderedPages.get(i)?.hasChildNodes()) continue;

      const page = await doc.getPage(i);
      const canvas = document.createElement("canvas");
      const canvasContext = canvas.getContext("2d");

      if (!canvasContext) continue;

      const viewport = page.getViewport({ scale: 1 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const params = {
        canvas,
        canvasContext,
        viewport
      }

      await page.render(params).promise;
      const pageWrapper = renderedPages.get(i);
      const pageContainer = pageWrapper ? pageWrapper : document.createElement("div");


      canvas.setAttribute("id", `${i}`);

      pageContainer.setAttribute("style", `height: ${canvas.height}px; width: ${canvas.width}px`);
      pageContainer.style.height = `${canvas.height}px`;
      pageContainer.style.width = `${canvas.width}px`;
      pageContainer.append(canvas);

      if (pageWrapper === undefined) {
        //add page (html wrapper with page canvas) to map
        renderedPages.set(i, pageContainer);

        container.appendChild(pageContainer);
      }

      await yieldToBrowser();
    }

    unmountPages();

  }

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setFiles(e.currentTarget.files);
  }

  return (
    <div>
      <p>Upload a pdf</p>
      <input className="border border-white" type="file" onChange={(e) => uploadFile(e)} />
      <p>pages: {pageCount}</p>
      <p>scroll top: {scrollTopRef.current}</p>
      <div className="flex flex-col items-center" ref={containerRef} />
    </div>
  )
}

export default App

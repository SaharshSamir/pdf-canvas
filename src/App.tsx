import { useState, useEffect, useRef } from 'react'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist';

const PAGES_BUFFER = 2;


const renderedPages: Map<number, HTMLCanvasElement> = new Map();
function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visiblePagesRef = useRef<number>(0);
  const firstRenderedPageIdxRef = useRef<number>(1);
  const lastRenderedPageIdxRef = useRef<number>(1);
  /** maps the page number to the canvas element that renders the page */

  function yieldToBrowser() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    })
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {

      const doc = documentRef.current;
      if (!doc) return;

      const entry = entries[0];
      if (entry.isIntersecting) {

        firstRenderedPageIdxRef.current += PAGES_BUFFER;
        lastRenderedPageIdxRef.current += PAGES_BUFFER;

        unmountPages();

        observerRef.current?.unobserve(entry.target);
        renderNextPages(firstRenderedPageIdxRef.current, lastRenderedPageIdxRef.current);
      }
    })
  }, []);

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

      const pagesVisible = Math.ceil(viewportHeight / pageHeight);
      visiblePagesRef.current = pagesVisible;

      lastRenderedPageIdxRef.current = Math.min(pagesVisible + PAGES_BUFFER, doc.numPages);

      await renderNextPages(firstRenderedPageIdxRef.current, lastRenderedPageIdxRef.current); //initial load
    }

    load();

  }, [files]);

  function unmountPages() {

    renderedPages.forEach((canvas, pageNumber) => {
      if (pageNumber < firstRenderedPageIdxRef.current) {
        console.log('removing pages, ', pageNumber);
        canvas.remove();
        renderedPages.delete(pageNumber);
      }
    })
  }

  //this function will be for rendering the previous pages when scrolling up
  const renderPreviousPages = async () => { }

  //this function will be for rendering the next pages when scrolling down
  const renderNextPages = async (start: number, end: number) => {
    const doc = documentRef.current!;
    const container = containerRef.current!;
    // [start....end] window represents the range of pages to render

    if (start >= doc.numPages) return;

    //pages and the loop counter are both 1 indexed
    //load first x pages to render
    for (let i = start; i <= end; i++) {
      if (renderedPages.get(i)) continue;

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

      canvas.setAttribute("id", `${i}`);
      renderedPages.set(i, canvas);

      container.appendChild(canvas);

      if (i === end) {
        observerRef.current?.observe(canvas);
      }

      await yieldToBrowser();
    }


  }

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setFiles(e.currentTarget.files);
  }

  return (
    <div>
      <p>Upload a pdf</p>
      <input type="file" onChange={(e) => uploadFile(e)} />
      <p>pages: {pageCount}</p>
      <div ref={containerRef} />
    </div>
  )
}

export default App

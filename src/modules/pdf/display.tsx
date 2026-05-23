import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";

function yieldToBrowser() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  })
}

function unmountPages(renderedPagesmap: Map<number, HTMLDivElement>, start: number, end: number) {
  renderedPagesmap.forEach((pageWrapper, pageNumber) => {
    if (pageWrapper.hasChildNodes()) {
      if (pageNumber < start || pageNumber > end) {
        const canvas = pageWrapper.children[0] as HTMLCanvasElement;
        canvas.remove();
      }
    }
  })
}

export type RenderWindow = {
  start: number,
  end: number
}

// [start....end] window represents the range of pages to render
type Props = {
  renderWindow: RenderWindow,
  renderedPagesMap: Map<number, HTMLDivElement>,
  doc: PDFDocumentProxy | null,
  container: HTMLDivElement | null
}

export function useDisplayPages(props: Props) {
  const { renderWindow, renderedPagesMap, doc, container } = props;
  const [isInitialWindowMounted, setIsInitialWindowMounted] = useState<boolean>(false);

  useEffect(() => {
    const { start, end } = renderWindow;
    async function renderPages() {
      if (!doc) return;
      if (start >= doc.numPages) return;
      if (!container) return;

      //pages and the loop counter are both 1 indexed
      //load first x pages to render
      for (let i = start; i <= end; i++) {

        if (renderedPagesMap.get(i)?.hasChildNodes()) continue;

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
        const pageWrapper = renderedPagesMap.get(i);
        const pageContainer = pageWrapper ? pageWrapper : document.createElement("div");


        canvas.setAttribute("id", `${i}`);

        pageContainer.setAttribute("style", `height: ${canvas.height}px; width: ${canvas.width}px`);
        pageContainer.style.height = `${canvas.height}px`;
        pageContainer.style.width = `${canvas.width}px`;
        pageContainer.append(canvas);

        if (pageWrapper === undefined) {
          //add page (html wrapper with page canvas) to map
          renderedPagesMap.set(i, pageContainer);

          container.appendChild(pageContainer);
        }

        await yieldToBrowser();
      }

      unmountPages(renderedPagesMap, start, end);
    }
    renderPages();
    if (start === 1) {
      setIsInitialWindowMounted(true);
    }

  }, [renderWindow]);

  return { isInitialWindowMounted };
}

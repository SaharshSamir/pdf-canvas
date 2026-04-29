import { useState, useEffect, useRef } from 'react'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist';

function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function yeildToBrowser() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    })
  }

  useEffect(() => {
    if (files && files.length > 0) {
      files[0].arrayBuffer().then(file => {
        const docLoadingTask = pdfjsLib.getDocument({ data: file });
        docLoadingTask.promise.then(async (doc) => {
          setPageCount(doc.numPages);
          const container = containerRef.current!;
          container.innerHTML = "";

          let renderParams = [];

          for (let i = 0; i < doc.numPages; i++) {
            const page = await doc.getPage(i + 1);
            const canvas = document.createElement("canvas");
            const canvasContext = canvas.getContext("2d");
            if (!canvasContext) continue;
            const viewport = page.getViewport({ scale: 1.5 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            renderParams.push({
              canvas,
              canvasContext,
              viewport: page.getViewport({ scale: 1.4 })
            });


            if (renderParams.length === 3) {
              renderParams.forEach(async param => {
                await page.render(param).promise;
              })

              renderParams = [];

            }

            container.appendChild(canvas);

            yeildToBrowser();
          }
        })

      });
    }

  }, [files]);

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

import { useEffect, useRef, useState } from "react";
import UIOverlay from "./modules/UIOverlay"
import Workspace from "./modules/Workspace"
import * as pdfjsLib from 'pdfjs-dist';
import type { DocMeta } from "./types";


function useUploadDoc(file: File | null): DocMeta {
  const [pageCount, setPageCount] = useState<number>(0);

  const documentRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageHeightRef = useRef<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!file) return;
      const fileBuffer = await file.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

      documentRef.current = doc;

      const pageHeight = (await doc.getPage(1)).getViewport({ scale: 1 }).height;

      pageHeightRef.current = pageHeight;

      setPageCount(doc.numPages);
    }
    load();
  }, [file]);

  if (file === null) {
    return {
      doc: null,
      pageHeight: 0,
      pageCount: 0
    }
  }

  return {
    doc: documentRef.current,
    pageHeight: pageHeightRef.current,
    pageCount,
  }
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const docMeta = useUploadDoc(file);

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      console.log("keydown", e.shiftKey);
      if (e.shiftKey) {
        setIsDragging(true);
      }
    })
    document.addEventListener("keyup", (e) => {
      console.log("keyup", e.shiftKey);
      setIsDragging(false);
    })
  }, []);

  return (
    <div className="w-screen h-screen bg-zinc-800">
      <Workspace docMeta={docMeta} isDragging={isDragging} />
      <UIOverlay setFile={setFile} />
    </div>
  )
}

export default App


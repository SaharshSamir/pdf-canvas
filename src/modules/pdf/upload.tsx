import { useRef, useEffect, useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';

export function useUploadDoc(file: File | null) {

  const [pageCount, setPageCount] = useState<number>(0);

  const documentRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageHeightRef = useRef<number>(0);
  const pageWidthRef = useRef<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!file) return;
      const fileBuffer = await file.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

      documentRef.current = doc;

      const pageViewport = (await doc.getPage(1)).getViewport({ scale: 1 });
      const pageHeight = pageViewport.height;
      const pageWidth = pageViewport.width;

      pageHeightRef.current = pageHeight;
      pageWidthRef.current = pageHeight;

      setPageCount(doc.numPages);
    }
    load();
  }, [file]);

  if (file === null) {
    return {
      doc: null,
      pageHeight: 0,
      pageWidth: 0,
      pageCount: 0
    }
  }

  return {
    doc: documentRef.current,
    pageHeight: pageHeightRef.current,
    pageWidth: pageWidthRef.current,
    pageCount,
  }
}

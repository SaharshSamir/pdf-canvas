import { useState, useEffect, useRef } from 'react'
import '../../App.css'
import { useUploadDoc } from './upload';


const renderedPagesMap: Map<number, HTMLDivElement> = new Map();

export function usePdf() {
  const [file, setFile] = useState<File | null>(null);

  //get doc metadata
  const { doc, pageCount, pageHeight, pageWidth } = useUploadDoc(file);

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    setFile(files[0]);
  }

  return {
    pageCount,
    uploadFile,
    doc,
    pageHeight,
    pageWidth
  }
}


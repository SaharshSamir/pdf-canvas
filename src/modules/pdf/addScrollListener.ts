import type { RenderWindow } from "./display";
import { computeVisiblePage, computeRenderWindow } from "./virtualization";

export default function addScrollListener(
  pageHeight: number,
  totalPages: number,
  currentVisiblePageRef: React.RefObject<number>,
  visiblePages: number,
  setRenderWindow: React.Dispatch<React.SetStateAction<RenderWindow>>
) {
  window.addEventListener('scroll', () => {
    const visiblePage = computeVisiblePage(pageHeight);

    if (visiblePage !== currentVisiblePageRef.current) {
      currentVisiblePageRef.current = visiblePage;
      const renderWindow = computeRenderWindow(visiblePages, totalPages, visiblePage);
      setRenderWindow(renderWindow);

    }
  })
}

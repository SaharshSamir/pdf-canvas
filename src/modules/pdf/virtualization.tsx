
const PAGES_BUFFER = 2;
const scrollYBuffer = 50;

/** returns the index of the current visible page in the viewport (if > 1 pages are visible in the viewport, returns the index of the first one)
 * @param {number} pageHeight - height of each page
 */
export function computeVisiblePage(pageHeight: number) {
  return Math.ceil((window.scrollY + scrollYBuffer) / pageHeight);

}

/** returns the range of pages that are supposed to be rendered at a given moment
 * @param {number} visiblePages - number of pages visible in the viewport
 * @param {number} pageCount - number of pages in the pdf
 * @param {number} currentVisiblePage - (first) page that's visible in the viewport */
export function computeRenderWindow(visiblePages: number, pageCount: number, currentVisiblePage: number) {
  const start = Math.max(currentVisiblePage - PAGES_BUFFER, 1);
  return {
    start,
    end: Math.min(start + visiblePages + PAGES_BUFFER, pageCount),//might break, not sure. 
    currentVisiblePage: currentVisiblePage
  }
}


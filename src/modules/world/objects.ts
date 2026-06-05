import { randomIdGenerator } from "../../utils";
import type { Coord, EntityStore, Entity } from "../../types";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

export const entities: EntityStore = new Map();


export function createEntity(x: number, y: number, height: number, width: number, container: HTMLDivElement): Entity {
  const id = randomIdGenerator();
  const entity: Entity = {
    id,
    worldCoord: { x: x, y: y },
    height,
    width,
    type: "cube",
    isRendered: false,
    container
  }
  return entity;
}

function randomizeSign() {
  const int = Math.floor(Math.random() * 10);
  if (int % 2 === 0) return -1;
  return 1;
}

export function makeRandomSquares(
) {
  const squareColors = ["red", "blue", "green", "yellow", "pink", "violet"];

  const numberOfCubes = 15;

  for (let i = 0; i < numberOfCubes; ++i) {
    const container = document.createElement("div");
    const square = document.createElement("div");
    container.style.height = "20px";
    container.style.width = "20px";
    square.style.height = "20px";
    square.style.width = "20px";
    square.style.backgroundColor = squareColors[Math.floor((Math.random() * 10) % squareColors.length)];
    container.style.position = "absolute"
    container.append(square);

    const worldX = Math.floor(Math.random() * 1500) * randomizeSign();
    const worldY = Math.floor(Math.random() * 1500) * randomizeSign();
    const entity = createEntity(worldX, worldY, 20, 20, container);

    entities.set(entity.id, entity);
  }


  const container = document.createElement("div");
  const square = document.createElement("div");
  container.style.height = "20px";
  container.style.width = "20px";
  square.style.height = "20px";
  square.style.width = "20px";
  square.style.backgroundColor = squareColors[Math.floor((Math.random() * 10) % squareColors.length)];
  container.style.position = "absolute"
  container.append(square);

  const worldX = 50;
  const worldY = 50;
  const entity = createEntity(worldX, worldY, 20, 20, container);

  entities.set(entity.id, entity);

}

export async function createPageEntities(doc: PDFDocumentProxy, pageHeight: number, pageWidth: number) {
  const totalPages = doc?.numPages || 0;
  const distanceBetweenPages = 10;

  for (let i = 0; i < totalPages; ++i) {
    const page = await doc.getPage(i + 1);
    console.log('page: ', page);
    const y = (pageHeight + distanceBetweenPages) * i;
    const pagetity: Entity = {
      id: randomIdGenerator(),
      height: pageHeight,
      isRendered: false,
      width: pageWidth,
      worldCoord: { x: 0, y },
      type: "page",
      page
    }
    entities.set(pagetity.id, pagetity);
  }
}

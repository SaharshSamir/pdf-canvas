import { type PDFPageProxy, type PDFDocumentProxy } from "pdfjs-dist";

export type Coord = {
  x: number;
  y: number
}

export type EntityStore = Map<string, Entity>;

export interface BaseEntity {
  id: string;
  worldCoord: Coord;
  height: number;
  width: number
  isRendered: boolean;
}

export interface PageEntity extends BaseEntity {
  type: "page",
  pageCanvas: HTMLCanvasElement
}

export interface CubeEntity extends BaseEntity {
  type: "cube",
  fillColor: string;
}

export type Entity = CubeEntity | PageEntity;


export type DocMeta = {
  doc: PDFDocumentProxy | null;
  pageHeight: number;
  pageCount: number;
}

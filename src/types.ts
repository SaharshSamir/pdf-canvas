import { type PDFPageProxy } from "pdfjs-dist";

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
  container?: HTMLDivElement;
}

export interface PageEntity extends BaseEntity {
  type: "page",
  page: PDFPageProxy
}

export interface CubeEntity extends BaseEntity {
  type: "cube",
}

export type Entity = CubeEntity | PageEntity;

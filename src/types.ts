import { type PDFDocumentProxy } from "pdfjs-dist";
import type { RefObject } from "react";

export type Coord = {
  x: number;
  y: number
}

export type Camera = {
  x: number;
  y: number;
  zoom: number
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

export interface TextEntity extends BaseEntity {
  type: "text",
  fillColor: string;
  text: string;
  isEditing: boolean;
  fontSize?: number;
  inputSize?: number;
}

export type Entity = CubeEntity | PageEntity | TextEntity;


export type DocMeta = {
  doc: PDFDocumentProxy | null;
  pageHeight: number;
  pageCount: number;
}


export type DraggableEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent> | WheelEvent;

export type Tools = "text" | "drag" | "square" | "circle" | "selection";

export type SelectedEntities = Set<string>;

//Editor
export type EditorContext = {
  mouseWorldPosRef: RefObject<Coord>,
  mouseCanvasPosRef: RefObject<Coord>
  activeTool: Tools,
  selectedEntities: SelectedEntities,
  hoveredEntityIdRef: RefObject<string>,
  addToSelectedEntities: (ids: string[]) => void,
  removeFromSelectedEntities: (id: string) => void,
}

export type DragArea = {
  origin: Coord,
  end: Coord
}

export type DragType = "Entity" | "Rubberband" | undefined;
export type DragState = {
  dragOrigin: Coord,
  isDragging: DragType,
  dragEntityStartWorldCoord: Coord | null,
  draggingEntityId: string | null
}

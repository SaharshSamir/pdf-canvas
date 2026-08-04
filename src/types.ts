import { type PDFDocumentProxy } from "pdfjs-dist";
import type { RefObject } from "react";
import type { World } from "./modules/Workspace/world/world";

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

// "text" | "drag" | "square" | "circle" | "selection";
export type Tools = "text" | "square" | "selection";

export type SelectedEntities = Set<string>;

//Editor
export type EditorContext = {
  activeTool: Tools,
  canvasCtx: CanvasRenderingContext2D,
  world: World,

  mouseWorldPosRef: RefObject<Coord>,
  mouseCanvasPosRef: RefObject<Coord>

  selectedEntities: SelectedEntities,
  addToSelectedEntities: (ids: string[]) => void,
  removeFromSelectedEntities: (id: string) => void,

  hoveredEntityIdRef: RefObject<string>,
  currentEditingTextId: RefObject<string>,
  setEditing: (isEditing: boolean) => void,
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

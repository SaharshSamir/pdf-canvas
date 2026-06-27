//Application state
import { create } from "zustand"
import { type Camera, type Coord, type Entity, type Tools } from "../../types"
import { randomIdGenerator } from "../../utils"
import { useRef, type RefObject } from "react"
import { render } from "../Workspace/render"

interface AppStore {
  isEditing: boolean,
  entityStore: Map<string, Entity>,
  activeTool: Tools,
  canvasCtx: CanvasRenderingContext2D | null,
  camera: Camera,
  //methods
  addEntity: (entity: Entity) => string,
  setActiveTool: (tool: Tools) => void,
  updateCamera: (newCoord: Camera) => void,
  clearEntities: () => void,
}

export const useAppState = create<AppStore>()((set, _get) => ({
  activeTool: "drag",
  canvasCtx: null,
  camera: { x: 0, y: 0, zoom: 1 },
  isEditing: false,
  entityStore: new Map<string, Entity>(),
  setEditing: (isEditing: boolean) => set({ isEditing }),
  addEntity: (entity) => {
    const id = randomIdGenerator();
    set((state) => {
      entity.id = id;
      state.entityStore.set(entity.id, entity);
      return state
    });
    return id;
  },
  setActiveTool: (tool) => set({ activeTool: tool }),
  updateCamera: (newCoords) => set({ camera: newCoords }),
  clearEntities: () => set((s) => {
    s.entityStore.clear();
    if (s.canvasCtx) {
      render(s.entityStore, s.canvasCtx, s.camera)
    }
    return {
      entityStore: s.entityStore
    }
  })
}))

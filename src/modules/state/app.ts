//Application state
import { create } from "zustand"
import { type Tools } from "../../types"

interface AppStore {
  isEditing: boolean,
  activeTool: Tools,
  canvasCtx: CanvasRenderingContext2D | null,
  selectedEntities: Set<string>,
  //methods
  setEditing: (isEdting: boolean) => void,
  setActiveTool: (tool: Tools) => void,
  addToSelectedEntities: (id: string) => void,
  removeFromSelectedEntities: (id: string) => void,
}

export const useAppState = create<AppStore>()((set, _get) => ({
  activeTool: "selection",
  canvasCtx: null,
  isEditing: false,
  selectedEntities: new Set(),
  setEditing: (isEditing: boolean) => set({ isEditing }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  addToSelectedEntities: (id) => {
    set((s) => {
      s.selectedEntities.add(id);
      return s;
    })
  },
  removeFromSelectedEntities: (id) => {
    set(s => {
      s.selectedEntities.delete(id);
      return s;
    })
  }
} satisfies AppStore))

//Application state
import { create } from "zustand"
import { type SelectedEntities, type Tools } from "../../types"


interface AppStore {
  isEditing: boolean,
  activeTool: Tools,
  canvasCtx: CanvasRenderingContext2D | null,
  selectedEntities: SelectedEntities,
  //methods
  setEditing: (isEdting: boolean) => void,
  setActiveTool: (tool: Tools) => void,
  addToSelectedEntities: (ids: string[]) => void,
  removeFromSelectedEntities: (id: string) => void,
}

export const useAppState = create<AppStore>()((set, _get) => ({
  activeTool: "selection",
  canvasCtx: null,
  isEditing: false,
  selectedEntities: new Set(),
  setEditing: (isEditing: boolean) => set({ isEditing }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  addToSelectedEntities: (ids) => {
    set((s) => {
      ids.forEach((id) => s.selectedEntities.add(id));
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

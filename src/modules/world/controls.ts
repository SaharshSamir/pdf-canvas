import { useEffect, type RefObject } from "react";
import type { Entity, Coord } from "../../types";



//Camera stuff
//@TODO: its not actually "world". It's just a projection layer (render area)
export function centerWorldToCamera(world: HTMLDivElement) {
  const viewport = world.parentElement;
  if (viewport) {
    world.style.transform =
      `translate(${-((world.clientHeight / 2) - (viewport.clientHeight / 2))}px, ${-((world.clientWidth / 2) - (viewport.clientWidth / 2))}px)`;
  }
}


export function useInitControls(worldRef: RefObject<HTMLDivElement | null>, setCameraCoord: React.Dispatch<React.SetStateAction<Coord>>) {
  let isDragging = false;
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    world.addEventListener("mousedown", () => { isDragging = true })
    world.addEventListener("mousemove", (e) => {
      if (isDragging) {
        setCameraCoord((cc) => {
          return {
            x: cc.x - e.movementX,
            y: cc.y - e.movementY
          }
        })
      }
    });
    world.addEventListener("mouseup", () => { isDragging = false });

  }, []);
}

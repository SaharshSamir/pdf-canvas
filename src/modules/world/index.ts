import { createEntity, type Entity } from "./objects";

export type Coord = {
  x: number;
  y: number
}


//Camera stuff
//@TODO: its not actually "world". It's just a projection layer (render area)
export function centerWorldToCamera(world: HTMLDivElement) {
  const viewport = world.parentElement;
  if (viewport) {
    world.style.transform =
      `translate(${-((world.clientHeight / 2) - (viewport.clientHeight / 2))}px, ${-((world.clientWidth / 2) - (viewport.clientWidth / 2))}px)`;
  }
}


export function useInitControls() { }

import { createEntity } from "../utils";
import type { Coord } from "../../../types";

export function drawSquare(worldCoord: Coord) {

  const entity = createEntity({
    id: "",
    type: "cube",
    worldCoord: { x: 0, y: 0 },
    height: 10,
    width: 10,
    fillColor: "rgb(200, 20, 50)",
    isRendered: true
  })

  entity.worldCoord = worldCoord;

}

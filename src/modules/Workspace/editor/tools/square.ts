import type { Strategy } from "../types";

export function square(): Strategy {

  return {
    onMouseDown(ctx) {
      const coord = { ...ctx.mouseWorldPosRef.current };
      ctx.world.addEntity({
        id: "",
        type: "cube",
        worldCoord: coord,
        height: 100,
        width: 100,
        fillColor: "rgb(200, 20, 50)",
        isRendered: true
      })
    },
    onMouseMove(){},
    onMouseUp(){}
  }
}

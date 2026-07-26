import type { Coord, DragState, EditorContext, Tools } from "../../../types"
import type { World } from "../world/world"
import { addText, editText } from "../tools/text"
import { render } from "../render/render"
import type { RefObject } from "react"

type Something = {
  mouseWorldCoord: Coord
  activeTool: Tools,
  world: World,
  currentEditingTextId: RefObject<string>,
  setEditing: (isEditing: boolean) => void,
  ctx: CanvasRenderingContext2D
}

export function addEntity(props: Something) {
  const { activeTool, mouseWorldCoord, world, setEditing, currentEditingTextId, ctx } = props;
  switch (activeTool) {
    case "square":
    world.addEntity({
      id: "",
      type: "cube",
      worldCoord: mouseWorldCoord,
      height: 100,
      width: 100,
      fillColor: "rgb(200, 20, 50)",
      isRendered: true
    })

    break;
    case "text":
    if (currentEditingTextId.current !== "") {
      break;
    }
    currentEditingTextId.current = addText(mouseWorldCoord, world.addEntity)
    setEditing(true);
    editText(
      mouseWorldCoord,
      props.currentEditingTextId,
      world,
      ctx,
      setEditing
    );
    break;
    default:
    console.log('chill');

  }
  render(world, ctx);
}

//Decide what to do on mouse down, based on active tool
type ActionContext = {
  editorCtx: EditorContext,
  world: World,
  dragState: DragState,
  mouseAction?: "up" | "down"
}
export function handleToolAction(ctx: ActionContext) {

}

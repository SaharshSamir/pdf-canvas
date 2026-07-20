import type { Coord, TextEntity, Entity } from "../../../types";
import type { RefObject } from "react";
import { render } from "../render";
import type { World } from "../world";
import { worldToCanvas } from "../../../utils";

export function addText(
  worldCoord: Coord,
  addEntity: (entity: Entity) => string,
  text?: string
): string {
  const entity_id = addEntity({
    id: "",
    type: "text",
    fillColor: "rgb(255,255,255)",
    worldCoord,
    height: 60,
    width: 200,
    isRendered: false,
    text: text || "",
    isEditing: true,
    fontSize: 30,
  })

  return entity_id;

}

function measureTextEntity(entity: TextEntity, ctx: CanvasRenderingContext2D) {
  ctx.font = `${entity.fontSize}px Arial`;
  const measure = ctx.measureText(entity.text);
  const lineHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
  entity.width = measure.width;
  entity.height = lineHeight * 1.2;
}

export function editText(
  coord: Coord,
  textEntityId: string,
  currentEditingTextId: RefObject<string>,
  world: World,
  ctx: CanvasRenderingContext2D,
  setEditing: (isEditing: boolean) => void
) {

  const overlay = document.getElementById("UI-overlay");
  if (!overlay) {
    return;
  }

  const entity = world.entityStore.get(textEntityId) as TextEntity;
  if (!entity) {
    throw new Error(`No text entity with id ${textEntityId} found`);
  }

  const screenCoords = worldToCanvas(coord, ctx, world.camera);

  const textarea = document.createElement("textarea");
  textarea.setAttribute("id", "text-input");
  textarea.style.height = `${entity.height}px`;
  textarea.style.width = `${entity.width}px`;
  textarea.style.position = 'absolute';
  textarea.style.top = '0px';
  textarea.style.left = '0px';
  textarea.style.backgroundColor = "transparent";
  textarea.style.color = "white";
  textarea.style.transform = `translate(${screenCoords.x}px, ${screenCoords.y}px)`;
  textarea.style.font = `${entity.fontSize}px Arial`;
  //textarea.style.border = "1px dashed #82cbf5";


  overlay.appendChild(textarea);
  setTimeout(() => {
    textarea.focus();
  }, 0);

  textarea.addEventListener("input", (e) => {
    entity.text = textarea.value;
    //render(entityStore, ctx, camera);
  });

  const confirmText = () => {
    entity.isEditing = false;
    textarea?.remove();
    currentEditingTextId.current = "";
    setEditing(false);
    const textEntity = world.entityStore.get(textEntityId);

    if (!textEntity) throw new Error(`No text entity with id , ${textEntityId}, found`);
    measureTextEntity(textEntity as TextEntity, ctx)

    render(world, ctx);
  }

  textarea.addEventListener("keydown", (e) => {
    if (e.code === "Enter" || e.code === "Escape") {
      confirmText();
    }
  });

  textarea.addEventListener("blur", (_) => {
    confirmText();
  })


}

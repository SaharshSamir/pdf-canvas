import type { Coord, Camera, TextEntity, Entity, EntityStore } from "../../../types";
import type { RefObject } from "react";
import { render } from "../render";

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

export function editText(
  screenCoords: Coord,
  entity: TextEntity,
  currentEditingTextId: RefObject<string>,
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  entityStore: EntityStore,
  setEditing: (isEditing: boolean) => void
) {

  const overlay = document.getElementById("UI-overlay");
  if (!overlay) {
    return;
  }

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
    textarea.remove();
    currentEditingTextId.current = "";
    setEditing(false);
    render(entityStore, ctx, camera);
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

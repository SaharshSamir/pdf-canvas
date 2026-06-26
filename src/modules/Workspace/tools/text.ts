import { createEntity } from "../utils";
import type { Coord, Camera, EntityStore, TextEntity } from "../../../types";
import type { RefObject } from "react";
import { entityStore } from "../utils";
import { render } from "../render";

export function addText(worldCoord: Coord, screenCoords: Coord): string {

  const entity = createEntity({
    id: "",
    type: "text",
    fillColor: "rgb(255,255,255)",
    worldCoord,
    height: 30,
    width: 100,
    isRendered: false,
    text: "",
    isEditing: true,
  })

  return entity.id;

}

export function editText(
  screenCoords: Coord,
  entity: TextEntity,
  currentEditingTextId: RefObject<string>,
  ctx: CanvasRenderingContext2D,
  camera: Camera
) {

  const overlay = document.getElementById("UI-overlay");
  if (!overlay) {
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.style.height = `${entity.height}`;
  textarea.style.width = `${entity.width}`;
  textarea.style.position = 'absolute';
  textarea.style.top = '0px';
  textarea.style.left = '0px';
  textarea.style.backgroundColor = "transparent";
  textarea.style.color = "white";

  textarea.style.transform = `translate(${screenCoords.x}px, ${screenCoords.y}px)`;
  //textarea.style.display = "none";

  overlay.appendChild(textarea);
  setTimeout(() => {
    textarea.focus();
  }, 0);

  textarea.addEventListener("input", (e) => {
    entity.text = textarea.value;
    //render(entityStore, ctx, camera);
  });

  textarea.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
      console.log('pressed enter');
      entity.isEditing = false;
      textarea.remove();
      currentEditingTextId.current = "";
      render(entityStore, ctx, camera);
    }
  });

}

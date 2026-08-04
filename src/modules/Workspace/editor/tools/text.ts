import type { Coord, TextEntity } from "../../../../types";
import type { RefObject } from "react";
import { render } from "../../render/render";
import type { World } from "../../world/world";
import { worldToCanvas } from "../../../../utils";
import type { Strategy } from "../types";

function measureTextEntity(entity: TextEntity, ctx: CanvasRenderingContext2D) {
  ctx.font = `${entity.fontSize}px Arial`;
  const measure = ctx.measureText(entity.text);
  const lineHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
  entity.width = measure.width;
  entity.height = lineHeight * 1.2;
}

function editText(
  coord: Coord,
  currentEditingTextId: RefObject<string>,
  world: World,
  ctx: CanvasRenderingContext2D,
  setEditing: (isEditing: boolean) => void
) {

  const textEntityId = currentEditingTextId.current;
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


  overlay.appendChild(textarea);
  setTimeout(() => {
    textarea.focus();
  }, 0);

  textarea.addEventListener("input", (_) => {
    entity.text = textarea.value;
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

export function text(): Strategy {
  return {
    onMouseDown(ctx) {
      if (ctx.currentEditingTextId.current !== "") {
        return;
      }
      const mouseWorldCoord = { ...ctx.mouseWorldPosRef.current };
      ctx.currentEditingTextId.current = ctx.world.addEntity({
        id: "",
        type: "text",
        fillColor: "rgb(255,255,255)",
        worldCoord: mouseWorldCoord,
        height: 60,
        width: 200,
        isRendered: false,
        text: "",
        isEditing: true,
        fontSize: 30,
      })
      ctx.setEditing(true);
      editText(
        mouseWorldCoord,
        ctx.currentEditingTextId,
        ctx.world,
        ctx.canvasCtx,
        ctx.setEditing
      );
    },
    onMouseMove() { },
    onMouseUp() { },
  }
}

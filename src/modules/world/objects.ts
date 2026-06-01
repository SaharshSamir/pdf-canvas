import { randomIdGenerator } from "../../utils";
import type { Coord } from "./controls";

export type EntityStore = Map<string, Entity>;
export const entities: EntityStore = new Map();

export type Entity = {
  id: string;
  worldCoord: Coord;
  height: number;
  width: number
  isRendered: boolean;
  container?: HTMLDivElement;
  type?: "cube" | "page" | "text";
}

export function createEntity(x: number, y: number, height: number, width: number, container: HTMLDivElement): Entity {
  const id = randomIdGenerator();
  const entity: Entity = {
    id,
    worldCoord: { x: x, y: y },
    height,
    width,
    type: "cube",
    isRendered: false,
    container
  }
  return entity;
}

function randomizeSign() {
  const int = Math.floor(Math.random() * 10);
  if (int % 2 === 0) return -1;
  return 1;
}

export function makeRandomSquares(
) {
  const squareColors = ["red", "blue", "green", "yellow", "pink", "violet"];

  const numberOfCubes = 15;

  for (let i = 0; i < numberOfCubes; ++i) {
    const container = document.createElement("div");
    const square = document.createElement("div");
    container.style.height = "20px";
    container.style.width = "20px";
    square.style.height = "20px";
    square.style.width = "20px";
    square.style.backgroundColor = squareColors[Math.floor((Math.random() * 10) % squareColors.length)];
    container.style.position = "absolute"
    container.append(square);

    const worldX = Math.floor(Math.random() * 1500) * randomizeSign();
    const worldY = Math.floor(Math.random() * 1500) * randomizeSign();
    const entity = createEntity(worldX, worldY, 20, 20, container);

    entities.set(entity.id, entity);
  }


  const container = document.createElement("div");
  const square = document.createElement("div");
  container.style.height = "20px";
  container.style.width = "20px";
  square.style.height = "20px";
  square.style.width = "20px";
  square.style.backgroundColor = squareColors[Math.floor((Math.random() * 10) % squareColors.length)];
  container.style.position = "absolute"
  container.append(square);

  const worldX = 50;
  const worldY = 50;
  const entity = createEntity(worldX, worldY, 20, 20, container);

  entities.set(entity.id, entity);

}

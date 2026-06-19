import { randomIdGenerator } from "../../utils";
import type { Entity } from "../../types";

type EntityStore = Map<string, Entity>;

export const entityStore: EntityStore = new Map<string, Entity>();


export function createEntity(entity: Entity) {
  entity.id = randomIdGenerator();
  entityStore.set(entity.id, entity);
  return entity;
}

import type { StepWorldResponse, World } from '@tilefolk/shared';
import { createWorld } from './worldGenerator.js';
import { stepWorld } from './stepWorld.js';

let activeWorld: World | null = null;

export function getActiveWorld(): World {
  if (!activeWorld) {
    activeWorld = createWorld();
  }
  return activeWorld;
}

export function resetWorld(): World {
  activeWorld = createWorld();
  return activeWorld;
}

export async function stepActiveWorld(): Promise<StepWorldResponse> {
  activeWorld = getActiveWorld();

  const response = await stepWorld(activeWorld);

  activeWorld = response.world;
  return response;
}

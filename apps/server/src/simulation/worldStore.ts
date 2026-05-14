import type { World } from '@tilefolk/shared';
import { createWorld } from './worldGenerator.js';

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

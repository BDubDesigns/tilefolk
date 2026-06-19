import { NEEDS_MAX_VALUES, type World } from '@tilefolk/shared';
const HUNGER_INCREMENT = 1;
export function applyRoundTicks(world: World): void {
  for (const npc of world.npcs) {
    npc.needs.hunger = Math.min(npc.needs.hunger + HUNGER_INCREMENT, NEEDS_MAX_VALUES.hunger);
  }
}

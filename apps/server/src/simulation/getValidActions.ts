import type { World, NpcId, NpcAction } from '@tilefolk/shared';
import { getValidMovementActions } from './getValidMovementActions.js';
import { getValidPickupActions } from './getValidPickupActions.js';
import { getValidChopTreeActions } from './getValidChopTreeActions.js';

interface GetValidActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidActions({ world, npcId }: GetValidActionsOptions): NpcAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);

  if (!npc) {
    return [];
  }

  const pickupActions = getValidPickupActions({ world, npcId });
  const chopTreeActions = getValidChopTreeActions({ world, npcId });
  const movementActions = getValidMovementActions({ world, npcId });
  const waitAction: NpcAction = { type: 'wait', npcId };

  return [...pickupActions, ...chopTreeActions, ...movementActions, waitAction];
}

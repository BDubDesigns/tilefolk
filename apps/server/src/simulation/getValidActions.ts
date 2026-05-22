import type { World, NpcId, NpcAction } from '@tilefolk/shared';
import { getValidMovementActions } from './getValidMovementActions.js';
import { getValidPickupActions } from './getValidPickupActions.js';

interface GetValidActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidActions({ world, npcId }: GetValidActionsOptions): NpcAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);

  if (!npc) {
    return [];
  }

  const movementActions = getValidMovementActions({ world, npcId });
  const pickupActions = getValidPickupActions({ world, npcId });
  const waitAction: NpcAction = { type: 'wait', npcId };

  return [...pickupActions, ...movementActions, waitAction];
}

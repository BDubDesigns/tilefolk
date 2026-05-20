import type { World, NpcId, NpcAction } from '@tilefolk/shared';
import { getValidMovementActions } from './getValidMovementActions.js';

interface GetValidActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidActions({ world, npcId }: GetValidActionsOptions): NpcAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);

  if (!npc) {
    return [];
  }

  // get valid movement actions
  const movementActions = getValidMovementActions({ world, npcId });
  // add wait action
  const waitAction: NpcAction = { type: 'wait', npcId };

  return [...movementActions, waitAction];
}

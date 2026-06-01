import {
  isPositionInSquareRadius,
  type NpcId,
  type PickupAction,
  type World,
} from '@tilefolk/shared';

interface GetValidPickupActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidPickupActions({
  world,
  npcId,
}: GetValidPickupActionsOptions): PickupAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);

  // If the NPC is not found, return an empty array
  if (!npc) return [];

  const items = world.items;
  const validActions: PickupAction[] = [];

  for (const item of items) {
    if (item.location.type === 'ground') {
      if (isPositionInSquareRadius(npc.position, item.location.position, 1)) {
        validActions.push({ type: 'pickup', npcId, itemId: item.id });
      }
    }
  }

  return validActions;
}

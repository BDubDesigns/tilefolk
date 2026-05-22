import type { NpcId, PickupAction, World } from '@tilefolk/shared';

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
      // Calculate the distance between the NPC and the item using absolute values
      const distanceX = Math.abs(item.location.position.x - npc.position.x);
      const distanceY = Math.abs(item.location.position.y - npc.position.y);

      // If the distance is within 1 unit in both X and Y directions, add the item to the valid actions
      if (distanceX <= 1 && distanceY <= 1) {
        validActions.push({ type: 'pickup', npcId, itemId: item.id });
      }
    }
  }

  return validActions;
}

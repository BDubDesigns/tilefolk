import {
  isPositionInSquareRadius,
  type NpcId,
  type World,
  type CarefullyPickBerryAction,
} from '@tilefolk/shared';

interface GetValidCarefullyPickBerryActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidCarefullyPickBerryActions({
  world,
  npcId,
}: GetValidCarefullyPickBerryActionsOptions): CarefullyPickBerryAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);
  if (!npc) return [];

  return world.bushes
    .filter((bush) => {
      const isSamePosition =
        bush.position.x === npc.position.x && bush.position.y === npc.position.y;
      return (
        !isSamePosition &&
        isPositionInSquareRadius(npc.position, bush.position, 1) &&
        bush.type === 'berry' &&
        bush.berries > 0
      );
    })
    .map((bush) => ({
      type: 'carefullyPickBerry',
      npcId,
      berryBushId: bush.id,
    }));
}

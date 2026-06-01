import {
  isPositionInSquareRadius,
  type NpcId,
  type World,
  type ChopTreeAction,
} from '@tilefolk/shared';

interface GetValidChopTreeActionsOptions {
  world: World;
  npcId: NpcId;
}

export function getValidChopTreeActions({
  world,
  npcId,
}: GetValidChopTreeActionsOptions): ChopTreeAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);
  if (!npc) return [];
  const npcHasAxe = world.items.some(
    (item) =>
      item.location.type === 'inventory' && item.location.npcId === npcId && item.type === 'axe',
  );
  if (!npcHasAxe) return [];

  return world.trees
    .filter((tree) => {
      const isSamePosition =
        tree.position.x === npc.position.x && tree.position.y === npc.position.y;
      return !isSamePosition && isPositionInSquareRadius(npc.position, tree.position, 1);
    })
    .map((tree) => ({
      type: 'chopTree',
      npcId,
      treeId: tree.id,
    }));
}

import type { Item, Npc, Position, Tree, World } from '@tilefolk/shared';

interface GetVisibleWorldContextOptions {
  world: World;
  npc: Npc;
  radius?: number;
}

export interface VisibleWorldContext {
  radius: number;
  center: Position;
  nearbyNpcs: Npc[];
  nearbyTrees: Tree[];
  nearbyGroundItems: Item[];
}

function isPositionVisible(center: Position, candidatePosition: Position, radius: number): boolean {
  const xDist = Math.abs(center.x - candidatePosition.x);
  const yDist = Math.abs(center.y - candidatePosition.y);
  return xDist <= radius && yDist <= radius;
}

export function getVisibleWorldContext({
  world,
  npc,
  radius = 3,
}: GetVisibleWorldContextOptions): VisibleWorldContext {
  const center = npc.position;

  const nearbyNpcs = world.npcs.filter((candidateNpc) => {
    // exclude the npc itself
    if (npc.id === candidateNpc.id) return false;
    return isPositionVisible(center, candidateNpc.position, radius);
  });

  const nearbyTrees = world.trees.filter((candidateTree) => {
    return isPositionVisible(center, candidateTree.position, radius);
  });

  const nearbyGroundItems = world.items.filter((candidateGroundItem) => {
    if (candidateGroundItem.location.type !== 'ground') return false;
    return isPositionVisible(center, candidateGroundItem.location.position, radius);
  });

  return {
    radius,
    center: npc.position,
    nearbyNpcs,
    nearbyTrees,
    nearbyGroundItems,
  };
}

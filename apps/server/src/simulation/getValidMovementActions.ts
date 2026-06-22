import { directions } from '@tilefolk/shared';
import { directionDeltas } from './directionDeltas.js';

import type { MoveAction, NpcId, Position, World } from '@tilefolk/shared';

interface GetValidMovementActionsOptions {
  world: World;
  npcId: NpcId;
}

// helper function
function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function getValidMovementActions({
  world,
  npcId,
}: GetValidMovementActionsOptions): MoveAction[] {
  const npc = world.npcs.find((npc) => npc.id === npcId);
  if (!npc) {
    return [];
  }

  const blockedPositions = new Set<string>();

  for (const item of world.items) {
    if (item.location.type === 'ground') {
      blockedPositions.add(positionKey(item.location.position));
    }
  }

  for (const tree of world.trees) {
    blockedPositions.add(positionKey(tree.position));
  }

  for (const bush of world.bushes) {
    blockedPositions.add(positionKey(bush.position));
  }

  for (const otherNpc of world.npcs) {
    if (otherNpc.id !== npcId) {
      blockedPositions.add(positionKey(otherNpc.position));
    }
  }

  const validActions: MoveAction[] = [];

  for (const direction of directions) {
    const delta = directionDeltas[direction];

    const destination = {
      x: npc.position.x + delta.x,
      y: npc.position.y + delta.y,
    };
    if (
      destination.x >= world.width ||
      destination.x < 0 ||
      destination.y >= world.height ||
      destination.y < 0
    ) {
      continue;
    }
    if (blockedPositions.has(positionKey(destination))) {
      continue;
    }

    // add the valid action
    validActions.push({
      type: 'move',
      npcId: npc.id,
      direction,
    });
  }

  return validActions;
}

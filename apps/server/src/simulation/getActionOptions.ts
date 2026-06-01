import type { NpcAction, Direction, Npc, World } from '@tilefolk/shared';
import type { ActionOption } from './controllers/types.js';
import { directionDeltas } from './directionDeltas.js';

// Maps direction to human-readable descriptions
const directionDescriptions: Record<Direction, string> = {
  n: 'north',
  ne: 'northeast',
  e: 'east',
  se: 'southeast',
  s: 'south',
  sw: 'southwest',
  w: 'west',
  nw: 'northwest',
};

interface GetActionOptionsContext {
  npc?: Npc;
  world?: World;
}

export function getActionOptions(
  actions: NpcAction[],
  context: GetActionOptionsContext = {},
): ActionOption[] {
  return actions.map((action) => {
    switch (action.type) {
      case 'move': {
        const delta = directionDeltas[action.direction];
        const destination = context.npc
          ? ` to (${context.npc.position.x + delta.x}, ${context.npc.position.y + delta.y})`
          : '';

        return {
          id: `move:${action.direction}`,
          description: `Move 1 tile ${directionDescriptions[action.direction]}${destination}`,
          action,
        };
      }

      case 'pickup': {
        const item = context.world?.items.find((i) => i.id === action.itemId);
        const description = item
          ? `Pick up ${item.name} (${action.itemId})`
          : `Pick up item ${action.itemId}`;

        return {
          id: `pickup:${action.itemId}`,
          description,
          action,
        };
      }

      case 'chopTree': {
        const tree = context.world?.trees.find((candidate) => candidate.id === action.treeId);
        const description = tree
          ? `Chop tree ${action.treeId} at (${tree.position.x}, ${tree.position.y}), hp ${tree.hitPoints}`
          : `Chop tree ${action.treeId}`;

        return {
          id: `chopTree:${action.treeId}`,
          description,
          action,
        };
      }

      case 'wait':
        return {
          id: 'wait',
          description: `Wait for this turn`,
          action,
        };
    }
  });
}

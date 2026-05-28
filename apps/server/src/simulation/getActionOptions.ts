import type { NpcAction, Direction, Npc } from '@tilefolk/shared';
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

      case 'pickup':
        return {
          id: `pickup:${action.itemId}`,
          description: `Pick up item ${action.itemId}`,
          action,
        };

      case 'wait':
        return {
          id: 'wait',
          description: `Wait for this turn`,
          action,
        };
    }
  });
}

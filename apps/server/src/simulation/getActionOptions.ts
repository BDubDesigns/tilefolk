import type { NpcAction, Direction } from '@tilefolk/shared';
import type { ActionOption } from './controllers/types.js';

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

export function getActionOptions(actions: NpcAction[]): ActionOption[] {
  return actions.map((action) => {
    switch (action.type) {
      case 'move':
        return {
          id: `move:${action.direction}`,
          description: `Move 1 tile ${directionDescriptions[action.direction]}`,
          action,
        };

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

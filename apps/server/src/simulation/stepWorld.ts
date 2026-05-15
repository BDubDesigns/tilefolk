import type { World } from '@tilefolk/shared';
import type { StepWorldResponse } from '@tilefolk/shared';

export const stepWorld = (world: World): StepWorldResponse => {
  const newWorld = {
    ...world,
    npcs: world.npcs.map((npc) => ({ ...npc, position: { ...npc.position } })),
  };
  const npc = newWorld.npcs[0];

  if (!npc) {
    return {
      world,
      actionResult: {
        action: { type: 'move', npcId: 'npc_0', direction: 'e' },
        success: false,
        message: 'No NPCs to move',
      },
    };
  }

  const destX = npc.position.x + 1;
  const destY = npc.position.y;

  if (destX >= newWorld.width || destX < 0 || destY >= newWorld.height || destY < 0) {
    return {
      world,
      actionResult: {
        action: { type: 'move', npcId: 'npc_0', direction: 'e' },
        success: false,
        message: 'NPC_0 is at the edge of the world',
      },
    };
  }

  for (const item of newWorld.items) {
    if (
      item.location.type === 'ground' &&
      item.location.position.x === destX &&
      item.location.position.y === destY
    ) {
      return {
        world,
        actionResult: {
          action: { type: 'move', npcId: 'npc_0', direction: 'e' },
          success: false,
          message: 'NPC_0 collides with an item',
        },
      };
    }
  }

  for (const tree of newWorld.trees) {
    if (tree.position.x === destX && tree.position.y === destY) {
      return {
        world,
        actionResult: {
          action: { type: 'move', npcId: 'npc_0', direction: 'e' },
          success: false,
          message: 'NPC_0 collides with a tree',
        },
      };
    }
  }

  for (const thisNpc of newWorld.npcs) {
    if (thisNpc.position.x === destX && thisNpc.position.y === destY && thisNpc.id !== npc.id) {
      return {
        world,
        actionResult: {
          action: { type: 'move', npcId: 'npc_0', direction: 'e' },
          success: false,
          message: 'NPC_0 collides with another NPC',
        },
      };
    }
  }

  // happy path
  npc.position.x += 1;
  return {
    world: newWorld,
    actionResult: {
      action: { type: 'move', npcId: 'npc_0', direction: 'e' },
      success: true,
      message: 'Moved NPC_0 east',
    },
  };
};

import type { World } from '@tilefolk/shared';
import type { StepWorldResponse } from '@tilefolk/shared';

export const stepWorld = (world: World): StepWorldResponse => {
  const newWorld = {
    ...world,
    npcs: world.npcs.map((npc) => ({ ...npc, position: { ...npc.position } })),
  };
  const npcIndex = newWorld.turn % newWorld.npcs.length;
  const npc = newWorld.npcs[npcIndex];

  if (!npc) {
    return {
      world,
      actionResult: {
        action: { type: 'move', npcId: 'N/A', direction: 'e' },
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
        action: { type: 'move', npcId: npc.id, direction: 'e' },
        success: false,
        message: `${npc.id} is at the edge of the world`,
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
          action: { type: 'move', npcId: npc.id, direction: 'e' },
          success: false,
          message: `${npc.id} collides with an item`,
        },
      };
    }
  }

  for (const tree of newWorld.trees) {
    if (tree.position.x === destX && tree.position.y === destY) {
      return {
        world,
        actionResult: {
          action: { type: 'move', npcId: npc.id, direction: 'e' },
          success: false,
          message: `${npc.id} collides with a tree`,
        },
      };
    }
  }

  for (const thisNpc of newWorld.npcs) {
    if (thisNpc.position.x === destX && thisNpc.position.y === destY && thisNpc.id !== npc.id) {
      return {
        world,
        actionResult: {
          action: { type: 'move', npcId: npc.id, direction: 'e' },
          success: false,
          message: `${npc.id} collides with another NPC`,
        },
      };
    }
  }

  // happy path
  npc.position.x += 1;
  newWorld.turn += 1;
  return {
    world: newWorld,
    actionResult: {
      action: { type: 'move', npcId: npc.id, direction: 'e' },
      success: true,
      message: `${npc.id} moved east`,
    },
  };
};

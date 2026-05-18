import type { ActionResult, Direction, Npc, Position, World } from '@tilefolk/shared';
import { directions } from '@tilefolk/shared';
import type { StepWorldResponse } from '@tilefolk/shared';

const directionDeltas: Record<Direction, Position> = {
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 },
};

function appendActionEvent(world: World, actionResult: ActionResult, turn: number): void {
  world.events.push({
    id: `event_${world.events.length}`,
    turn,
    actorId: actionResult.action.npcId,
    message: actionResult.message,
  });
}

function createMoveResult(npc: Npc, success: boolean, message: string): ActionResult {
  return {
    action: { type: 'move', npcId: npc.id, direction: 'e' },
    success,
    message,
  };
}

function finishNpcAttempt(
  world: World,
  actionResult: ActionResult,
  turn: number,
): StepWorldResponse {
  appendActionEvent(world, actionResult, turn);

  return {
    world,
    actionResult,
  };
}

export const stepWorld = (world: World): StepWorldResponse => {
  const newWorld = {
    ...world,
    events: [...world.events],
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

  const actionTurn = newWorld.turn;
  // we know theres an NPC, so we can increment turn safely
  newWorld.turn += 1;

  const destX = npc.position.x + 1;
  const destY = npc.position.y;

  if (destX >= newWorld.width || destX < 0 || destY >= newWorld.height || destY < 0) {
    return finishNpcAttempt(
      newWorld,
      createMoveResult(npc, false, `${npc.id} is at the edge of the world`),
      actionTurn,
    );
  }

  for (const item of newWorld.items) {
    if (
      item.location.type === 'ground' &&
      item.location.position.x === destX &&
      item.location.position.y === destY
    ) {
      return finishNpcAttempt(
        newWorld,
        createMoveResult(npc, false, `${npc.id} collides with an item`),
        actionTurn,
      );
    }
  }

  for (const tree of newWorld.trees) {
    if (tree.position.x === destX && tree.position.y === destY) {
      return finishNpcAttempt(
        newWorld,
        createMoveResult(npc, false, `${npc.id} collides with a tree`),
        actionTurn,
      );
    }
  }

  for (const thisNpc of newWorld.npcs) {
    if (thisNpc.position.x === destX && thisNpc.position.y === destY && thisNpc.id !== npc.id) {
      return finishNpcAttempt(
        newWorld,
        createMoveResult(npc, false, `${npc.id} collides with another NPC`),
        actionTurn,
      );
    }
  }

  // happy path

  // update npc position
  npc.position.x += 1;

  return finishNpcAttempt(
    newWorld,
    createMoveResult(npc, true, `${npc.id} moved east`),
    actionTurn,
  );
};

import type { ActionResult, Direction, Npc, World } from '@tilefolk/shared';
import { directionDeltas } from './directionDeltas.js';
import type { StepWorldResponse } from '@tilefolk/shared';
import { getValidMovementActions } from './getValidMovementActions.js';
import { selectDeterministicAction } from './selectDeterministicAction.js';

function appendActionEvent(world: World, actionResult: ActionResult, turn: number): void {
  world.events.push({
    id: `event_${world.events.length}`,
    turn,
    actorId: actionResult.action.npcId,
    message: actionResult.message,
  });
}

function createWaitResult(npc: Npc, message: string): ActionResult {
  return {
    action: { type: 'wait', npcId: npc.id },
    success: true,
    message,
  };
}

function createMoveResult(
  npc: Npc,
  direction: Direction,
  success: boolean,
  message: string,
): ActionResult {
  return {
    action: { type: 'move', npcId: npc.id, direction },
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

  const validMovementActions = getValidMovementActions({
    world: newWorld,
    npcId: npc.id,
  });

  const selectedAction = selectDeterministicAction({
    world: newWorld,
    npc,
    actions: validMovementActions,
  });

  const actionTurn = newWorld.turn;
  newWorld.turn += 1;

  // if no valid actions, wait
  if (!selectedAction) {
    return finishNpcAttempt(newWorld, createWaitResult(npc, `${npc.id} waited`), actionTurn);
  }

  switch (selectedAction.type) {
    case 'wait':
      return finishNpcAttempt(newWorld, createWaitResult(npc, `${npc.id} waited`), actionTurn);
    case 'move': {
      const direction = selectedAction.direction;

      const delta = directionDeltas[direction];

      const destX = npc.position.x + delta.x;
      const destY = npc.position.y + delta.y;

      // update npc position
      npc.position.x = destX;
      npc.position.y = destY;

      return finishNpcAttempt(
        newWorld,
        createMoveResult(npc, direction, true, `${npc.id} moved ${direction}`),
        actionTurn,
      );
    }
    default:
      return finishNpcAttempt(newWorld, createWaitResult(npc, `${npc.id} waited`), actionTurn);
  }
};

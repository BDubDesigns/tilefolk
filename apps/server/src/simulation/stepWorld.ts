import type { ActionResult, Direction, Npc, World } from '@tilefolk/shared';
import { directionDeltas } from './directionDeltas.js';
import type { StepWorldResponse, ItemId } from '@tilefolk/shared';
import { getValidActions } from './getValidActions.js';
import { deterministicController } from './controllers/deterministicController.js';

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

function createPickupResult(
  npc: Npc,
  itemId: ItemId,
  success: boolean,
  message: string,
): ActionResult {
  return {
    action: { type: 'pickup', npcId: npc.id, itemId },
    success,
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

function assertUnhandledAction(action: never): never {
  throw new Error(`Unhandled NPC action: ${JSON.stringify(action)}`);
}

export const stepWorld = (world: World): StepWorldResponse => {
  const newWorld = {
    ...world,
    events: [...world.events],
    npcs: world.npcs.map((npc) => ({ ...npc, position: { ...npc.position } })),
    items: structuredClone(world.items),
    trees: structuredClone(world.trees),
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

  const validActions = getValidActions({
    world: newWorld,
    npcId: npc.id,
  });

  // choose the action to take based on the valid actions and the deterministic controller
  const selectedAction = deterministicController.chooseAction({
    world: newWorld,
    npc,
    actions: validActions,
  });

  const actionTurn = newWorld.turn;
  newWorld.turn += 1;

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

      npc.position.x = destX;
      npc.position.y = destY;

      return finishNpcAttempt(
        newWorld,
        createMoveResult(npc, direction, true, `${npc.id} moved ${direction}`),
        actionTurn,
      );
    }
    case 'pickup': {
      const itemId = selectedAction.itemId;
      const item = newWorld.items.find((item) => item.id === itemId);

      if (item) {
        item.location = { type: 'inventory', npcId: npc.id };
        return finishNpcAttempt(
          newWorld,
          createPickupResult(npc, itemId, true, `${npc.id} picked up ${itemId}`),
          actionTurn,
        );
      } else {
        return finishNpcAttempt(
          newWorld,
          createPickupResult(
            npc,
            itemId,
            false,
            `${npc.id} tried to pickup ${itemId} but it was not found`,
          ),
          actionTurn,
        );
      }
    }
  }

  return assertUnhandledAction(selectedAction);
};

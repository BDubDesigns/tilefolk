import type { ActionResult, Direction, Npc, World } from '@tilefolk/shared';
import { directionDeltas } from './directionDeltas.js';
import type { StepWorldResponse, ItemId } from '@tilefolk/shared';
import { getValidActions } from './getValidActions.js';
import { getActionOptions } from './getActionOptions.js';
// import { deterministicController } from './controllers/deterministicController.js';
import { llmController } from './controllers/llmController.js';

function appendActionEvent(
  world: World,
  actionResult: ActionResult,
  turn: number,
  controllerReason?: string,
  controllerDurationMs?: number,
): void {
  world.events.push({
    id: `event_${world.events.length}`,
    turn,
    actorId: actionResult.action.npcId,
    message: actionResult.message,
    ...(controllerReason ? { controllerReason } : {}),
    ...(controllerDurationMs !== undefined ? { controllerDurationMs } : {}),
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
  controllerReason?: string,
  controllerDurationMs?: number,
): StepWorldResponse {
  appendActionEvent(world, actionResult, turn, controllerReason, controllerDurationMs);
  return {
    world,
    actionResult,
  };
}

function assertUnhandledAction(action: never): never {
  throw new Error(`Unhandled NPC action: ${JSON.stringify(action)}`);
}

export const stepWorld = async (world: World): Promise<StepWorldResponse> => {
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

  const actionTurn = newWorld.turn;
  newWorld.turn += 1;

  const validActions = getValidActions({
    world: newWorld,
    npcId: npc.id,
  });

  const actionOptions = getActionOptions(validActions);

  const controllerStartedAt = performance.now();
  const controllerDecision = await llmController.chooseAction({
    world: newWorld,
    npc,
    actionOptions,
  });
  const controllerDurationMs = Math.round(performance.now() - controllerStartedAt);

  if (!controllerDecision) {
    return finishNpcAttempt(
      newWorld,
      createWaitResult(npc, `${npc.id} waited`),
      actionTurn,
      'Controller did not select an option.',
      controllerDurationMs,
    );
  }
  const selectedOption = actionOptions.find(
    (option) => option.id === controllerDecision.selectedOptionId,
  );

  if (!selectedOption) {
    return finishNpcAttempt(
      newWorld,
      createWaitResult(npc, `${npc.id} waited`),
      actionTurn,
      'Controller selected an invalid option.',
      controllerDurationMs,
    );
  }

  const selectedAction = selectedOption.action;

  switch (selectedAction.type) {
    case 'wait':
      return finishNpcAttempt(
        newWorld,
        createWaitResult(npc, `${npc.id} waited`),
        actionTurn,
        controllerDecision.reason,
        controllerDurationMs,
      );
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
        controllerDecision.reason,
        controllerDurationMs,
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
          controllerDecision.reason,
          controllerDurationMs,
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
          controllerDecision.reason,
          controllerDurationMs,
        );
      }
    }
  }

  return assertUnhandledAction(selectedAction);
};

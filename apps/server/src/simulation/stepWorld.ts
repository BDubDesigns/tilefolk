import type {
  ActionResult,
  Direction,
  Npc,
  Position,
  TreeId,
  World,
  WorldEvent,
} from '@tilefolk/shared';
import { directionDeltas } from './directionDeltas.js';
import type { StepWorldResponse, ItemId } from '@tilefolk/shared';
import { getValidActions } from './getValidActions.js';
import { getActionOptions } from './getActionOptions.js';
import {
  getControllerAssignment,
  getControllerLabel,
} from './controllers/controllerAssignments.js';
import { resolveControllerDecision } from './controllers/resolveControllerDecision.js';
import { addMemoriesForWitnesses } from './addMemoriesForWitnesses.js';

function appendActionEvent(
  world: World,
  actionResult: ActionResult,
  turn: number,
  controllerReason?: string,
  controllerDurationMs?: number,
  controllerLabel?: string,
  position?: Position,
): WorldEvent {
  const event: WorldEvent = {
    id: `event_${world.events.length}`,
    turn,
    actorId: actionResult.action.npcId,
    message: actionResult.message,
    ...(controllerReason ? { controllerReason } : {}),
    ...(controllerDurationMs !== undefined ? { controllerDurationMs } : {}),
    ...(controllerLabel ? { controllerLabel } : {}),
    ...(position ? { position: { ...position } } : {}),
  };
  world.events.push(event);
  return event;
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

function createChopTreeResult(
  npc: Npc,
  treeId: TreeId,
  success: boolean,
  message: string,
): ActionResult {
  return {
    action: { type: 'chopTree', npcId: npc.id, treeId },
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
  controllerLabel?: string,
  position?: Position,
): StepWorldResponse {
  const event = appendActionEvent(
    world,
    actionResult,
    turn,
    controllerReason,
    controllerDurationMs,
    controllerLabel,
    position,
  );

  addMemoriesForWitnesses({ world, event });
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
    npcs: world.npcs.map((npc) => ({
      ...npc,
      position: { ...npc.position },
      memories: npc.memories.map((memory) => ({
        ...memory,
        position: { ...memory.position },
      })),
    })),
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

  const actionOptions = getActionOptions(validActions, { npc });

  const controllerAssignment = getControllerAssignment(npc.id);
  const controllerLabel = getControllerLabel(controllerAssignment);

  const controllerStartedAt = performance.now();
  const controllerDecision = await resolveControllerDecision({
    world: newWorld,
    npc,
    actionOptions,
    controllerAssignment,
  });
  const controllerDurationMs = Math.round(performance.now() - controllerStartedAt);

  if (!controllerDecision) {
    return finishNpcAttempt(
      newWorld,
      createWaitResult(npc, `${npc.id} waited`),
      actionTurn,
      'Controller did not select an option.',
      controllerDurationMs,
      controllerLabel,
      npc.position,
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
      controllerLabel,
      npc.position,
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
        controllerLabel,
        npc.position,
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
        controllerLabel,
        npc.position,
      );
    }

    case 'chopTree': {
      const treeId = selectedAction.treeId;
      const tree = newWorld.trees.find((tree) => tree.id === treeId);

      if (tree) {
        tree.hitPoints -= 1;
      } else {
        return finishNpcAttempt(
          newWorld,
          createChopTreeResult(
            npc,
            treeId,
            false,
            `${npc.id} tried to chop tree ${treeId}, but it was not found`,
          ),
          actionTurn,
          controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          npc.position,
        );
      }
      return finishNpcAttempt(
        newWorld,
        createChopTreeResult(npc, treeId, true, `${npc.id} chopped tree ${treeId}`),
        actionTurn,
        controllerDecision.reason,
        controllerDurationMs,
        controllerLabel,
        npc.position,
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
          controllerLabel,
          npc.position,
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
          controllerLabel,
          npc.position,
        );
      }
    }
  }

  return assertUnhandledAction(selectedAction);
};

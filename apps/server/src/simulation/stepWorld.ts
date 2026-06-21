import type {
  ActionResult,
  BushId,
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
import { applyRoundTicks } from './applyRoundTicks.js';

function appendActionEvent({
  world,
  actionResult,
  turn,
  controllerReason,
  controllerDurationMs,
  controllerLabel,
  position,
}: {
  world: World;
  actionResult: ActionResult;
  turn: number;
  controllerReason?: string;
  controllerDurationMs?: number;
  controllerLabel?: string;
  position?: Position;
}): WorldEvent {
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

function createCarefullyPickBerryResult(
  npc: Npc,
  berryBushId: BushId,
  success: boolean,
  message: string,
): ActionResult {
  return {
    action: { type: 'carefullyPickBerry', npcId: npc.id, berryBushId },
    success,
    message,
  };
}

function finishNpcAttempt({
  world,
  actionResult,
  controllerReason,
  controllerDurationMs,
  controllerLabel,
  position,
}: {
  world: World;
  actionResult: ActionResult;
  controllerReason?: string;
  controllerDurationMs?: number;
  controllerLabel?: string;
  position?: Position;
}): StepWorldResponse {
  const event = appendActionEvent({
    world,
    actionResult,
    turn: world.turn,
    controllerReason,
    controllerDurationMs,
    controllerLabel,
    position,
  });

  addMemoriesForWitnesses({ world, event });
  // Last thing before returning, advance the turn/round clock
  const clockAdvance = advanceTurnClock(world);
  if (clockAdvance.didCompleteRound) {
    applyRoundTicks(world);
  }
  return {
    world,
    actionResult,
  };
}

function assertUnhandledAction(action: never): never {
  throw new Error(`Unhandled NPC action: ${JSON.stringify(action)}`);
}

// clock helpers
function getActiveTurnNpc(world: World): Npc | undefined {
  const npcIndex = world.turn % world.npcs.length;
  const npc = world.npcs[npcIndex];
  return npc;
}

function advanceTurnClock(world: World): { didCompleteRound: boolean } {
  world.turn += 1;
  if (world.turn % world.npcs.length === 0) {
    world.round += 1;
    return { didCompleteRound: true };
  }
  return { didCompleteRound: false };
}

export const stepWorld = async (world: World): Promise<StepWorldResponse> => {
  // Clone once at the simulation boundary so internals can mutate the working copy safely.
  const newWorld = structuredClone(world);
  // get the active NPC for this turn
  const npc = getActiveTurnNpc(newWorld);

  if (!npc) {
    return {
      world,
      actionResult: {
        action: { type: 'wait', npcId: 'N/A' },
        success: false,
        message: 'No NPCs to act',
      },
    };
  }

  const validActions = getValidActions({
    world: newWorld,
    npcId: npc.id,
  });

  const actionOptions = getActionOptions(validActions, { npc, world: newWorld });

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
    return finishNpcAttempt({
      world: newWorld,
      actionResult: createWaitResult(npc, `${npc.id} waited`),
      controllerReason: 'Controller did not select an option.',
      controllerDurationMs,
      controllerLabel,
      position: npc.position,
    });
  }
  const selectedOption = actionOptions.find(
    (option) => option.id === controllerDecision.selectedOptionId,
  );

  if (!selectedOption) {
    return finishNpcAttempt({
      world: newWorld,
      actionResult: createWaitResult(npc, `${npc.id} waited`),
      controllerReason: 'Controller selected an invalid option.',
      controllerDurationMs,
      controllerLabel,
      position: npc.position,
    });
  }

  const selectedAction = selectedOption.action;

  switch (selectedAction.type) {
    case 'wait':
      return finishNpcAttempt({
        world: newWorld,
        actionResult: createWaitResult(npc, `${npc.id} waited`),
        controllerReason: controllerDecision.reason,
        controllerDurationMs,
        controllerLabel,
        position: npc.position,
      });
    case 'move': {
      const direction = selectedAction.direction;

      const delta = directionDeltas[direction];

      const destX = npc.position.x + delta.x;
      const destY = npc.position.y + delta.y;

      npc.position.x = destX;
      npc.position.y = destY;

      return finishNpcAttempt({
        world: newWorld,
        actionResult: createMoveResult(npc, direction, true, `${npc.id} moved ${direction}`),
        controllerReason: controllerDecision.reason,
        controllerDurationMs,
        controllerLabel,
        position: npc.position,
      });
    }

    case 'chopTree': {
      const treeId = selectedAction.treeId;
      const tree = newWorld.trees.find((tree) => tree.id === treeId);
      if (tree) {
        tree.hitPoints -= 1;
        const position = { ...tree.position };
        if (tree.hitPoints <= 0) {
          newWorld.trees = newWorld.trees.filter((tree) => tree.id !== treeId);
          newWorld.items.push({
            id: `item_wood_${treeId}`,
            name: 'Wood',
            type: 'wood',
            location: { type: 'ground', position },
          });
        }
      } else {
        return finishNpcAttempt({
          world: newWorld,
          actionResult: createChopTreeResult(
            npc,
            treeId,
            false,
            `${npc.id} tried to chop tree ${treeId}, but it was not found`,
          ),
          controllerReason: controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          position: npc.position,
        });
      }
      return finishNpcAttempt({
        world: newWorld,
        actionResult: createChopTreeResult(npc, treeId, true, `${npc.id} chopped tree ${treeId}`),
        controllerReason: controllerDecision.reason,
        controllerDurationMs,
        controllerLabel,
        position: npc.position,
      });
    }
    case 'pickup': {
      const itemId = selectedAction.itemId;
      const item = newWorld.items.find((item) => item.id === itemId);

      if (item) {
        item.location = { type: 'inventory', npcId: npc.id };
        return finishNpcAttempt({
          world: newWorld,
          actionResult: createPickupResult(npc, itemId, true, `${npc.id} picked up ${itemId}`),
          controllerReason: controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          position: npc.position,
        });
      } else {
        return finishNpcAttempt({
          world: newWorld,
          actionResult: createPickupResult(
            npc,
            itemId,
            false,
            `${npc.id} tried to pickup ${itemId} but it was not found`,
          ),
          controllerReason: controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          position: npc.position,
        });
      }
    }
    case 'carefullyPickBerry': {
      const berryBushId = selectedAction.berryBushId;
      const berryBush = newWorld.bushes.find((bush) => bush.id === berryBushId);

      if (!berryBush) {
        return finishNpcAttempt({
          world: newWorld,
          actionResult: createCarefullyPickBerryResult(
            npc,
            berryBushId,
            false,
            `${npc.id} tried to pick berry from bush ${berryBushId}, but it was not found`,
          ),
          controllerReason: controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          position: npc.position,
        });
      }

      if (berryBush.berries <= 0) {
        return finishNpcAttempt({
          world: newWorld,
          actionResult: createCarefullyPickBerryResult(
            npc,
            berryBushId,
            false,
            `${npc.id} tried to pick berry from bush ${berryBushId}, but it had no berries`,
          ),
          controllerReason: controllerDecision.reason,
          controllerDurationMs,
          controllerLabel,
          position: npc.position,
        });
      }

      berryBush.berries -= 1;
      const berryItemId = `item_berry_turn_${newWorld.turn}`;
      newWorld.items.push({
        id: berryItemId,
        name: 'Berry',
        type: 'berry',
        location: { type: 'inventory', npcId: npc.id },
      });

      return finishNpcAttempt({
        world: newWorld,
        actionResult: createCarefullyPickBerryResult(
          npc,
          berryBushId,
          true,
          `${npc.id} carefully picked berry from bush ${berryBushId}`,
        ),
        controllerReason: controllerDecision.reason,
        controllerDurationMs,
        controllerLabel,
        position: npc.position,
      });
    }
  }

  return assertUnhandledAction(selectedAction);
};

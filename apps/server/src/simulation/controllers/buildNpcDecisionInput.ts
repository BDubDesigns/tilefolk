import type { Memory, Npc, VisibleWorldContext, World } from '@tilefolk/shared';
import { getVisibleWorldContext } from '@tilefolk/shared';
import { getActionOptions } from '../getActionOptions.js';
import { getRecentMemoriesForNpc } from '../getRecentMemoriesForNpc.js';
import { getValidActions } from '../getValidActions.js';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import type { ActionOption } from './types.js';

export interface NpcDecisionInput {
  npc: Npc;
  turn: number;
  round: number;
  actionOptions: ActionOption[];
  visibleContext: VisibleWorldContext;
  recentMemories: Memory[];
  prompt: string;
}

interface BuildNpcDecisionInputOptions {
  world: World;
  npc: Npc;
}

export function buildNpcDecisionInput({ world, npc }: BuildNpcDecisionInputOptions): NpcDecisionInput {
  const validActions = getValidActions({ world, npcId: npc.id });
  const actionOptions = getActionOptions(validActions, { npc, world });
  const visibleContext = getVisibleWorldContext({ world, npc });
  const recentMemories = getRecentMemoriesForNpc({ npc });
  const prompt = buildControllerPrompt({
    npc,
    recentMemories,
    actionOptions,
    visibleContext,
  });

  return {
    npc,
    turn: world.turn,
    round: world.round,
    actionOptions,
    visibleContext,
    recentMemories,
    prompt,
  };
}

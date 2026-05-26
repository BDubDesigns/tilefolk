import { serverEnv } from '../../config/env.js';
export type LlmProvider = 'opencode-go' | 'google-ai' | 'openrouter';

export type ControllerAssignment =
  | { type: 'deterministic' }
  | { type: 'llm'; provider: LlmProvider; model?: string };

const controllerAssignments: Record<string, ControllerAssignment> = {
  npc_0: { type: 'llm', provider: 'opencode-go' },
  npc_1: { type: 'llm', provider: 'openrouter' },
  npc_2: {
    type: 'llm',
    provider: 'openrouter',
    model: 'google/gemma-4-26b-a4b-it:free',
  },
  npc_3: { type: 'deterministic' },
};

export function getControllerAssignment(npcId: string): ControllerAssignment {
  if (!serverEnv.useSampleControllerAssignments) {
    if (serverEnv.defaultController === 'llm') {
      return { type: 'llm', provider: 'opencode-go' };
    }

    return { type: 'deterministic' };
  }

  return controllerAssignments[npcId] ?? { type: 'deterministic' };
}

export function getControllerLabel(controllerAssignment: ControllerAssignment): string {
  if (controllerAssignment.type === 'deterministic') {
    return 'deterministic';
  }

  return controllerAssignment.provider;
}

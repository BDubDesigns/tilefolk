import { serverEnv } from '../../config/env.js';
export type LlmProvider = 'opencode-go' | 'google-ai' | 'openrouter';

export type ControllerAssignment =
  | { type: 'deterministic' }
  | { type: 'llm'; provider: LlmProvider; model?: string };

const controllerAssignments: Record<string, ControllerAssignment> = {
  npc_0: { type: 'llm', provider: 'opencode-go' },
  npc_1: { type: 'llm', provider: 'opencode-go' },
  npc_2: { type: 'llm', provider: 'opencode-go' },
  npc_3: { type: 'llm', provider: 'opencode-go' },
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

  const defaultModelByProvider: Record<LlmProvider, string | null> = {
    'opencode-go': serverEnv.openCodeGoModel,
    'google-ai': serverEnv.googleAiModel,
    openrouter: serverEnv.openRouterModel,
  };

  const model = controllerAssignment.model ?? defaultModelByProvider[controllerAssignment.provider];

  return model ? `${controllerAssignment.provider}: ${model}` : controllerAssignment.provider;
}

import { serverEnv } from '../../config/env.js';
export type LlmProvider = 'opencode-go' | 'google-ai' | 'openrouter' | 'cerebras';

export type ControllerAssignment =
  | { type: 'deterministic' }
  | { type: 'llm'; provider: LlmProvider; model?: string };

const controllerAssignments: Record<string, ControllerAssignment> = {
  npc_0: { type: 'llm', provider: 'cerebras', model: 'gpt-oss-120b' },
  npc_1: { type: 'llm', provider: 'cerebras', model: 'gpt-oss-120b' },
  npc_2: { type: 'llm', provider: 'cerebras', model: 'gpt-oss-120b' },
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

  const defaultModelByProvider: Record<LlmProvider, string | null> = {
    'opencode-go': serverEnv.openCodeGoModel,
    'google-ai': serverEnv.googleAiModel,
    'openrouter': serverEnv.openRouterModel,
    'cerebras': serverEnv.cerebrasModel,
  };

  const model = controllerAssignment.model ?? defaultModelByProvider[controllerAssignment.provider];

  return model ? `${controllerAssignment.provider}: ${model}` : controllerAssignment.provider;
}

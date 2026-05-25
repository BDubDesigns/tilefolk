export type ControllerAssignment =
  | { type: 'deterministic' }
  | { type: 'llm'; provider: 'opencode-go' | 'google-ai' };

const controllerAssignments: Record<string, ControllerAssignment> = {
  npc_0: { type: 'llm', provider: 'opencode-go' },
  npc_1: { type: 'llm', provider: 'google-ai' },
  npc_2: { type: 'deterministic' },
  npc_3: { type: 'deterministic' },
};

export function getControllerAssignment(npcId: string): ControllerAssignment {
  return controllerAssignments[npcId] ?? { type: 'deterministic' };
}

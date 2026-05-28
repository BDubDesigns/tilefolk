import type { ActionOption, ControllerDecision } from './types.js';

interface ParseControllerDecisionOptions {
  text: string;
  actionOptions: ActionOption[];
}

export function parseControllerDecision({
  text,
  actionOptions,
}: ParseControllerDecisionOptions): ControllerDecision | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const maybeDecision = parsed as Partial<ControllerDecision>;

  if (typeof maybeDecision.selectedOptionId !== 'string') return null;
  if (typeof maybeDecision.reason !== 'string') return null;

  const selectedOptionExists = actionOptions.some(
    (option) => option.id === maybeDecision.selectedOptionId,
  );
  if (!selectedOptionExists) return null;

  return {
    selectedOptionId: maybeDecision.selectedOptionId,
    reason: maybeDecision.reason,
  };
}

import type { Npc, VisibleWorldContext, WorldEvent } from '@tilefolk/shared';
import type { ActionOption } from './types.js';
import { formatVisibleContext } from './formatVisibleContext.js';

interface BuildControllerPromptOptions {
  recentEvents: WorldEvent[];
  actionOptions: ActionOption[];
  visibleContext: VisibleWorldContext;
  npc: Npc;
}

export function buildControllerPrompt(options: BuildControllerPromptOptions): string {
  const recentEventLines = options.recentEvents
    .map((event) => `Turn ${event.turn}: ${event.message}`)
    .join('\n');

  const actionOptionLines = options.actionOptions
    .map((option) => `${option.id}: ${option.description}`)
    .join('\n');

  const visibleContext = formatVisibleContext(options.visibleContext);

  return `
You are choosing the next action for NPC ${options.npc.id}.
Prefer an active action such as moving or picking up an item when one seems reasonable.
Choose wait only when no other option is useful.
Current Location: X:${options.npc.position.x}, Y:${options.npc.position.y}

Visible context:
${visibleContext}

Recent events:
${recentEventLines}

Valid action options:
${actionOptionLines}

Return only JSON with:
{
 "selectedOptionId": "one of the listed option IDs",
 "reason": "12 words or fewer"
}`;
}

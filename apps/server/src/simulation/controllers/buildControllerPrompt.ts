import type { ActionOption, Npc, VisibleWorldContext, Memory } from '@tilefolk/shared';
import { formatVisibleContext } from './formatVisibleContext.js';

interface BuildControllerPromptOptions {
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  visibleContext: VisibleWorldContext;
  npc: Npc;
}

export function buildControllerPrompt(options: BuildControllerPromptOptions): string {
  const recentMemoryLines = options.recentMemories
    .map((memory) => `Turn ${memory.turn}: ${memory.message}`)
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

Recent Memories:
${recentMemoryLines}

Valid action options:
${actionOptionLines}

Return only JSON with:
{
 "selectedOptionId": "one of the listed option IDs",
 "reason": "12 words or fewer"
}`;
}

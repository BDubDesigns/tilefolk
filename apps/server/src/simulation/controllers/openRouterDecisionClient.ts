import type { Npc, WorldEvent } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface RequestOpenRouterDecisionOptions {
  npc: Npc;
  recentEvents: WorldEvent[];
  actionOptions: ActionOption[];
  model?: string;
}

type OpenRouterChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export async function requestOpenRouterDecision(
  options: RequestOpenRouterDecisionOptions,
): Promise<ControllerDecision | null> {
  if (options.actionOptions.length === 0 || !serverEnv.isOpenRouterConfigured) return null;

  const { openRouterApiKey, openRouterModel } = serverEnv;

  const model = options.model ?? openRouterModel;

  if (!openRouterApiKey || !model) {
    return null;
  }

  const recentEventLines = options.recentEvents
    .map((event) => `Turn ${event.turn}: ${event.message}`)
    .join('\n');

  const actionOptionLines = options.actionOptions
    .map((option) => `${option.id}: ${option.description}`)
    .join('\n');

  const promptText = `
You are choosing the next action for NPC ${options.npc.id}.
Prefer an active action such as moving or picking up an item when one seems reasonable.
Choose wait only when no other option is useful.
Current Location: X:${options.npc.position.x}, Y:${options.npc.position.y}

Recent events:
${recentEventLines}

Valid action options:
${actionOptionLines}

Return only JSON with:
{
  "selectedOptionId": "one of the listed option IDs",
  "reason": "12 words or fewer"
}`;

  let response: Response;
  try {
    response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an NPC action selector. Do not think out loud. Choose exactly one listed option ID and return only valid JSON.',
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
        // Be explicit that we want a normal one-shot response, not streaming chunks.
        stream: false,
        // OpenAI-compatible providers often support this JSON-mode hint.
        response_format: { type: 'json_object' },
        // Tilefolk only needs a tiny menu choice here, so disable reasoning
        // to keep latency and completion size low.
        reasoning: { enabled: false },
        max_tokens: 150,
      }),
    });
  } catch (error) {
    console.error('OpenRouter decision request failed:', error);
    return null;
  }

  if (!response.ok) {
    console.error('OpenRouter decision request returned an error:', response.status);
    return null;
  }

  let completion: OpenRouterChatCompletionResponse;
  try {
    completion = (await response.json()) as OpenRouterChatCompletionResponse;
  } catch {
    return null;
  }

  const text = completion.choices?.[0]?.message?.content;
  if (!text) {
    console.error('OpenRouter returned no message content:', JSON.stringify(completion, null, 2));
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('OpenRouter returned non-JSON message content:', text);
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const maybeDecision = parsed as Partial<ControllerDecision>;

  if (typeof maybeDecision.selectedOptionId !== 'string') return null;
  if (typeof maybeDecision.reason !== 'string') return null;

  const selectedOptionExists = options.actionOptions.some(
    (option) => option.id === maybeDecision.selectedOptionId,
  );
  if (!selectedOptionExists) return null;

  return {
    selectedOptionId: maybeDecision.selectedOptionId,
    reason: maybeDecision.reason,
  };
}

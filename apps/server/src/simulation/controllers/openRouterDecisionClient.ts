import type { Memory, Npc, VisibleWorldContext } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import { parseControllerDecision } from './parseControllerDecision.js';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface RequestOpenRouterDecisionOptions {
  npc: Npc;
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  model?: string;
  visibleContext: VisibleWorldContext;
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
  const { openRouterApiKey, openRouterModel } = serverEnv;

  const model = options.model ?? openRouterModel;

  if (options.actionOptions.length === 0 || !openRouterApiKey || !model) {
    return null;
  }

  const promptText = buildControllerPrompt({
    npc: options.npc,
    recentMemories: options.recentMemories,
    actionOptions: options.actionOptions,
    visibleContext: options.visibleContext,
  });

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
              'You are an NPC action selector. Do not think out loud. Choose exactly one listed option ID. Return one complete JSON object only. No markdown. No trailing explanation.',
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
        max_tokens: 250,
      }),
    });
  } catch (error) {
    console.error('OpenRouter decision request failed:', error);
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenRouter decision request returned an error:', response.status, errorBody);
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

  return parseControllerDecision({
    text,
    actionOptions: options.actionOptions,
  });
}

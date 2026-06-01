import type { Memory, Npc, VisibleWorldContext } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import { parseControllerDecision } from './parseControllerDecision.js';

const CEREBRAS_CHAT_COMPLETIONS_URL = 'https://api.cerebras.ai/v1/chat/completions';

interface RequestCerebrasDecisionOptions {
  npc: Npc;
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  model?: string;
  visibleContext: VisibleWorldContext;
}

type CerebrasChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export async function requestCerebrasDecision(
  options: RequestCerebrasDecisionOptions,
): Promise<ControllerDecision | null> {
  const { cerebrasApiKey, cerebrasModel } = serverEnv;

  const model = options.model ?? cerebrasModel;

  if (options.actionOptions.length === 0 || !cerebrasApiKey || !model) return null;

  const promptText = buildControllerPrompt({
    npc: options.npc,
    recentMemories: options.recentMemories,
    actionOptions: options.actionOptions,
    visibleContext: options.visibleContext,
  });

  let response: Response;
  try {
    response = await fetch(CEREBRAS_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cerebrasApiKey}`,
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
        max_tokens: 400,
        reasoning_effort: 'low',
      }),
    });
  } catch (error) {
    console.error('Cerebras decision request failed:', error);
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Cerebras decision request returned an error:', response.status, errorBody);
    return null;
  }

  let completion: CerebrasChatCompletionResponse;
  try {
    completion = (await response.json()) as CerebrasChatCompletionResponse;
  } catch {
    return null;
  }

  const text = completion.choices?.[0]?.message?.content;
  if (!text) {
    console.error('Cerebras returned no message content:', JSON.stringify(completion, null, 2));
    return null;
  }

  return parseControllerDecision({
    text,
    actionOptions: options.actionOptions,
  });
}

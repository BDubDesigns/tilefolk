import type { ControllerDecision, NpcDecisionInput } from '@tilefolk/shared';
import { serverEnv } from '../../config/env.js';
import { controllerDecisionSystemInstruction } from './controllerInstructions.js';
import { parseControllerDecision } from './parseControllerDecision.js';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface RequestOpenRouterDecisionOptions {
  decisionInput: NpcDecisionInput;
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
  const { openRouterApiKey, openRouterModel } = serverEnv;

  const model = options.model ?? openRouterModel;

  const { actionOptions, prompt } = options.decisionInput;

  if (actionOptions.length === 0 || !openRouterApiKey || !model) {
    return null;
  }

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
            content: controllerDecisionSystemInstruction,
          },
          {
            role: 'user',
            content: prompt,
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
    actionOptions,
  });
}

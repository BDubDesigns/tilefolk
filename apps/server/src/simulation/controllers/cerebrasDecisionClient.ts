import type { ControllerDecision, NpcDecisionInput } from '@tilefolk/shared';
import { serverEnv } from '../../config/env.js';
import { controllerDecisionSystemInstruction } from './controllerInstructions.js';
import { parseControllerDecision } from './parseControllerDecision.js';

const CEREBRAS_CHAT_COMPLETIONS_URL = 'https://api.cerebras.ai/v1/chat/completions';

interface RequestCerebrasDecisionOptions {
  decisionInput: NpcDecisionInput;
  model?: string;
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

  const { actionOptions, prompt } = options.decisionInput;

  if (actionOptions.length === 0 || !cerebrasApiKey || !model) return null;

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
    actionOptions,
  });
}

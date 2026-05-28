import type { Npc, WorldEvent } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import type { VisibleWorldContext } from '@tilefolk/shared';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import { parseControllerDecision } from './parseControllerDecision.js';

const OPENCODE_GO_CHAT_COMPLETIONS_URL = 'https://opencode.ai/zen/go/v1/chat/completions';

interface RequestOpenCodeGoDecisionOptions {
  npc: Npc;
  recentEvents: WorldEvent[];
  actionOptions: ActionOption[];
  model?: string;
  visibleContext: VisibleWorldContext;
}

type OpenCodeGoChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export async function requestOpenCodeGoDecision(
  options: RequestOpenCodeGoDecisionOptions,
): Promise<ControllerDecision | null> {
  const { openCodeGoApiKey, openCodeGoModel } = serverEnv;

  const model = options.model ?? openCodeGoModel;

  if (options.actionOptions.length === 0 || !openCodeGoApiKey || !model) {
    return null;
  }

  const promptText = buildControllerPrompt({
    npc: options.npc,
    recentEvents: options.recentEvents,
    actionOptions: options.actionOptions,
    visibleContext: options.visibleContext,
  });

  let response: Response;
  try {
    response = await fetch(OPENCODE_GO_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openCodeGoApiKey}`,
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
        // DeepSeek V4 defaults to thinking mode on some routes. Tilefolk only
        // needs a tiny menu choice here, so disable reasoning for speed and
        // to avoid spending the whole response budget on reasoning_content.
        thinking: { type: 'disabled' },
        max_tokens: 150,
      }),
    });
  } catch (error) {
    console.error('OpenCode Go decision request failed:', error);
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenCode Go decision request returned an error:', response.status, errorBody);
    return null;
  }

  let completion: OpenCodeGoChatCompletionResponse;
  try {
    completion = (await response.json()) as OpenCodeGoChatCompletionResponse;
  } catch {
    return null;
  }

  // OpenCode Go's chat/completions endpoint is OpenAI-compatible, so the text
  // response lives at choices[0].message.content.
  const text = completion.choices?.[0]?.message?.content;
  if (!text) {
    console.error('OpenCode Go returned no message content:', JSON.stringify(completion, null, 2));
    return null;
  }

  return parseControllerDecision({
    text,
    actionOptions: options.actionOptions,
  });
}

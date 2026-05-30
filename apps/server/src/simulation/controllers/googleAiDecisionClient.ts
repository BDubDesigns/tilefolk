import type { Memory, Npc, VisibleWorldContext } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { GoogleGenAI } from '@google/genai';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import { parseControllerDecision } from './parseControllerDecision.js';

let googleAiClient: GoogleGenAI | null = null;

interface RequestGoogleAiDecisionOptions {
  npc: Npc;
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  model?: string;
  visibleContext: VisibleWorldContext;
}

function getGoogleAiClient(apiKey: string): GoogleGenAI {
  googleAiClient ??= new GoogleGenAI({
    apiKey,
  });

  return googleAiClient;
}

export async function requestGoogleAiDecision(
  options: RequestGoogleAiDecisionOptions,
): Promise<ControllerDecision | null> {
  const { googleAiApiKey, googleAiModel } = serverEnv;

  const model = options.model ?? googleAiModel;

  if (options.actionOptions.length === 0 || !googleAiApiKey || !model) {
    return null;
  }

  const ai = getGoogleAiClient(googleAiApiKey);

  const promptText = buildControllerPrompt({
    npc: options.npc,
    recentMemories: options.recentMemories,
    actionOptions: options.actionOptions,
    visibleContext: options.visibleContext,
  });

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });
  } catch (error) {
    console.error('Google AI decision request failed:', error);
    return null;
  }

  if (!response.text) return null;

  return parseControllerDecision({
    text: response.text,
    actionOptions: options.actionOptions,
  });
}

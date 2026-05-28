import type { Npc, WorldEvent } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { GoogleGenAI } from '@google/genai';
import type { VisibleWorldContext } from '@tilefolk/shared';
import { buildControllerPrompt } from './buildControllerPrompt.js';

let googleAiClient: GoogleGenAI | null = null;

interface RequestGoogleAiDecisionOptions {
  npc: Npc;
  recentEvents: WorldEvent[];
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
    recentEvents: options.recentEvents,
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
  let parsed: unknown;

  try {
    parsed = JSON.parse(response.text);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const maybeDecision = parsed as Partial<ControllerDecision>;

  if (typeof maybeDecision.selectedOptionId !== 'string') return null;
  if (typeof maybeDecision.reason !== 'string') return null;

  // if selectedOptionId is not in options.actionOptions, return null
  const selectedOptionExists = options.actionOptions.some(
    (option) => option.id === maybeDecision.selectedOptionId,
  );
  if (!selectedOptionExists) return null;

  return {
    selectedOptionId: maybeDecision.selectedOptionId,
    reason: maybeDecision.reason,
  };
}

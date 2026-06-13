import type { Memory, Npc, VisibleWorldContext } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { GoogleGenAI } from '@google/genai';
import { buildControllerPrompt } from './buildControllerPrompt.js';
import { controllerDecisionSystemInstruction } from './controllerInstructions.js';
import { parseControllerDecision } from './parseControllerDecision.js';

let googleAiClient: GoogleGenAI | null = null;

interface RequestGoogleAiDecisionOptions {
  npc: Npc;
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  model?: string;
  visibleContext: VisibleWorldContext;
  onFailure?: (message: string) => void;
}

function getGoogleAiClient(apiKey: string): GoogleGenAI {
  googleAiClient ??= new GoogleGenAI({
    apiKey,
  });

  return googleAiClient;
}

function formatGoogleAiFailureMessage(error: unknown): string {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? String((error as { status?: unknown }).status)
      : null;
  const message = error instanceof Error ? error.message : String(error);

  return status
    ? `Google AI request failed with status ${status}: ${message}`
    : `Google AI request failed: ${message}`;
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
      contents: `${controllerDecisionSystemInstruction}\n\n${promptText}`,
    });
  } catch (error) {
    console.error('Google AI decision request failed:', error);
    options.onFailure?.(formatGoogleAiFailureMessage(error));
    return null;
  }

  if (!response.text) {
    options.onFailure?.('Google AI returned no response text.');
    return null;
  }

  return parseControllerDecision({
    text: response.text,
    actionOptions: options.actionOptions,
  });
}

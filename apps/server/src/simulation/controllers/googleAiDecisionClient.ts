import type { ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';
import { GoogleGenAI } from '@google/genai';
import { controllerDecisionSystemInstruction } from './controllerInstructions.js';
import { parseControllerDecision } from './parseControllerDecision.js';
import type { NpcDecisionInput } from './buildNpcDecisionInput.js';

let googleAiClient: GoogleGenAI | null = null;

interface RequestGoogleAiDecisionOptions {
  decisionInput: NpcDecisionInput;
  model?: string;
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

  const { actionOptions, prompt } = options.decisionInput;

  if (actionOptions.length === 0 || !googleAiApiKey || !model) {
    return null;
  }

  const ai = getGoogleAiClient(googleAiApiKey);

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: `${controllerDecisionSystemInstruction}\n\n${prompt}`,
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
    actionOptions,
  });
}

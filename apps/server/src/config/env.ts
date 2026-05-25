import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(configDirectory, '../../.env') });

const trimmedGoogleAiApiKey = process.env.GOOGLE_AI_API_KEY?.trim();
const googleAiApiKey = trimmedGoogleAiApiKey ? trimmedGoogleAiApiKey : null;
const trimmedGoogleAiModel = process.env.GOOGLE_AI_MODEL?.trim();
const googleAiModel = trimmedGoogleAiModel ? trimmedGoogleAiModel : null;

const trimmedOpenCodeGoApiKey = process.env.OPENCODE_GO_API_KEY?.trim();
const openCodeGoApiKey = trimmedOpenCodeGoApiKey ? trimmedOpenCodeGoApiKey : null;
const trimmedOpenCodeGoModel = process.env.OPENCODE_GO_MODEL?.trim();
const openCodeGoModel = trimmedOpenCodeGoModel ? trimmedOpenCodeGoModel : null;
const trimmedDefaultController = process.env.TILEFOLK_DEFAULT_CONTROLLER?.trim();
const defaultController = trimmedDefaultController === 'llm' ? 'llm' : 'deterministic';

export const serverEnv = {
  googleAiApiKey,
  googleAiModel,
  isGoogleAiConfigured: googleAiApiKey !== null && googleAiModel !== null,
  openCodeGoApiKey,
  openCodeGoModel,
  isOpenCodeGoConfigured: openCodeGoApiKey !== null && openCodeGoModel !== null,
  defaultController,
};

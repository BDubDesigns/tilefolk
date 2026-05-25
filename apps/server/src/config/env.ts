import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(configDirectory, '../../.env') });

const trimmedGoogleAiApiKey = process.env.GOOGLE_AI_API_KEY?.trim();
const googleAiApiKey = trimmedGoogleAiApiKey ? trimmedGoogleAiApiKey : null;
const trimmedGoogleAiModel = process.env.GOOGLE_AI_MODEL?.trim();
const googleAiModel = trimmedGoogleAiModel ? trimmedGoogleAiModel : null;

export const serverEnv = {
  googleAiApiKey,
  googleAiModel,
  isGoogleAiConfigured: googleAiApiKey !== null && googleAiModel !== null,
};

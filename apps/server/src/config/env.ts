import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

if (!isTestEnvironment) {
  dotenv.config({ path: resolve(configDirectory, '../../.env') });
}

const trimmedGoogleAiApiKey = process.env.GOOGLE_AI_API_KEY?.trim();
const googleAiApiKey = trimmedGoogleAiApiKey ? trimmedGoogleAiApiKey : null;
const trimmedGoogleAiModel = process.env.GOOGLE_AI_MODEL?.trim();
const googleAiModel = trimmedGoogleAiModel ? trimmedGoogleAiModel : null;

const trimmedOpenCodeGoApiKey = process.env.OPENCODE_GO_API_KEY?.trim();
const openCodeGoApiKey = trimmedOpenCodeGoApiKey ? trimmedOpenCodeGoApiKey : null;
const trimmedOpenCodeGoModel = process.env.OPENCODE_GO_MODEL?.trim();
const openCodeGoModel = trimmedOpenCodeGoModel ? trimmedOpenCodeGoModel : null;

const trimmedDefaultController = process.env.TILEFOLK_DEFAULT_CONTROLLER?.trim();
const defaultController: 'deterministic' | 'llm' =
  trimmedDefaultController === 'llm' ? 'llm' : 'deterministic';
const useSampleControllerAssignments =
  process.env.TILEFOLK_USE_SAMPLE_CONTROLLER_ASSIGNMENTS?.trim() === 'true';

const trimmedAdminToken = process.env.TILEFOLK_ADMIN_TOKEN?.trim();
const tilefolkAdminToken = trimmedAdminToken ? trimmedAdminToken : null;

const trimmedCerebrasApiKey = process.env.CEREBRAS_API_KEY?.trim();
const cerebrasApiKey = trimmedCerebrasApiKey ? trimmedCerebrasApiKey : null;
const trimmedCerebrasModel = process.env.CEREBRAS_MODEL?.trim();
const cerebrasModel = trimmedCerebrasModel ? trimmedCerebrasModel : null;

const trimmedOpenRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
const openRouterApiKey = trimmedOpenRouterApiKey ? trimmedOpenRouterApiKey : null;
const trimmedOpenRouterModel = process.env.OPENROUTER_MODEL?.trim();
const openRouterModel = trimmedOpenRouterModel ? trimmedOpenRouterModel : null;

export const serverEnv = {
  googleAiApiKey,
  googleAiModel,
  isGoogleAiConfigured: googleAiApiKey !== null && googleAiModel !== null,
  openCodeGoApiKey,
  openCodeGoModel,
  isOpenCodeGoConfigured: openCodeGoApiKey !== null && openCodeGoModel !== null,
  openRouterApiKey,
  openRouterModel,
  isOpenRouterConfigured: openRouterApiKey !== null && openRouterModel !== null,
  cerebrasApiKey,
  cerebrasModel,
  isCerebrasConfigured: cerebrasApiKey !== null && cerebrasModel !== null,
  defaultController,
  useSampleControllerAssignments,
  tilefolkAdminToken,
  isAdminTokenConfigured: tilefolkAdminToken !== null,
};

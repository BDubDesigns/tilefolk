// import and configure dotenv
import 'dotenv/config';
const trimmedGoogleAiApiKey = process.env.GOOGLE_AI_API_KEY?.trim();
const googleAiApiKey = trimmedGoogleAiApiKey ? trimmedGoogleAiApiKey : null;
const trimmedGoogleAiModel = process.env.GOOGLE_AI_MODEL?.trim();
const googleAiModel = trimmedGoogleAiModel ? trimmedGoogleAiModel : null;

export const serverEnv = {
  googleAiApiKey,
  googleAiModel,
  isGoogleAiConfigured: googleAiApiKey !== null && googleAiModel !== null,
};

// import and configure dotenv
import 'dotenv/config';
const trimmedGoogleAiApiKey = process.env.GOOGLE_AI_API_KEY?.trim();
const googleAiApiKey = trimmedGoogleAiApiKey ? trimmedGoogleAiApiKey : null;

export const serverEnv = {
  googleAiApiKey,
  isGoogleAiConfigured: googleAiApiKey !== null,
};

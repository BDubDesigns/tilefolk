import cors from 'cors';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HealthResponse, ProviderTestResult, StatusResponse } from '@tilefolk/shared';
import { serverEnv } from './config/env.js';
import { appMetadata } from './config/appMetadata.js';
import { getActiveWorld, resetWorld, stepActiveWorld } from './simulation/worldStore.js';
import { requireAdminToken } from './auth/requireAdminToken.js';
import { executeProviderTests } from './providers/executeProviderTests.js';

const serverDistDirectory = dirname(fileURLToPath(import.meta.url));
const clientDistDirectory = resolve(serverDistDirectory, '../../client/dist');

type CreateAppOptions = {
  runProviderTests?: () => Promise<ProviderTestResult[]>;
};

export function createApp({ runProviderTests = executeProviderTests }: CreateAppOptions = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // health check
  app.get('/api/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok' };

    response.json(body);
  });

  // status
  app.get('/api/status', (_request, response) => {
    const body: StatusResponse = {
      version: appMetadata.version,
      defaultController: serverEnv.defaultController,
      useSampleControllerAssignments: serverEnv.useSampleControllerAssignments,
      isAdminTokenConfigured: serverEnv.isAdminTokenConfigured,
    };

    response.json(body);
  });

  app.post('/api/providers/test', requireAdminToken, async (_request, response) => {
    const results = await runProviderTests();

    response.json(results);
  });

  // generate world
  app.get('/api/worlds/default', (_request, response) => {
    const world = getActiveWorld();

    response.json(world);
  });

  // reset world
  app.post('/api/worlds/reset', requireAdminToken, (_request, response) => {
    const world = resetWorld();

    response.json(world);
  });

  // step world
  app.post('/api/worlds/default/step', requireAdminToken, async (_request, response) => {
    try {
      const stepResult = await stepActiveWorld();

      response.json(stepResult);
    } catch (error) {
      console.error('Failed to step world:', error);
      response.status(500).json({ error: 'Failed to step world' });
    }
  });

  // serve static files and handle client-side routing
  app.use(express.static(clientDistDirectory));

  app.get('*', (_request, response) => {
    response.sendFile(resolve(clientDistDirectory, 'index.html'));
  });

  return app;
}

import cors from 'cors';
import express from 'express';
import type { HealthResponse } from '@tilefolk/shared';
import { getActiveWorld, resetWorld } from './simulation/worldStore.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // health check
  app.get('/api/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok' };

    response.json(body);
  });

  // generate world
  app.get('/api/worlds/default', (_request, response) => {
    const world = getActiveWorld();

    response.json(world);
  });

  // reset world
  app.post('/api/worlds/reset', (_request, response) => {
    const world = resetWorld();

    response.json(world);
  });

  return app;
}

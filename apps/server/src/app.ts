import cors from 'cors';
import express from 'express';
import type { HealthResponse } from '@tilefolk/shared';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok' };

    response.json(body);
  });

  return app;
}

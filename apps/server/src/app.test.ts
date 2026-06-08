import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { appMetadata } from './config/appMetadata.js';
import { serverEnv } from './config/env.js';

function setServerAdminToken(token: string | null): void {
  serverEnv.tilefolkAdminToken = token;
  serverEnv.isAdminTokenConfigured = token !== null;
}

function resetProviderConfig(): void {
  serverEnv.googleAiApiKey = null;
  serverEnv.googleAiModel = null;
  serverEnv.isGoogleAiConfigured = false;

  serverEnv.openCodeGoApiKey = null;
  serverEnv.openCodeGoModel = null;
  serverEnv.isOpenCodeGoConfigured = false;

  serverEnv.openRouterApiKey = null;
  serverEnv.openRouterModel = null;
  serverEnv.isOpenRouterConfigured = false;

  serverEnv.cerebrasApiKey = null;
  serverEnv.cerebrasModel = null;
  serverEnv.isCerebrasConfigured = false;
}

function setCerebrasProviderConfig(model: string): void {
  serverEnv.cerebrasApiKey = 'test-cerebras-key';
  serverEnv.cerebrasModel = model;
  serverEnv.isCerebrasConfigured = true;
}

describe('createApp', () => {
  it('returns health status', async () => {
    // create app
    const app = createApp();
    // call GET /api/health with supertest
    const response = await request(app).get('/api/health');
    // expect status 200
    expect(response.status).toBe(200);
    // expect body to equal { status: 'ok' }
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns operational status', async () => {
    const app = createApp();

    const response = await request(app).get('/api/status');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      version: appMetadata.version,
      defaultController: serverEnv.defaultController,
      useSampleControllerAssignments: serverEnv.useSampleControllerAssignments,
      isAdminTokenConfigured: serverEnv.isAdminTokenConfigured,
    });
  });

  it('returns the default generated world', async () => {
    //   create app
    const app = createApp();
    //   call GET /api/worlds/default
    const response = await request(app).get('/api/worlds/default');
    //   expect status 200
    expect(response.status).toBe(200);
    //   expect body.width to be 25
    expect(response.body.width).toBe(25);
    //   expect body.height to be 25
    expect(response.body.height).toBe(25);
    //   expect body.npcs to have length 4
    expect(response.body.npcs).toHaveLength(4);
    //   expect body.items to have length 1
    expect(response.body.items).toHaveLength(1);
    //   expect body.trees to have length 20
    expect(response.body.trees).toHaveLength(20);
  });
});

describe('POST /api/worlds/reset', () => {
  afterEach(() => {
    setServerAdminToken(null);
  });

  // we check that the world is actually reset in worldStore.test.ts, so we only test the route here
  it('returns a generated world', async () => {
    //   create app
    const app = createApp();
    //   call POST /api/worlds/reset
    const response = await request(app).post('/api/worlds/reset');
    //   expect status 200
    expect(response.status).toBe(200);
    //   expect body.width to be 25
    expect(response.body.width).toBe(25);
    //   expect body.height to be 25
    expect(response.body.height).toBe(25);
    //   expect body.npcs to have length 4
    expect(response.body.npcs).toHaveLength(4);
    //   expect body.items to have length 1
    expect(response.body.items).toHaveLength(1);
    //   expect body.trees to have length 20
    expect(response.body.trees).toHaveLength(20);
    //
  });

  it('rejects requests without an admin token when one is configured', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app).post('/api/worlds/reset');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Admin token required or invalid' });
  });

  it('accepts requests with the configured admin token', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app)
      .post('/api/worlds/reset')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body.width).toBe(25);
  });
});

describe('POST /api/worlds/default/step', () => {
  afterEach(() => {
    setServerAdminToken(null);
  });

  it('steps the active world and returns the updated world plus action result', async () => {
    //   create app
    const app = createApp();
    //   call POST /api/worlds/default/step
    const response = await request(app).post('/api/worlds/default/step');
    //   expect status 200
    expect(response.status).toBe(200);
    // expect body.world exists
    expect(response.body.world).toBeDefined();
    // expect body.actionResult exists
    expect(response.body.actionResult).toBeDefined();
    // expect body.actionResult.type to be 'move'
    expect(response.body.actionResult.action.type).toBe('move');
    // expect body.actionResult.success to be boolean
    expect(typeof response.body.actionResult.success).toBe('boolean');
  });

  it('rejects requests without an admin token when one is configured', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app).post('/api/worlds/default/step');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Admin token required or invalid' });
  });

  it('accepts requests with the configured admin token', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app)
      .post('/api/worlds/default/step')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body.world).toBeDefined();
    expect(response.body.actionResult).toBeDefined();
  });
});

describe('POST /api/providers/test', () => {
  afterEach(() => {
    setServerAdminToken(null);
    resetProviderConfig();
  });

  it('rejects requests without an admin token when one is configured', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app).post('/api/providers/test');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Admin token required or invalid' });
  });

  it('returns an array', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app)
      .post('/api/providers/test')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('succeeds with the configured admin token', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app)
      .post('/api/providers/test')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('includes provider, model, success, durationMs, and message for a configured provider', async () => {
    setServerAdminToken('secret-token');
    setCerebrasProviderConfig('gpt-oss-120b');
    const app = createApp();

    const response = await request(app)
      .post('/api/providers/test')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body[0]).toEqual({
      provider: 'cerebras',
      model: 'gpt-oss-120b',
      success: true,
      durationMs: 0,
      message: 'Configured provider test placeholder.',
    });
  });
});

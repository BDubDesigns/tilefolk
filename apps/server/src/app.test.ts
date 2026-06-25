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

describe('GET /api/debug/npcs/:npcId/prompt', () => {
  afterEach(() => {
    setServerAdminToken(null);
  });

  it('returns prompt preview for an existing NPC', async () => {
    const app = createApp();
    const worldResponse = await request(app).get('/api/worlds/default');
    const npc = worldResponse.body.npcs[0];

    const response = await request(app).get(`/api/debug/npcs/${npc.id}/prompt`);

    expect(response.status).toBe(200);
    expect(response.body.npc.id).toBe(npc.id);
    expect(response.body.turn).toBe(worldResponse.body.turn);
    expect(response.body.round).toBe(worldResponse.body.round);
    expect(typeof response.body.prompt).toBe('string');
    expect(response.body.prompt.length).toBeGreaterThan(0);
    expect(Array.isArray(response.body.actionOptions)).toBe(true);
    expect(response.body.visibleContext.center).toEqual(npc.position);
    expect(Array.isArray(response.body.recentMemories)).toBe(true);
  });

  it('returns 404 when the NPC does not exist', async () => {
    const app = createApp();

    const response = await request(app).get('/api/debug/npcs/missing_npc/prompt');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'NPC missing_npc not found' });
  });

  it('does not require an admin token', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();
    const worldResponse = await request(app).get('/api/worlds/default');
    const npc = worldResponse.body.npcs[0];

    const response = await request(app).get(`/api/debug/npcs/${npc.id}/prompt`);

    expect(response.status).toBe(200);
  });
});

describe('GET /api/debug/decision-traces', () => {
  afterEach(() => {
    setServerAdminToken(null);
  });

  it('returns an array of decision traces', async () => {
    const app = createApp();

    const response = await request(app).get('/api/debug/decision-traces');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns traces recorded by stepping the active world', async () => {
    const app = createApp();
    await request(app).post('/api/worlds/reset');
    const stepResponse = await request(app).post('/api/worlds/default/step');

    const response = await request(app).get('/api/debug/decision-traces');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].actionResult).toEqual(stepResponse.body.actionResult);
    expect(response.body[0].decisionInput).toBeDefined();
  });

  it('does not require an admin token', async () => {
    setServerAdminToken('secret-token');
    const app = createApp();

    const response = await request(app).get('/api/debug/decision-traces');

    expect(response.status).toBe(200);
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
    // expect body.actionResult.action.type to be a string
    expect(typeof response.body.actionResult.action.type).toBe('string');
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

  it('returns provider test executor results', async () => {
    setServerAdminToken('secret-token');
    const app = createApp({
      runProviderTests: async () => [
        {
          provider: 'cerebras',
          model: 'gpt-oss-120b',
          success: true,
          durationMs: 12,
          message: 'Provider responded.',
        },
      ],
    });

    const response = await request(app)
      .post('/api/providers/test')
      .set('x-tilefolk-admin-token', 'secret-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        provider: 'cerebras',
        model: 'gpt-oss-120b',
        success: true,
        durationMs: 12,
        message: 'Provider responded.',
      },
    ]);
  });
});

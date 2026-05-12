import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';

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

  it('returns the default generated world', async () => {
    //   create app
    const app = createApp();
    //   call GET /api/worlds/default
    const response = await request(app).get('/api/worlds/default');
    //   expect status 200
    expect(response.status).toBe(200);
    //   expect body.width to be 50
    expect(response.body.width).toBe(50);
    //   expect body.height to be 50
    expect(response.body.height).toBe(50);
    //   expect body.npcs to have length 4
    expect(response.body.npcs).toHaveLength(4);
    //   expect body.items to have length 1
    expect(response.body.items).toHaveLength(1);
    //   expect body.trees to have length 20
    expect(response.body.trees).toHaveLength(20);
  });
});

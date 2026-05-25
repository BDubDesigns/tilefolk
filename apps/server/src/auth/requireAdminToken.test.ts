import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requireAdminToken } from './requireAdminToken.js';
import { serverEnv } from '../config/env.js';

function createMockResponse(): Response {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

function createMockRequest(submittedToken?: string): Request {
  return {
    header: vi.fn((headerName: string) => {
      if (headerName === 'x-tilefolk-admin-token') {
        return submittedToken;
      }

      return undefined;
    }),
  } as unknown as Request;
}

function setServerAdminToken(token: string | null): void {
  serverEnv.tilefolkAdminToken = token;
  serverEnv.isAdminTokenConfigured = token !== null;
}

describe('requireAdminToken', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    setServerAdminToken(null);
    vi.restoreAllMocks();
  });

  it('calls next when no admin token is configured outside production', () => {
    process.env.NODE_ENV = 'development';
    setServerAdminToken(null);
    const request = createMockRequest();
    const response = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireAdminToken(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });

  it('rejects in production when no admin token is configured', () => {
    process.env.NODE_ENV = 'production';
    setServerAdminToken(null);
    const request = createMockRequest();
    const response = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireAdminToken(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Admin token required or invalid' });
  });

  it('rejects when an admin token is configured and the request header is missing', () => {
    setServerAdminToken('secret-token');
    const request = createMockRequest();
    const response = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireAdminToken(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Admin token required or invalid' });
  });

  it('rejects when an admin token is configured and the request header is wrong', () => {
    setServerAdminToken('secret-token');
    const request = createMockRequest('wrong-token');
    const response = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireAdminToken(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Admin token required or invalid' });
  });

  it('calls next when an admin token is configured and the request header matches', () => {
    setServerAdminToken('secret-token');
    const request = createMockRequest('secret-token');
    const response = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireAdminToken(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });
});

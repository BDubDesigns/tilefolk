import { serverEnv } from '../config/env.js';
import type { NextFunction, Request, Response } from 'express';

const ADMIN_TOKEN_HEADER = 'x-tilefolk-admin-token';

export function requireAdminToken(request: Request, response: Response, next: NextFunction): void {
  const submittedToken = request.header(ADMIN_TOKEN_HEADER);

  if (serverEnv.isAdminTokenConfigured) {
    if (submittedToken !== serverEnv.tilefolkAdminToken) {
      response.status(401).json({ error: 'Admin token required or invalid' });
      return;
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      response.status(401).json({ error: 'Admin token required or invalid' });
      return;
    }
  }

  next();
}

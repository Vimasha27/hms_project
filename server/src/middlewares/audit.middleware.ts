import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const auditLogger = (req: Request, _res: Response, next: NextFunction) => {
  // Only capture state-altering mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Exclude login endpoint from logging credentials
    if (req.originalUrl.includes('/auth/login')) {
      return next();
    }

    const action = req.method;
    const entityName = req.originalUrl.split('/')[2] || 'SYSTEM';
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    // Clone and sanitize request body (remove passwords if any)
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) delete sanitizedBody.password;
    if (sanitizedBody.passwordHash) delete sanitizedBody.passwordHash;

    // Asynchronously write to audit_logs without blocking the pipeline
    prisma.auditLog
      .create({
        data: {
          userId,
          action,
          entityName,
          details: {
            url: req.originalUrl,
            params: req.params,
            payload: sanitizedBody,
          },
          ipAddress: String(ipAddress),
        },
      })
      .catch((err) => {
        console.error('[Audit Log Error]', err.message);
      });
  }

  next();
};

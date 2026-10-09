import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Please authenticate first', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: You do not have permission to perform this action. Required role: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

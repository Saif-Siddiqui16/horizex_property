import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.util';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'FORBIDDEN',
        `Access denied. Role '${req.user.role}' is not authorized to perform this action`,
        403
      );
    }

    return next();
  };
};


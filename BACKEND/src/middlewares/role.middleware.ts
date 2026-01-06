import { Response, NextFunction } from 'express';
import { AuthRequest } from './firebaseAuth.middleware';

export function requireRole(role: 'USER' | 'MANAGER') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

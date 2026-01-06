import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { db } from "../services/db.service";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export interface AuthRequest extends Request {
  user?: {
    email: string;
    role: 'USER' | 'MANAGER';
  };
}

export default async function firebaseAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email;

    if (!email) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = db
      .prepare(`SELECT role FROM users WHERE email = ?`)
      .get(email) as { role: 'USER' | 'MANAGER' } | undefined;

    if (!user) {
      return res.status(403).json({ message: 'User not registered' });
    }

    req.user = { email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

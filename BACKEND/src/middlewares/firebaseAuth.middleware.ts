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
    name?: string;
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

    let user = db
      .prepare(`SELECT role, name FROM users WHERE email = ?`)
      .get(email) as { role: 'USER' | 'MANAGER'; name: string } | undefined;

    if (!user) {
      const fallbackName = decoded.name || email.split("@")[0] || "Guest";
      db.prepare(
        `INSERT INTO users (name, email, role) VALUES (?, ?, ?)`
      ).run(fallbackName, email, "USER");
      user = { role: "USER", name: fallbackName };
    }

    req.user = { email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

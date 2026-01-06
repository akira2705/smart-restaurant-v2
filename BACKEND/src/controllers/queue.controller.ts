import { Response } from "express";
import { db } from "../services/db.service";
import { AuthRequest } from "../middlewares/firebaseAuth.middleware";

const getUserByEmail = (email: string) =>
  db
    .prepare("SELECT id, name, email FROM users WHERE email = ?")
    .get(email) as { id: number; name: string; email: string } | undefined;

export const getQueue = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT
        id,
        user_id,
        user_name,
        party_size,
        phone,
        status,
        created_at as joined_at
      FROM queue
      WHERE status = 'WAITING'
      ORDER BY created_at ASC
    `).all();

    res.status(200).json({ data: rows, count: rows.length });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch queue",
      error: error.message
    });
  }
};

export const getQueueLength = async (_req: AuthRequest, res: Response) => {
  try {
    const count = (
      db.prepare("SELECT COUNT(*) as count FROM queue WHERE status = 'WAITING'")
        .get() as { count: number }
    ).count;

    res.status(200).json({ count });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch queue length",
      error: error.message
    });
  }
};

export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { party_size, phone } = req.body;

    if (!party_size) {
      return res.status(400).json({ message: "Party size is required" });
    }

    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = getUserByEmail(req.user.email);
    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    const existing = db
      .prepare(
        "SELECT id FROM queue WHERE user_id = ? AND status = 'WAITING'"
      )
      .get(user.id) as { id: number } | undefined;

    if (existing) {
      return res.status(400).json({ message: "User already in queue" });
    }

    const insertStmt = db.prepare(`
      INSERT INTO queue (user_id, user_name, party_size, phone, status)
      VALUES (?, ?, ?, ?, 'WAITING')
    `);
    const result = insertStmt.run(user.id, user.name, party_size, phone || null);

    return res.status(201).json({
      message: "Joined queue successfully",
      queueId: result.lastInsertRowid
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to join queue",
      error: error.message
    });
  }
};

export const leaveQueue = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = getUserByEmail(req.user.email);
    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    const result = db.prepare(`
      UPDATE queue
      SET status = 'CANCELLED'
      WHERE user_id = ? AND status = 'WAITING'
    `).run(user.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "User not in queue" });
    }

    return res.status(200).json({ message: "Left queue successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to leave queue",
      error: error.message
    });
  }
};

export const seatFromQueue = async (_req: AuthRequest, res: Response) => {
  try {
    const queued = db.prepare(`
      SELECT id, user_id, user_name, party_size
      FROM queue
      WHERE status = 'WAITING'
      ORDER BY created_at ASC
      LIMIT 1
    `).get() as { id: number; user_id: number; user_name: string; party_size: number } | undefined;

    if (!queued) {
      return res.status(400).json({
        message: "No customers in queue"
      });
    }

    const table = db.prepare(`
      SELECT id, table_number FROM tables_reservations
      WHERE status = 'AVAILABLE' AND capacity >= ?
      ORDER BY capacity ASC
      LIMIT 1
    `).get(queued.party_size) as { id: number; table_number: number } | undefined;

    if (!table) {
      return res.status(400).json({
        message: "No available tables"
      });
    }

    db.prepare(`
      UPDATE tables_reservations
      SET status = 'OCCUPIED',
          current_customer_id = ?,
          reservation_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(queued.user_id, table.id);

    db.prepare(`
      UPDATE queue
      SET status = 'SEATED'
      WHERE id = ?
    `).run(queued.id);

    return res.status(200).json({
      message: "Customer seated successfully",
      customerId: queued.user_id,
      customerName: queued.user_name,
      tableId: table.id,
      tableNumber: table.table_number
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to seat customer",
      error: error.message
    });
  }
};

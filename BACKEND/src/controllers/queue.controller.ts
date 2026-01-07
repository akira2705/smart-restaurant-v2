import { Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { dbQuery } from "../services/db.service";
import { AuthRequest } from "../middlewares/firebaseAuth.middleware";

const getUserByEmail = async (email: string) => {
  const rows = await dbQuery<Array<{ id: number; name: string; email: string }>>(
    "SELECT id, name, email FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const getQueue = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await dbQuery<any[]>(
      `
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
    `
    );

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
    const rows = await dbQuery<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM queue WHERE status = 'WAITING'"
    );
    const count = rows[0]?.count ?? 0;

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

    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    const existingRows = await dbQuery<Array<{ id: number }>>(
      "SELECT id FROM queue WHERE user_id = ? AND status = 'WAITING'",
      [user.id]
    );
    const existing = existingRows[0];

    if (existing) {
      return res.status(400).json({ message: "User already in queue" });
    }

    const result = await dbQuery<ResultSetHeader>(
      `
      INSERT INTO queue (user_id, user_name, party_size, phone, status)
      VALUES (?, ?, ?, ?, 'WAITING')
    `,
      [user.id, user.name, party_size, phone || null]
    );

    return res.status(201).json({
      message: "Joined queue successfully",
      queueId: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to leave queue",
      error: error.message
    });
  }
};

export const leaveQueue = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    const result = await dbQuery<ResultSetHeader>(
      `
      UPDATE queue
      SET status = 'CANCELLED'
      WHERE user_id = ? AND status = 'WAITING'
    `,
      [user.id]
    );

    if (result.affectedRows === 0) {
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
    const queuedRows = await dbQuery<
      Array<{ id: number; user_id: number; user_name: string; party_size: number }>
    >(
      `
      SELECT id, user_id, user_name, party_size
      FROM queue
      WHERE status = 'WAITING'
      ORDER BY created_at ASC
      LIMIT 1
    `
    );
    const queued = queuedRows[0];

    if (!queued) {
      return res.status(400).json({
        message: "No customers in queue"
      });
    }

    const tableRows = await dbQuery<Array<{ id: number; table_number: number }>>(
      `
      SELECT id, table_number FROM tables_reservations
      WHERE status = 'AVAILABLE' AND capacity >= ?
      ORDER BY capacity ASC
      LIMIT 1
    `,
      [queued.party_size]
    );
    const table = tableRows[0];

    if (!table) {
      return res.status(400).json({
        message: "No available tables"
      });
    }

    await dbQuery<ResultSetHeader>(
      `
      UPDATE tables_reservations
      SET status = 'OCCUPIED',
          current_customer_id = ?,
          reservation_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [queued.user_id, table.id]
    );

    await dbQuery<ResultSetHeader>(
      `
      UPDATE queue
      SET status = 'SEATED'
      WHERE id = ?
    `,
      [queued.id]
    );

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

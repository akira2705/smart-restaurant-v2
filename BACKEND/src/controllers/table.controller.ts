import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { dbQuery } from "../services/db.service";

export const createTable = async (req: Request, res: Response) => {
  try {
    const { table_number, capacity, type } = req.body;

    // Validation
    if (!table_number || !capacity) {
      return res.status(400).json({
        message: "Table number and capacity are required"
      });
    }

    const result = await dbQuery<ResultSetHeader>(
      "INSERT INTO tables_reservations (table_number, capacity, type) VALUES (?, ?, ?)",
      [table_number, capacity, type || "REGULAR"]
    );

    return res.status(201).json({
      message: "Table created successfully",
      tableId: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create table",
      error: error.message
    });
  }
};

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery<any[]>(
      "SELECT id, table_number, capacity, type, status, current_customer_id FROM tables_reservations ORDER BY table_number"
    );

    return res.status(200).json(rows);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch tables",
      error: error.message
    });
  }
};

export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["AVAILABLE", "RESERVED", "OCCUPIED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid table status" });
    }

    const result = await dbQuery<ResultSetHeader>(
      "UPDATE tables_reservations SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.status(200).json({
      message: "Table status updated successfully"
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update table status",
      error: error.message
    });
  }
};

export const reserveTable = async (req: Request, res: Response) => {
  try {
    const { user_id, table_id, reservation_time } = req.body;

    if (!user_id || !table_id || !reservation_time) {
      return res.status(400).json({
        message: "user_id, table_id, and reservation_time are required"
      });
    }

    // Check table availability
    const rows = await dbQuery<any[]>(
      "SELECT status FROM tables_reservations WHERE id = ?",
      [table_id]
    );
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (row.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Table is not available for reservation"
      });
    }

    // Reserve table
    await dbQuery<ResultSetHeader>(
      `UPDATE tables_reservations
       SET status = 'RESERVED',
           current_customer_id = ?,
           reservation_time = ?
       WHERE id = ?`,
      [user_id, reservation_time, table_id]
    );

    return res.status(200).json({
      message: "Table reserved successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to reserve table",
      error: error.message
    });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { table_id } = req.params;

    // Check table state
    const rows = await dbQuery<any[]>(
      "SELECT status FROM tables_reservations WHERE id = ?",
      [table_id]
    );
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (row.status !== "RESERVED") {
      return res.status(400).json({
        message: "Table is not reserved"
      });
    }

    // Cancel reservation
    await dbQuery<ResultSetHeader>(
      `UPDATE tables_reservations
       SET status = 'AVAILABLE',
           current_customer_id = NULL,
           reservation_time = NULL
       WHERE id = ?`,
      [table_id]
    );

    return res.status(200).json({
      message: "Reservation cancelled successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to cancel reservation",
      error: error.message
    });
  }
};

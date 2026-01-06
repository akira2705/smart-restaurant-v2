import { Request, Response } from "express";
import { db } from "../services/db.service";

/* ---------------- CREATE RESERVATION ---------------- */

export const createReservation = (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableType,
      specialRequests
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO reservations
      (name, email, phone, reservation_date, reservation_time, guests, table_type, special_requests, status, table_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL)
    `);

    const result = stmt.run(
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableType,
      specialRequests
    );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create reservation" });
  }
};

/* ---------------- GET RESERVATIONS ---------------- */

export const getReservations = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT
        reservations.*,
        tables_reservations.table_number
      FROM reservations
      LEFT JOIN tables_reservations
        ON tables_reservations.id = reservations.table_id
      ORDER BY reservation_date, reservation_time
    `);

    const rows = stmt.all();

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};


export const confirmReservation = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = db.prepare(`
      SELECT id, guests, status
      FROM reservations
      WHERE id = ?
    `).get(id) as { id: number; guests: number; status: string } | undefined;

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "CONFIRMED") {
      return res.status(200).json({ message: "Reservation already confirmed" });
    }

    if (reservation.status === "CANCELLED") {
      return res.status(400).json({ message: "Reservation is cancelled" });
    }

    // find suitable table
    const table = db.prepare(`
      SELECT id, table_number FROM tables_reservations
      WHERE status = 'AVAILABLE' AND capacity >= ?
      ORDER BY capacity ASC
      LIMIT 1
    `).get(reservation.guests) as { id: number; table_number: number } | undefined;

    if (!table) {
      return res.status(400).json({ message: "No available table" });
    }

    // reserve table
    db.prepare(`
      UPDATE tables_reservations
      SET status = 'RESERVED'
      WHERE id = ?
    `).run(table.id);

    // confirm reservation
    db.prepare(`
      UPDATE reservations
      SET status = 'CONFIRMED', table_id = ?
      WHERE id = ?
    `).run(table.id, id);

    res.json({
      message: "Reservation confirmed",
      tableId: table.id,
      tableNumber: table.table_number
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Confirm failed" });
  }
};

export const cancelReservation = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = db.prepare(`
      SELECT id, table_id, status
      FROM reservations
      WHERE id = ?
    `).get(id) as { id: number; table_id: number | null; status: string } | undefined;

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "CANCELLED") {
      return res.status(200).json({ message: "Reservation already cancelled" });
    }

    if (reservation.table_id) {
      db.prepare(`
        UPDATE tables_reservations
        SET status = 'AVAILABLE'
        WHERE id = ?
      `).run(reservation.table_id);
    }

    db.prepare(`
      UPDATE reservations
      SET status = 'CANCELLED',
          table_id = NULL
      WHERE id = ?
    `).run(id);

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

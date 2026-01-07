import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { dbQuery } from "../services/db.service";

/* ---------------- CREATE RESERVATION ---------------- */

export const createReservation = async (req: Request, res: Response) => {
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

    const result = await dbQuery<ResultSetHeader>(
      `
      INSERT INTO reservations
      (name, email, phone, reservation_date, reservation_time, guests, table_type, special_requests, status, table_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL)
    `,
      [name, email, phone, date, time, guests, tableType, specialRequests]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create reservation" });
  }
};

/* ---------------- GET RESERVATIONS ---------------- */

export const getReservations = async (_req: Request, res: Response) => {
  try {
    const rows = await dbQuery<any[]>(
      `
      SELECT
        reservations.*,
        tables_reservations.table_number
      FROM reservations
      LEFT JOIN tables_reservations
        ON tables_reservations.id = reservations.table_id
      ORDER BY reservation_date, reservation_time
    `
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};


export const confirmReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservationRows = await dbQuery<
      Array<{ id: number; guests: number; status: string }>
    >(
      `
      SELECT id, guests, status
      FROM reservations
      WHERE id = ?
    `,
      [id]
    );
    const reservation = reservationRows[0];

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
    const tableRows = await dbQuery<Array<{ id: number; table_number: number }>>(
      `
      SELECT id, table_number FROM tables_reservations
      WHERE status = 'AVAILABLE' AND capacity >= ?
      ORDER BY capacity ASC
      LIMIT 1
    `,
      [reservation.guests]
    );
    const table = tableRows[0];

    if (!table) {
      return res.status(400).json({ message: "No available table" });
    }

    // reserve table
    await dbQuery<ResultSetHeader>(
      `
      UPDATE tables_reservations
      SET status = 'RESERVED'
      WHERE id = ?
    `,
      [table.id]
    );

    // confirm reservation
    await dbQuery<ResultSetHeader>(
      `
      UPDATE reservations
      SET status = 'CONFIRMED', table_id = ?
      WHERE id = ?
    `,
      [table.id, id]
    );

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

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservationRows = await dbQuery<
      Array<{ id: number; table_id: number | null; status: string }>
    >(
      `
      SELECT id, table_id, status
      FROM reservations
      WHERE id = ?
    `,
      [id]
    );
    const reservation = reservationRows[0];

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "CANCELLED") {
      return res.status(200).json({ message: "Reservation already cancelled" });
    }

    if (reservation.table_id) {
      await dbQuery<ResultSetHeader>(
        `
        UPDATE tables_reservations
        SET status = 'AVAILABLE'
        WHERE id = ?
      `,
        [reservation.table_id]
      );
    }

    await dbQuery<ResultSetHeader>(
      `
      UPDATE reservations
      SET status = 'CANCELLED',
          table_id = NULL
      WHERE id = ?
    `,
      [id]
    );

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

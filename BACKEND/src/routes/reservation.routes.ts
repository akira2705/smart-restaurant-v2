import { Router } from "express";
import {
  createReservation,
  getReservations,
  confirmReservation
} from "../controllers/reservation.controller";

import firebaseAuth from "../middlewares/firebaseAuth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// USER + MANAGER
router.post("/", firebaseAuth, createReservation);
router.get("/", firebaseAuth, getReservations);

// MANAGER ONLY
router.post(
  "/:id/confirm",
  firebaseAuth,
  requireRole("MANAGER"),
  confirmReservation
);

// MANAGER ONLY — CANCEL (UNRESERVE TABLE)
router.post(
  "/:id/cancel",
  firebaseAuth,
  requireRole("MANAGER"),
  (req, res) => {
    const reservationId = Number(req.params.id);

    const { db } = require("../services/db.service");

    const reservation = db
      .prepare("SELECT table_number FROM reservations WHERE id = ?")
      .get(reservationId) as { table_number: number | null } | undefined;

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.table_number !== null) {
      db.prepare(
        `
        UPDATE tables_reservations
        SET status = 'AVAILABLE'
        WHERE table_number = ?
      `
      ).run(reservation.table_number);
    }

    db.prepare(
      `
      UPDATE reservations
      SET status = 'CANCELLED',
          table_number = NULL
      WHERE id = ?
    `
    ).run(reservationId);

    res.json({ message: "Reservation cancelled" });
  }
);

export default router;

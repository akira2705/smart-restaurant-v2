import { Router } from "express";
import { db } from "../services/db.service";

const router = Router();

/*
  MANAGER DASHBOARD COUNTS
*/
router.get(
  "/dashboard",
  (req, res) => {

    const totalTables = (
      db.prepare(
        "SELECT COUNT(*) as count FROM tables_reservations"
      ).get() as { count: number }
    ).count;

    const availableTables = (
      db.prepare(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'AVAILABLE'"
      ).get() as { count: number }
    ).count;

    const reservedTables = (
      db.prepare(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'RESERVED'"
      ).get() as { count: number }
    ).count;

    const occupiedTables = (
      db.prepare(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'OCCUPIED'"
      ).get() as { count: number }
    ).count;

    const pendingReservations = (
      db.prepare(
        "SELECT COUNT(*) as count FROM reservations WHERE status = 'PENDING'"
      ).get() as { count: number }
    ).count;

    res.json({
      totalTables,
      availableTables,
      reservedTables,
      occupiedTables,
      pendingReservations
    });
  }
);

export default router;

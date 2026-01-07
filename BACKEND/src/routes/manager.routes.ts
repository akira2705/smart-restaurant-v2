import { Router } from "express";
import { dbQuery } from "../services/db.service";

const router = Router();

/*
  MANAGER DASHBOARD COUNTS
*/
router.get(
  "/dashboard",
  async (_req, res) => {
    try {
      const totalRows = await dbQuery<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM tables_reservations"
      );
      const availableRows = await dbQuery<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'AVAILABLE'"
      );
      const reservedRows = await dbQuery<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'RESERVED'"
      );
      const occupiedRows = await dbQuery<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM tables_reservations WHERE status = 'OCCUPIED'"
      );
      const pendingRows = await dbQuery<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM reservations WHERE status = 'PENDING'"
      );

      const totalTables = totalRows[0]?.count ?? 0;
      const availableTables = availableRows[0]?.count ?? 0;
      const reservedTables = reservedRows[0]?.count ?? 0;
      const occupiedTables = occupiedRows[0]?.count ?? 0;
      const pendingReservations = pendingRows[0]?.count ?? 0;

      res.json({
        totalTables,
        availableTables,
        reservedTables,
        occupiedTables,
        pendingReservations
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch manager dashboard metrics",
        error: error.message
      });
    }
  }
);

export default router;

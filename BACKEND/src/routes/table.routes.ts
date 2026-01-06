import { Router } from "express";
import {
  createTable,
  getAllTables,
  updateTableStatus,
  reserveTable,
  cancelReservation
} from "../controllers/table.controller";
import firebaseAuth from "../middlewares/firebaseAuth.middleware";

const router = Router();

router.post("/", firebaseAuth, createTable);
router.get("/", firebaseAuth, getAllTables);
router.put("/:id/status", firebaseAuth, updateTableStatus);
router.post("/reserve", firebaseAuth, reserveTable);
router.put("/:table_id/cancel", firebaseAuth, cancelReservation);

export default router;

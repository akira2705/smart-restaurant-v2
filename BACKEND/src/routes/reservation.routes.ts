import { Router } from "express";
import {
  createReservation,
  getReservations,
  confirmReservation,
  cancelReservation
} from "../controllers/reservation.controller";
import firebaseAuth from "../middlewares/firebaseAuth.middleware";
import { requireRole } from "../middlewares/role.middleware";


const router = Router();

// USER + MANAGER
router.post("/", createReservation);
router.get("/", getReservations);

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
  cancelReservation
);

export default router;

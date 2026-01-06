import { Router } from "express";
import {
  createReservation,
  getReservations,
  confirmReservation,
  cancelReservation
} from "../controllers/reservation.controller";


const router = Router();

// USER + MANAGER
router.post("/", createReservation);
router.get("/", getReservations);

// MANAGER ONLY
router.post(
  "/:id/confirm",
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

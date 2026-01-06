import { Router } from "express";
import {
  getQueue,
  getQueueLength,
  joinQueue,
  leaveQueue,
  seatFromQueue
} from "../controllers/queue.controller";

const router = Router();

router.get("/", getQueue);
router.get("/length", getQueueLength);
router.post("/join", joinQueue);
router.post("/leave", leaveQueue);
router.put("/seat", seatFromQueue);
import firebaseAuth from "../middlewares/firebaseAuth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", firebaseAuth, getQueue);
router.get("/length", firebaseAuth, getQueueLength);
router.post("/join", firebaseAuth, joinQueue);
router.post("/leave", firebaseAuth, leaveQueue);
router.put("/seat", firebaseAuth, requireRole("MANAGER"), seatFromQueue);

export default router;

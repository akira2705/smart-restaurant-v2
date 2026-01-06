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

export default router;

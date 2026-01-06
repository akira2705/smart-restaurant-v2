import { Router } from "express";
import { createUser, getCurrentUser, getUserById } from "../controllers/user.controller";
import firebaseAuth from "../middlewares/firebaseAuth.middleware";

const router = Router();

router.post("/", createUser);
router.get("/me", firebaseAuth, getCurrentUser);
router.get("/:id", getUserById);

export default router;

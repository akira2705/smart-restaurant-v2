import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import { initializeDatabase } from "./services/db.service";
import userRoutes from "./routes/user.routes";
import tableRoutes from "./routes/table.routes";
import queueRoutes from "./routes/queue.routes";
import { errorHandler } from "./middlewares/error.middleware";
import reservationRoutes from "./routes/reservation.routes";
import managerRoutes from "./routes/manager.routes";


const app: Application = express();

initializeDatabase().catch((error: unknown) => {
  console.error("Database initialization failed", error);
});

// Middlewares
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/manager", managerRoutes);


// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend server running" });
});

app.use(errorHandler);
export default app;

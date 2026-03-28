import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import exerciseRoutes from "./routes/exercise.routes";
import templateRoutes from "./routes/template.routes";
import programRoutes from "./routes/program.routes";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { httpLogger } from "./middlewares/httpLogger.middleware";

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/programs/templates", templateRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/sessions", sessionRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
app.use(errorHandler);

export default app;

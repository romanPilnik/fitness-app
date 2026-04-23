import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { userRoutes } from "@/features/users";
import { exerciseRoutes } from "@/features/exercises";
import { templateRoutes } from "@/features/templates";
import { programRoutes } from "@/features/programs";
import { sessionRoutes } from "@/features/sessions";
import exercisePerformanceRouter from "@/features/exercisePerformance/exercisePerformance.routes";
import generatedTargetsRouter from "@/features/workoutGeneration/workoutGeneration.routes";
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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(httpLogger);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/programs/templates", templateRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/exercise-performance", exercisePerformanceRouter);
app.use("/api/v1/generated-targets", generatedTargetsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;

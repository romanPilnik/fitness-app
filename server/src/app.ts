import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import exerciseRoutes from "./routes/exercise.routes";
import templateRoutes from "./routes/template.routes";
import programRoutes from "./routes/program.routes";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/programs/templates", templateRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Api is working",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;

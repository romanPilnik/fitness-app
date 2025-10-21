const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const templateRoutes = require("./routes/template.routes");
const programRoutes = require("./routes/Program.routes");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/programs", programRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error", err));

app.get("/", (req, res) => {
  res.json({
    message: "Api is working",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

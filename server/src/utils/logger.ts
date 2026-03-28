import pino from "pino";
import config from "../config/config";

const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "password"],
    censor: "[REDACTED]",
  },
  ...(config.nodeEnv !== "production" && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  }),
});

export default logger;

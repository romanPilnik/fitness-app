import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import logger from "../utils/logger";

export const httpLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
});

import http from "node:http";
import app from "./app";
import config from "./config/config";
import { initSocket } from "./lib/socket";
import logger from "./utils/logger";

const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  logger.info(`Server is running on port ${config.portLabel}`);
});

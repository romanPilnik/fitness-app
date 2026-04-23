import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import config from "../config/config";
import type { RequestUser } from "../types/express";
import { registerGenerationHandlersOnSocket } from "@/features/workoutGeneration/workoutGeneration.socket.js";
import { getRequestUserFromHandshakeHeaders } from "./socketSession";

async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const user = await getRequestUserFromHandshakeHeaders(socket.handshake.headers);
    if (!user) {
      next(new Error("Unauthorized"));
      return;
    }
    (socket.data as { user: RequestUser }).user = user;
    await socket.join(`user:${user.id}`);
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error("Unauthorized"));
  }
}

let io: Server | null = null;

export function getIo(): Server | null {
  return io;
}

export function initSocket(httpServer: HttpServer): Server | null {
  if (!config.aiGenerationEnabled) {
    return null;
  }

  io = new Server(httpServer, {
    cors: {
      origin: config.socketCorsOrigin,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    void authenticateSocket(socket, next);
  });

  io.on("connection", (socket: Socket) => {
    registerGenerationHandlersOnSocket(socket);
  });

  return io;
}

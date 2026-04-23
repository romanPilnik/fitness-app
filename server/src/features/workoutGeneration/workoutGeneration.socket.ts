import type { Socket } from "socket.io";
import { z } from "zod";
import { getIo } from "@/lib/socket";
import type { RequestUser } from "@/types/express";
import logger from "@/utils/logger";
import { runWorkoutGeneration } from "./workoutGeneration.service.js";

const generationStartSchema = z.object({
  sessionId: z.string().min(1),
});

function getSocketUser(socket: Socket): RequestUser {
  return (socket.data as { user: RequestUser }).user;
}

export function registerGenerationHandlersOnSocket(socket: Socket): void {
  socket.on("generation:start", (payload: unknown) => {
    const parsed = generationStartSchema.safeParse(payload);
    if (!parsed.success) {
      logger.debug(
        { userId: getSocketUser(socket).id, payload },
        "generation:start invalid payload",
      );
      return;
    }

    const userId = getSocketUser(socket).id;
    const { sessionId } = parsed.data;

    void runWorkoutGeneration({ userId, sessionId }).catch((err: unknown) => {
      logger.error({ err, userId, sessionId }, "runWorkoutGeneration failed unexpectedly");
      const io = getIo();
      if (io) {
        io.to(`user:${userId}`).emit("generation:status", { status: "failed" });
        io.to(`user:${userId}`).emit("generation:error", {
          message: "An unexpected error occurred during generation",
          code: "INTERNAL_ERROR",
        });
      }
    });
  });
}

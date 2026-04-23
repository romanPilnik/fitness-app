import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import type { Role, Units, WeekStartsOn } from "../generated/prisma/enums";
import type { RequestUser } from "../types/express";
import { auth } from "./auth";

export async function getRequestUserFromHandshakeHeaders(
  headers: IncomingHttpHeaders,
): Promise<RequestUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });

  if (!session) {
    return null;
  }

  const { user } = session;

  if (user.isActive === false) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    isActive: user.isActive ?? true,
    units: user.units as Units,
    weekStartsOn: user.weekStartsOn as WeekStartsOn,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

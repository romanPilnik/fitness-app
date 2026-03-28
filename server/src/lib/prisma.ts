import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "../config/config";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
});

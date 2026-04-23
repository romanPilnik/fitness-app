import path from "node:path";
import { config } from "dotenv";

process.env.VITEST = "true";

config({ path: path.resolve(process.cwd(), ".env.test") });

export {};

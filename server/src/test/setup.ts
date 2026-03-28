import path from "node:path";
import { config } from "dotenv";

// Not set automatically in all Vitest versions; `authLimiter` skips when true.
process.env.VITEST = "true";

// Load first so later imports (e.g. app.ts's dotenv/config) do not override these
// keys. Missing .env.test is fine — fall back to shell / .env from app.
config({ path: path.resolve(process.cwd(), ".env.test") });

// Integration-style HTTP tests need DATABASE_URL, JWT_SECRET, etc. (or a
// dedicated test database) once they hit real auth/DB code paths.

export {};

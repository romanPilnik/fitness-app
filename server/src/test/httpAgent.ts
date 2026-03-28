import request from "supertest";
import app from "@/app.js";

/**
 * Supertest client for the Express app (in-process; no listen()).
 * Use only from HTTP-style specs (e.g. `*.http.test.ts`).
 *
 * Optional later tweaks if logs get noisy: set `NODE_ENV=test` and adjust
 * `httpLogger` / Pino, or narrow `autoLogging` for test runs.
 */
export function testAgent() {
  return request(app);
}

import { describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { testAgent } from "@/test/httpAgent.js";

describe("auth public routes — validation only", () => {
  const agent = testAgent();

  describe("POST /api/v1/auth/register", () => {
    it("returns 400 for invalid email", async () => {
      const res = await agent.post("/api/v1/auth/register").send({
        email: "not-email",
        password: "valid1Pass",
        name: "Ada",
      });

      expect(res.status).toBe(400);
      const body = res.body as ApiError;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(body.error.details).toBeDefined();
    });

    it("returns 400 for short password", async () => {
      const res = await agent.post("/api/v1/auth/register").send({
        email: "ada@example.com",
        password: "short1",
        name: "Ada",
      });

      expect(res.status).toBe(400);
      const body = res.body as ApiError;
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it("returns 400 when name is missing", async () => {
      const res = await agent.post("/api/v1/auth/register").send({
        email: "ada@example.com",
        password: "valid1Pass",
      });

      expect(res.status).toBe(400);
      const body = res.body as ApiError;
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns 400 for invalid email", async () => {
      const res = await agent.post("/api/v1/auth/login").send({
        email: "nope",
        password: "whatever1A",
      });

      expect(res.status).toBe(400);
      const body = res.body as ApiError;
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it("returns 400 when password is missing", async () => {
      const res = await agent.post("/api/v1/auth/login").send({
        email: "ada@example.com",
      });

      expect(res.status).toBe(400);
      const body = res.body as ApiError;
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });
  });
});

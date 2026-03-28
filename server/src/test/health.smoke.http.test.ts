import { describe, expect, it } from "vitest";
import { testAgent } from "./httpAgent.js";

interface HealthJson {
  status: string;
  uptime: number;
  timestamp: number;
}

describe("GET /health", () => {
  it("returns 200 and ok status", async () => {
    const res = await testAgent().get("/health").expect(200);
    const body = res.body as HealthJson;

    expect(body).toMatchObject({
      status: "ok",
    });
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.timestamp).toBe("number");
  });
});

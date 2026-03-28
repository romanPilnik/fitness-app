import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { sendError, sendSuccess } from "./response.js";

function createMockRes() {
  const status = vi.fn();
  const json = vi.fn();
  const send = vi.fn();
  const res = { status, json, send } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  send.mockReturnValue(res);
  return { res, status, json, send };
}

describe("sendSuccess", () => {
  it("sends 200 with data and no message key when message omitted", () => {
    const { res, status, json } = createMockRes();
    sendSuccess(res, { id: 1 });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
    });
  });

  it("includes message when provided", () => {
    const { res, json } = createMockRes();
    sendSuccess(res, { ok: true }, 200, "Done");
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { ok: true },
      message: "Done",
    });
  });

  it("uses 204 with send() and no json", () => {
    const { res, status, json, send } = createMockRes();
    sendSuccess(res, null, 204);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalledWith();
    expect(json).not.toHaveBeenCalled();
  });
});

describe("sendError", () => {
  it("defaults to 500 and code ERROR", () => {
    const { res, status, json } = createMockRes();
    sendError(res, 500, "boom");
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "boom",
        code: "ERROR",
      },
    });
  });

  it("uses custom status and code", () => {
    const { res, status, json } = createMockRes();
    sendError(res, 422, "nope", "INVALID");
    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "nope",
        code: "INVALID",
      },
    });
  });

  it("includes details when provided", () => {
    const { res, json } = createMockRes();
    const details = [{ path: "x", message: "y" }];
    sendError(res, 400, "bad", "VALIDATION_ERROR", details);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "bad",
        code: "VALIDATION_ERROR",
        details,
      },
    });
  });
});

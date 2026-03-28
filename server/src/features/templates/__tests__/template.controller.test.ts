import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockTemplateService = vi.hoisted(() => ({
  getTemplates: vi.fn(),
  getTemplateById: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}));
vi.mock("../template.service.js", () => ({
  TemplateService: mockTemplateService,
}));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { TemplateController } from "../template.controller.js";

function asReqFor<M extends (req: never, res: Response) => unknown>(
  _method: M,
  req: Request,
): Parameters<M>[0] {
  return req as Parameters<M>[0];
}

const fakeUser = {
  id: "u-1",
  email: "a@b.com",
  name: "Test",
  role: "user" as const,
  isActive: true,
  units: "metric" as const,
  weekStartsOn: "sunday" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const adminUser = { ...fakeUser, id: "admin-1", role: "admin" as const };

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: fakeUser,
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as unknown as Request;
}
const res = {} as Response;

describe("TemplateController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTemplates", () => {
    it("passes query and userId to service", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockTemplateService.getTemplates.mockResolvedValue(page);

      await TemplateController.getTemplates(
        asReqFor(
          TemplateController.getTemplates,
          mockReq({ query: { difficulty: "beginner" } as never }),
        ),
        res,
      );

      expect(mockTemplateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: "beginner",
          userId: "u-1",
        }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        page,
        200,
        expect.any(String),
      );
    });

    it("passes undefined userId when req.user is missing", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockTemplateService.getTemplates.mockResolvedValue(page);

      await TemplateController.getTemplates(
        asReqFor(
          TemplateController.getTemplates,
          mockReq({
            user: undefined,
            query: { difficulty: "advanced" } as never,
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockTemplateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: "advanced",
          userId: undefined,
        }),
      );
    });
  });

  describe("getTemplateById", () => {
    it("passes params.id to service", async () => {
      mockTemplateService.getTemplateById.mockResolvedValue({ id: "t-1" });

      await TemplateController.getTemplateById(
        asReqFor(
          TemplateController.getTemplateById,
          mockReq({ params: { id: "t-1" } as never }),
        ),
        res,
      );

      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith({
        id: "t-1",
      });
    });
  });

  describe("createTemplate", () => {
    it("sets createdByUserId to null for admin", async () => {
      mockTemplateService.createTemplate.mockResolvedValue({ id: "t-1" });

      await TemplateController.createTemplate(
        asReqFor(
          TemplateController.createTemplate,
          mockReq({
            user: adminUser,
            body: { name: "PPL", workouts: [] },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockTemplateService.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ createdByUserId: null }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "t-1" },
        201,
        expect.any(String),
      );
    });

    it("sets createdByUserId to user.id for regular user", async () => {
      mockTemplateService.createTemplate.mockResolvedValue({ id: "t-1" });

      await TemplateController.createTemplate(
        asReqFor(
          TemplateController.createTemplate,
          mockReq({ body: { name: "PPL", workouts: [] } } as Partial<Request>),
        ),
        res,
      );

      expect(mockTemplateService.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ createdByUserId: "u-1" }),
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        TemplateController.createTemplate(
          asReqFor(
            TemplateController.createTemplate,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("updateTemplate", () => {
    it("passes templateId, userId, body, and userRole to service", async () => {
      mockTemplateService.updateTemplate.mockResolvedValue({ id: "t-1" });

      await TemplateController.updateTemplate(
        asReqFor(
          TemplateController.updateTemplate,
          mockReq({
            params: { id: "t-1" } as never,
            body: { name: "Updated" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockTemplateService.updateTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: "t-1",
          userId: "u-1",
          name: "Updated",
          userRole: "user",
        }),
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        TemplateController.updateTemplate(
          asReqFor(
            TemplateController.updateTemplate,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("deleteTemplate", () => {
    it("passes templateId, userId, and userRole to service", async () => {
      mockTemplateService.deleteTemplate.mockResolvedValue(undefined);

      await TemplateController.deleteTemplate(
        asReqFor(
          TemplateController.deleteTemplate,
          mockReq({ params: { id: "t-1" } as never }),
        ),
        res,
      );

      expect(mockTemplateService.deleteTemplate).toHaveBeenCalledWith({
        templateId: "t-1",
        userId: "u-1",
        userRole: "user",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        TemplateController.deleteTemplate(
          asReqFor(
            TemplateController.deleteTemplate,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});

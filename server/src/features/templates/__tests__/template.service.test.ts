import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, AuthorizationError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  template: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { TemplateService } from "../template.service.js";

const fakeTemplate = {
  id: "t-1",
  name: "PPL",
  description: "Push Pull Legs",
  daysPerWeek: 6,
  difficulty: "intermediate",
  splitType: "push_pull_legs",
  goal: "hypertrophy",
  createdByUserId: "u-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const systemTemplate = { ...fakeTemplate, id: "t-sys", createdByUserId: null };

describe("TemplateService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTemplates", () => {
    it("returns paginated results with OR filter when myTemplatesOnly is false", async () => {
      prismaMock.template.findMany.mockResolvedValue([fakeTemplate]);

      const result = await TemplateService.getTemplates({
        limit: 20,
        userId: "u-1",
      });

      expect(prismaMock.template.findMany).toHaveBeenCalled();
      const templateFindCall = prismaMock.template.findMany.mock.calls[0];
      if (templateFindCall === undefined) {
        throw new Error("expected template.findMany mock call");
      }
      const findArgs = templateFindCall[0] as {
        where: { OR: { createdByUserId: string | null }[] };
      };
      expect(findArgs.where.OR).toEqual([
        { createdByUserId: null },
        { createdByUserId: "u-1" },
      ]);
      expect(result.data).toHaveLength(1);
    });

    it("filters by createdByUserId when myTemplatesOnly is true", async () => {
      prismaMock.template.findMany.mockResolvedValue([fakeTemplate]);

      await TemplateService.getTemplates({
        limit: 20,
        userId: "u-1",
        myTemplatesOnly: true,
      });

      expect(prismaMock.template.findMany).toHaveBeenCalled();
      const myTemplatesCall = prismaMock.template.findMany.mock.calls[0];
      if (myTemplatesCall === undefined) {
        throw new Error("expected template.findMany mock call");
      }
      const myArgs = myTemplatesCall[0] as {
        where: { createdByUserId: string };
      };
      expect(myArgs.where.createdByUserId).toBe("u-1");
    });
  });

  describe("getTemplateById", () => {
    it("returns template with workouts when found", async () => {
      const tmpl = { ...fakeTemplate, workouts: [] };
      prismaMock.template.findUnique.mockResolvedValue(tmpl);

      const result = await TemplateService.getTemplateById({ id: "t-1" });

      expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
        where: { id: "t-1" },
        include: { workouts: { include: { exercises: true } } },
      });
      expect(result).toEqual(tmpl);
    });

    it("throws NotFoundError when template does not exist", async () => {
      prismaMock.template.findUnique.mockResolvedValue(null);

      await expect(
        TemplateService.getTemplateById({ id: "nope" }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        TemplateService.getTemplateById({ id: "nope" }),
      ).rejects.toMatchObject({
        code: ERROR_CODES.PROGRAM_TEMPLATE_NOT_FOUND,
      });
    });
  });

  describe("createTemplate", () => {
    it("creates template with nested workouts", async () => {
      const created = { ...fakeTemplate, workouts: [] };
      prismaMock.template.create.mockResolvedValue(created);

      const result = await TemplateService.createTemplate({
        name: "PPL",
        daysPerWeek: 6,
        difficulty: "intermediate" as never,
        splitType: "push_pull_legs" as never,
        goal: "hypertrophy" as never,
        createdByUserId: "u-1",
        workouts: [
          {
            name: "Push",
            dayNumber: 1,
            exercises: [{ exerciseId: "ex-1", order: 1, targetSets: 3 }],
          },
        ],
      });

      expect(prismaMock.template.create).toHaveBeenCalled();
      const templateCreateCall = prismaMock.template.create.mock.calls[0];
      if (templateCreateCall === undefined) {
        throw new Error("expected template.create mock call");
      }
      const createArgs = templateCreateCall[0] as {
        data: {
          name: string;
          workouts: { create: unknown };
        };
        include: { workouts: { include: { exercises: boolean } } };
      };
      expect(createArgs.data.name).toBe("PPL");
      expect(Array.isArray(createArgs.data.workouts.create)).toBe(true);
      expect(createArgs.include.workouts.include.exercises).toBe(true);
      expect(result).toEqual(created);
    });
  });

  describe("updateTemplate", () => {
    it("updates when user owns the template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      prismaMock.template.update.mockResolvedValue({
        ...fakeTemplate,
        name: "Updated",
      });

      const result = await TemplateService.updateTemplate({
        templateId: "t-1",
        userId: "u-1",
        userRole: "user" as never,
        name: "Updated",
      });

      expect(prismaMock.template.update).toHaveBeenCalled();
      expect(result.name).toBe("Updated");
    });

    it("allows admin to update system templates", async () => {
      prismaMock.template.findUnique.mockResolvedValue(systemTemplate);
      prismaMock.template.update.mockResolvedValue({
        ...systemTemplate,
        name: "Updated",
      });

      const result = await TemplateService.updateTemplate({
        templateId: "t-sys",
        userId: "admin-1",
        userRole: "admin" as never,
        name: "Updated",
      });

      expect(result.name).toBe("Updated");
    });

    it("throws NotFoundError when template does not exist", async () => {
      prismaMock.template.findUnique.mockResolvedValue(null);

      await expect(
        TemplateService.updateTemplate({
          templateId: "nope",
          userId: "u-1",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws AuthorizationError when non-admin tries to update system template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(systemTemplate);

      await expect(
        TemplateService.updateTemplate({
          templateId: "t-sys",
          userId: "u-1",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("throws AuthorizationError when user does not own user template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);

      await expect(
        TemplateService.updateTemplate({
          templateId: "t-1",
          userId: "other-user",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("replaces workouts via deleteMany and nested create when workouts is provided", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      const updated = {
        ...fakeTemplate,
        name: "PPL v2",
        workouts: [],
      };
      prismaMock.template.update.mockResolvedValue(updated);

      const workoutsPayload = [
        {
          name: "Pull",
          dayNumber: 1,
          exercises: [
            {
              exerciseId: "ex-2",
              order: 1,
              targetSets: 4,
              notes: "optional note",
            },
          ],
        },
      ];

      const result = await TemplateService.updateTemplate({
        templateId: "t-1",
        userId: "u-1",
        userRole: "user" as never,
        name: "PPL v2",
        workouts: workoutsPayload,
      });

      expect(prismaMock.template.update).toHaveBeenCalled();
      const updateCall = prismaMock.template.update.mock.calls[0];
      if (updateCall === undefined) {
        throw new Error("expected template.update mock call");
      }
      const updateArgs = updateCall[0] as {
        data: {
          name: string;
          workouts: {
            deleteMany: Record<string, never>;
            create: {
              name: string;
              dayNumber: number;
              exercises: {
                create: {
                  exerciseId: string;
                  order: number;
                  targetSets: number;
                  notes: string | null;
                }[];
              };
            }[];
          };
        };
      };

      expect(updateArgs.data.name).toBe("PPL v2");
      expect(updateArgs.data.workouts.deleteMany).toEqual({});
      expect(updateArgs.data.workouts.create).toHaveLength(1);
      const firstWorkout = updateArgs.data.workouts.create[0];
      if (firstWorkout === undefined) {
        throw new Error("expected one workout in create payload");
      }
      expect(firstWorkout).toMatchObject({
        name: "Pull",
        dayNumber: 1,
      });
      expect(firstWorkout.exercises.create).toEqual([
        {
          exerciseId: "ex-2",
          order: 1,
          targetSets: 4,
          notes: "optional note",
        },
      ]);
      expect(result).toEqual(updated);
    });
  });

  describe("deleteTemplate", () => {
    it("deletes when user owns the template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      prismaMock.template.delete.mockResolvedValue(undefined);

      await TemplateService.deleteTemplate({
        templateId: "t-1",
        userId: "u-1",
        userRole: "user" as never,
      });

      expect(prismaMock.template.delete).toHaveBeenCalledWith({
        where: { id: "t-1" },
      });
    });

    it("allows admin to delete system templates", async () => {
      prismaMock.template.findUnique.mockResolvedValue(systemTemplate);
      prismaMock.template.delete.mockResolvedValue(undefined);

      await TemplateService.deleteTemplate({
        templateId: "t-sys",
        userId: "admin-1",
        userRole: "admin" as never,
      });

      expect(prismaMock.template.delete).toHaveBeenCalled();
    });

    it("throws NotFoundError when template does not exist", async () => {
      prismaMock.template.findUnique.mockResolvedValue(null);

      await expect(
        TemplateService.deleteTemplate({
          templateId: "nope",
          userId: "u-1",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws AuthorizationError when non-admin tries to delete system template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(systemTemplate);

      await expect(
        TemplateService.deleteTemplate({
          templateId: "t-sys",
          userId: "u-1",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("throws AuthorizationError when user does not own user template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);

      await expect(
        TemplateService.deleteTemplate({
          templateId: "t-1",
          userId: "other-user",
          userRole: "user" as never,
        }),
      ).rejects.toThrow(AuthorizationError);
    });
  });
});

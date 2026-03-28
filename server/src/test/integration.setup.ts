import { afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma.js";

const truncateSql = `
  TRUNCATE TABLE
    "SessionExerciseSet",
    "SessionExercise",
    "Session",
    "ProgramWorkoutExercise",
    "ProgramWorkout",
    "Program",
    "TemplateWorkoutExercise",
    "TemplateWorkout",
    "Template",
    "Exercise",
    "User"
  RESTART IDENTITY CASCADE;
`;

beforeEach(async () => {
  await prisma.$executeRawUnsafe(truncateSql);
});

afterAll(async () => {
  await prisma.$disconnect();
});

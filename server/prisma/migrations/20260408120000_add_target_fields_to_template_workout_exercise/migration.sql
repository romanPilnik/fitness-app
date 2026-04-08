-- AlterTable
ALTER TABLE "TemplateWorkoutExercise" ADD COLUMN "targetWeight" DOUBLE PRECISION,
ADD COLUMN "targetTotalReps" INTEGER,
ADD COLUMN "targetTopSetReps" INTEGER,
ADD COLUMN "targetRir" INTEGER;

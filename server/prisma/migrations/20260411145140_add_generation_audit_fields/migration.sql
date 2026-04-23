-- AlterTable
ALTER TABLE "GeneratedWorkout" ADD COLUMN     "latencyMs" INTEGER,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenInput" INTEGER,
ADD COLUMN     "tokenOutput" INTEGER;

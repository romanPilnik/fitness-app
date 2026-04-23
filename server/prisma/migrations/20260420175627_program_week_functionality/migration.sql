-- CreateEnum
CREATE TYPE "ProgramScheduleKind" AS ENUM ('sync_week', 'async_block');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('planned', 'completed', 'skipped', 'cancelled');

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "lengthWeeks" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "scheduleKind" "ProgramScheduleKind" NOT NULL DEFAULT 'sync_week',
ADD COLUMN     "schedulePattern" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "ProgramWorkout" ADD COLUMN     "sequenceIndex" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ProgramWorkoutOccurrence" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "programWorkoutId" TEXT NOT NULL,
    "scheduledOn" DATE NOT NULL,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'planned',
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramWorkoutOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramWorkoutOccurrence_sessionId_key" ON "ProgramWorkoutOccurrence"("sessionId");

-- CreateIndex
CREATE INDEX "ProgramWorkoutOccurrence_programId_scheduledOn_idx" ON "ProgramWorkoutOccurrence"("programId", "scheduledOn");

-- CreateIndex
CREATE INDEX "ProgramWorkoutOccurrence_programId_status_idx" ON "ProgramWorkoutOccurrence"("programId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramWorkoutOccurrence_programId_scheduledOn_key" ON "ProgramWorkoutOccurrence"("programId", "scheduledOn");

-- AddForeignKey
ALTER TABLE "ProgramWorkoutOccurrence" ADD CONSTRAINT "ProgramWorkoutOccurrence_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutOccurrence" ADD CONSTRAINT "ProgramWorkoutOccurrence_programWorkoutId_fkey" FOREIGN KEY ("programWorkoutId") REFERENCES "ProgramWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutOccurrence" ADD CONSTRAINT "ProgramWorkoutOccurrence_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

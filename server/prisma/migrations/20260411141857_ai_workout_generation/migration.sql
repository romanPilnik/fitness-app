-- CreateEnum
CREATE TYPE "GeneratedWorkoutStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "programWorkoutId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiConfig" JSONB;

-- CreateTable
CREATE TABLE "GeneratedWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "programWorkoutId" TEXT NOT NULL,
    "triggerSessionId" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "status" "GeneratedWorkoutStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedWorkoutExercise" (
    "id" TEXT NOT NULL,
    "generatedWorkoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetRir" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedWorkoutExerciseSet" (
    "id" TEXT NOT NULL,
    "generatedWorkoutExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "targetRir" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedWorkoutExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedWorkout_triggerSessionId_key" ON "GeneratedWorkout"("triggerSessionId");

-- CreateIndex
CREATE INDEX "GeneratedWorkout_programWorkoutId_status_createdAt_idx" ON "GeneratedWorkout"("programWorkoutId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedWorkoutExerciseSet_generatedWorkoutExerciseId_setN_key" ON "GeneratedWorkoutExerciseSet"("generatedWorkoutExerciseId", "setNumber");

-- CreateIndex
CREATE INDEX "Session_programWorkoutId_idx" ON "Session"("programWorkoutId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_programWorkoutId_fkey" FOREIGN KEY ("programWorkoutId") REFERENCES "ProgramWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkout" ADD CONSTRAINT "GeneratedWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkout" ADD CONSTRAINT "GeneratedWorkout_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkout" ADD CONSTRAINT "GeneratedWorkout_programWorkoutId_fkey" FOREIGN KEY ("programWorkoutId") REFERENCES "ProgramWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkout" ADD CONSTRAINT "GeneratedWorkout_triggerSessionId_fkey" FOREIGN KEY ("triggerSessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkoutExercise" ADD CONSTRAINT "GeneratedWorkoutExercise_generatedWorkoutId_fkey" FOREIGN KEY ("generatedWorkoutId") REFERENCES "GeneratedWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkoutExercise" ADD CONSTRAINT "GeneratedWorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWorkoutExerciseSet" ADD CONSTRAINT "GeneratedWorkoutExerciseSet_generatedWorkoutExerciseId_fkey" FOREIGN KEY ("generatedWorkoutExerciseId") REFERENCES "GeneratedWorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

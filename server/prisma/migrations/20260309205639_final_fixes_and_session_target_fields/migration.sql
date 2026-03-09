/*
  Warnings:

  - Changed the type of `difficulty` on the `Program` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `goal` on the `Program` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `programId` to the `ProgramWorkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetSets` to the `ProgramWorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `datePerformed` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetSets` to the `SessionExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SessionExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rir` to the `SessionExerciseSet` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `goal` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('strength', 'hypertrophy', 'endurance');

-- DropForeignKey
ALTER TABLE "Program" DROP CONSTRAINT "Program_sourceTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramWorkoutExercise" DROP CONSTRAINT "ProgramWorkoutExercise_programWorkoutId_fkey";

-- AlterTable
ALTER TABLE "Program" ALTER COLUMN "sourceTemplateId" DROP NOT NULL,
ALTER COLUMN "sourceTemplateName" DROP NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
DROP COLUMN "goal",
ADD COLUMN     "goal" "Goal" NOT NULL;

-- AlterTable
ALTER TABLE "ProgramWorkout" ADD COLUMN     "programId" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProgramWorkoutExercise" ADD COLUMN     "targetRir" INTEGER,
ADD COLUMN     "targetSets" INTEGER NOT NULL,
ADD COLUMN     "targetTopSetReps" INTEGER,
ADD COLUMN     "targetTotalReps" INTEGER,
ADD COLUMN     "targetWeight" INTEGER,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "datePerformed" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SessionExercise" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetRir" INTEGER,
ADD COLUMN     "targetSets" INTEGER NOT NULL,
ADD COLUMN     "targetTopSetReps" INTEGER,
ADD COLUMN     "targetTotalReps" INTEGER,
ADD COLUMN     "targetWeight" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SessionExerciseSet" ADD COLUMN     "rir" INTEGER NOT NULL,
ADD COLUMN     "targetReps" INTEGER,
ADD COLUMN     "targetWeight" INTEGER;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "goal",
ADD COLUMN     "goal" "Goal" NOT NULL;

-- DropEnum
DROP TYPE "Difficulties";

-- DropEnum
DROP TYPE "Goals";

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkout" ADD CONSTRAINT "ProgramWorkout_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutExercise" ADD CONSTRAINT "ProgramWorkoutExercise_programWorkoutId_fkey" FOREIGN KEY ("programWorkoutId") REFERENCES "ProgramWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

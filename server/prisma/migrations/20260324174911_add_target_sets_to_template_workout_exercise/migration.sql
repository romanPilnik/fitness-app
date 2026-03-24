/*
  Warnings:

  - Added the required column `targetSets` to the `TemplateWorkoutExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TemplateWorkoutExercise" ADD COLUMN     "targetSets" INTEGER NOT NULL;

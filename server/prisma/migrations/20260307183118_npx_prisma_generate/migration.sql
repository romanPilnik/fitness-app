-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Units" AS ENUM ('metric', 'imperial');

-- CreateEnum
CREATE TYPE "WeekStartsOn" AS ENUM ('sunday', 'monday', 'saturday');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('compound', 'isolation');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell', 'none');

-- CreateEnum
CREATE TYPE "MovementPattern" AS ENUM ('horizontal_push', 'vertical_push', 'incline_push', 'horizontal_pull', 'vertical_pull', 'squat', 'hip_hinge', 'elbow_flexion', 'elbow_extension', 'side_shoulder_isolation', 'rear_shoulder_isolation', 'quad_isolation', 'hamstring_isolation', 'glute_isolation', 'calf_isolation', 'core', 'carry');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('chest', 'back', 'biceps', 'triceps', 'shoulders', 'forearms', 'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'traps', 'lats');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "Goals" AS ENUM ('strength', 'hypertrophy', 'endurance');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('full_body', 'push_pull_legs', 'upper_lower', 'arnold', 'modified_full_body', 'other');

-- CreateEnum
CREATE TYPE "ProgramSources" AS ENUM ('template', 'scratch', 'shared');

-- CreateEnum
CREATE TYPE "Difficulties" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "ProgramStatuses" AS ENUM ('active', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "SessionStatuses" AS ENUM ('completed', 'partially', 'skipped');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "units" "Units" NOT NULL DEFAULT 'metric',
    "weekStartsOn" "WeekStartsOn" NOT NULL DEFAULT 'sunday',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "equipment" "Equipment" NOT NULL DEFAULT 'none',
    "movementPattern" "MovementPattern" NOT NULL,
    "primaryMuscle" "MuscleGroup" NOT NULL,
    "secondaryMuscles" "MuscleGroup"[],
    "instructions" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "daysPerWeek" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "splitType" "SplitType" NOT NULL DEFAULT 'other',
    "goal" "Goals" NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateWorkout" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateWorkoutExercise" (
    "id" TEXT NOT NULL,
    "templateWorkoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceTemplateId" TEXT NOT NULL,
    "sourceTemplateName" TEXT NOT NULL,
    "createdFrom" "ProgramSources" NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulties" NOT NULL,
    "goal" "Goals" NOT NULL,
    "splitType" "SplitType" NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "status" "ProgramStatuses" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWorkout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWorkoutExercise" (
    "id" TEXT NOT NULL,
    "programWorkoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "workoutName" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "sessionStatus" "SessionStatuses" NOT NULL,
    "sessionDuration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExerciseSet" (
    "id" TEXT NOT NULL,
    "sessionExerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "setCompleted" BOOLEAN NOT NULL,

    CONSTRAINT "SessionExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_createdByUserId_key" ON "Exercise"("name", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_createdByUserId_key" ON "Template"("name", "createdByUserId");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateWorkout" ADD CONSTRAINT "TemplateWorkout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateWorkoutExercise" ADD CONSTRAINT "TemplateWorkoutExercise_templateWorkoutId_fkey" FOREIGN KEY ("templateWorkoutId") REFERENCES "TemplateWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateWorkoutExercise" ADD CONSTRAINT "TemplateWorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutExercise" ADD CONSTRAINT "ProgramWorkoutExercise_programWorkoutId_fkey" FOREIGN KEY ("programWorkoutId") REFERENCES "ProgramWorkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutExercise" ADD CONSTRAINT "ProgramWorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExerciseSet" ADD CONSTRAINT "SessionExerciseSet_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExerciseSet" ADD CONSTRAINT "SessionExerciseSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

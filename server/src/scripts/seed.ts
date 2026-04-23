import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import {
  Difficulty,
  Equipment,
  ExerciseCategory,
  Goal,
  MovementPattern,
  MuscleGroup,
  Role,
  SplitType,
  Units,
  WeekStartsOn,
} from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

interface ExerciseSeedRow {
  name: string;
  equipment: (typeof Equipment)[keyof typeof Equipment];
  primaryMuscle: (typeof MuscleGroup)[keyof typeof MuscleGroup];
  secondaryMuscles: (typeof MuscleGroup)[keyof typeof MuscleGroup][];
  category: (typeof ExerciseCategory)[keyof typeof ExerciseCategory];
  movementPattern: (typeof MovementPattern)[keyof typeof MovementPattern];
}

const exerciseSeeds: ExerciseSeedRow[] = [
  {
    name: "Barbell Bench Press",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.chest,
    secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.shoulders],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.horizontal_push,
  },
  {
    name: "Barbell Squat",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.quads,
    secondaryMuscles: [MuscleGroup.glutes, MuscleGroup.hamstrings],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.squat,
  },
  {
    name: "Conventional Deadlift",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.back,
    secondaryMuscles: [MuscleGroup.hamstrings, MuscleGroup.glutes],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.hip_hinge,
  },
  {
    name: "Overhead Press",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.shoulders,
    secondaryMuscles: [MuscleGroup.triceps],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.vertical_push,
  },
  {
    name: "Barbell Row",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.back,
    secondaryMuscles: [MuscleGroup.biceps, MuscleGroup.lats],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.horizontal_pull,
  },
  {
    name: "Pull Up",
    equipment: Equipment.bodyweight,
    primaryMuscle: MuscleGroup.lats,
    secondaryMuscles: [MuscleGroup.biceps, MuscleGroup.back],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.vertical_pull,
  },
  {
    name: "Dumbbell Lateral Raise",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.shoulders,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.side_shoulder_isolation,
  },
  {
    name: "Dumbbell Bicep Curl",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.biceps,
    secondaryMuscles: [MuscleGroup.forearms],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.elbow_flexion,
  },
  {
    name: "Tricep Pushdown",
    equipment: Equipment.cable,
    primaryMuscle: MuscleGroup.triceps,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.elbow_extension,
  },
  {
    name: "Leg Curl",
    equipment: Equipment.machine,
    primaryMuscle: MuscleGroup.hamstrings,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.hamstring_isolation,
  },
  {
    name: "Romanian Deadlift",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.hamstrings,
    secondaryMuscles: [MuscleGroup.glutes, MuscleGroup.back],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.hip_hinge,
  },
  {
    name: "Front Squat",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.quads,
    secondaryMuscles: [MuscleGroup.glutes, MuscleGroup.abs],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.squat,
  },
  {
    name: "Incline Dumbbell Press",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.chest,
    secondaryMuscles: [MuscleGroup.shoulders, MuscleGroup.triceps],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.incline_push,
  },
  {
    name: "Lat Pulldown",
    equipment: Equipment.cable,
    primaryMuscle: MuscleGroup.lats,
    secondaryMuscles: [MuscleGroup.biceps],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.vertical_pull,
  },
  {
    name: "Face Pull",
    equipment: Equipment.cable,
    primaryMuscle: MuscleGroup.shoulders,
    secondaryMuscles: [MuscleGroup.traps],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.rear_shoulder_isolation,
  },
  {
    name: "Plank",
    equipment: Equipment.bodyweight,
    primaryMuscle: MuscleGroup.abs,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.core,
  },
  {
    name: "Bulgarian Split Squat",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.quads,
    secondaryMuscles: [MuscleGroup.glutes],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.squat,
  },
  {
    name: "Cable Fly",
    equipment: Equipment.cable,
    primaryMuscle: MuscleGroup.chest,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.horizontal_push,
  },
  {
    name: "Dumbbell Shrug",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.traps,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.carry,
  },
  {
    name: "Kettlebell Swing",
    equipment: Equipment.kettlebell,
    primaryMuscle: MuscleGroup.glutes,
    secondaryMuscles: [MuscleGroup.hamstrings, MuscleGroup.back],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.hip_hinge,
  },
  {
    name: "Leg Press",
    equipment: Equipment.machine,
    primaryMuscle: MuscleGroup.quads,
    secondaryMuscles: [MuscleGroup.glutes],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.squat,
  },
  {
    name: "Standing Calf Raise",
    equipment: Equipment.machine,
    primaryMuscle: MuscleGroup.calves,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.calf_isolation,
  },
  {
    name: "Hanging Leg Raise",
    equipment: Equipment.bodyweight,
    primaryMuscle: MuscleGroup.abs,
    secondaryMuscles: [],
    category: ExerciseCategory.isolation,
    movementPattern: MovementPattern.core,
  },
  {
    name: "Arnold Press",
    equipment: Equipment.dumbbell,
    primaryMuscle: MuscleGroup.shoulders,
    secondaryMuscles: [MuscleGroup.triceps],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.vertical_push,
  },
  {
    name: "Barbell Hip Thrust",
    equipment: Equipment.barbell,
    primaryMuscle: MuscleGroup.glutes,
    secondaryMuscles: [MuscleGroup.hamstrings],
    category: ExerciseCategory.compound,
    movementPattern: MovementPattern.hip_hinge,
  },
];

/** Exercise list index → Prisma exercise id (filled after insert). */
type ExerciseIds = string[];

function tplEx(
  exerciseIndex: number,
  order: number,
  targetSets: number,
  targets?: {
    targetWeight?: number;
    targetTopSetReps?: number;
    targetTotalReps?: number;
    targetRir?: number;
  },
): {
  exerciseIndex: number;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTopSetReps?: number;
  targetTotalReps?: number;
  targetRir?: number;
} {
  return { exerciseIndex, order, targetSets, ...targets };
}

interface TemplateWorkoutDef {
  name: string;
  dayNumber: number;
  exercises: ReturnType<typeof tplEx>[];
}

interface TemplateDef {
  name: string;
  description: string;
  daysPerWeek: number;
  difficulty: (typeof Difficulty)[keyof typeof Difficulty];
  splitType: (typeof SplitType)[keyof typeof SplitType];
  goal: (typeof Goal)[keyof typeof Goal];
  workouts: TemplateWorkoutDef[];
}

const templateDefinitions: TemplateDef[] = [
  {
    name: "Full Body Strength",
    description: "A balanced full body program for building strength",
    daysPerWeek: 3,
    difficulty: Difficulty.beginner,
    splitType: SplitType.full_body,
    goal: Goal.strength,
    workouts: [
      {
        name: "Full Body A",
        dayNumber: 1,
        exercises: [
          tplEx(0, 1, 4, { targetWeight: 80, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(1, 2, 4, { targetWeight: 100, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(4, 3, 3, { targetWeight: 70, targetTopSetReps: 8, targetTotalReps: 24, targetRir: 2 }),
          tplEx(7, 4, 3, { targetWeight: 14, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
      {
        name: "Full Body B",
        dayNumber: 2,
        exercises: [
          tplEx(2, 1, 4, { targetWeight: 140, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(3, 2, 4, { targetWeight: 50, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(5, 3, 3, { targetTopSetReps: 8, targetTotalReps: 24, targetRir: 2 }),
          tplEx(8, 4, 3, { targetWeight: 25, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
      {
        name: "Full Body C",
        dayNumber: 3,
        exercises: [
          tplEx(0, 1, 3, { targetWeight: 75, targetTopSetReps: 8, targetTotalReps: 24, targetRir: 2 }),
          tplEx(1, 2, 3, { targetWeight: 90, targetTopSetReps: 8, targetTotalReps: 24, targetRir: 2 }),
          tplEx(6, 3, 3, { targetWeight: 10, targetTopSetReps: 15, targetTotalReps: 45, targetRir: 1 }),
          tplEx(9, 4, 3, { targetWeight: 40, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
    ],
  },
  {
    name: "Push Pull Legs",
    description: "Classic PPL split for intermediate lifters",
    daysPerWeek: 6,
    difficulty: Difficulty.intermediate,
    splitType: SplitType.push_pull_legs,
    goal: Goal.hypertrophy,
    workouts: [
      {
        name: "Push",
        dayNumber: 1,
        exercises: [
          tplEx(0, 1, 4, { targetWeight: 85, targetTopSetReps: 8, targetTotalReps: 32, targetRir: 2 }),
          tplEx(3, 2, 4, { targetWeight: 55, targetTopSetReps: 8, targetTotalReps: 32, targetRir: 2 }),
          tplEx(6, 3, 3, { targetWeight: 12, targetTopSetReps: 15, targetTotalReps: 45, targetRir: 1 }),
          tplEx(8, 4, 3, { targetWeight: 30, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
      {
        name: "Pull",
        dayNumber: 2,
        exercises: [
          tplEx(4, 1, 4, { targetWeight: 75, targetTopSetReps: 8, targetTotalReps: 32, targetRir: 2 }),
          tplEx(5, 2, 4, { targetTopSetReps: 10, targetTotalReps: 40, targetRir: 2 }),
          tplEx(7, 3, 3, { targetWeight: 16, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
      {
        name: "Legs",
        dayNumber: 3,
        exercises: [
          tplEx(1, 1, 4, { targetWeight: 110, targetTopSetReps: 8, targetTotalReps: 32, targetRir: 2 }),
          tplEx(2, 2, 3, { targetWeight: 150, targetTopSetReps: 5, targetTotalReps: 15, targetRir: 2 }),
          tplEx(9, 3, 3, { targetWeight: 45, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
    ],
  },
  {
    name: "Upper Lower Split",
    description: "Upper/Lower split focused on strength and size",
    daysPerWeek: 4,
    difficulty: Difficulty.intermediate,
    splitType: SplitType.upper_lower,
    goal: Goal.strength,
    workouts: [
      {
        name: "Upper A",
        dayNumber: 1,
        exercises: [
          tplEx(0, 1, 4, { targetWeight: 90, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(4, 2, 4, { targetWeight: 80, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(3, 3, 3, { targetWeight: 55, targetTopSetReps: 8, targetTotalReps: 24, targetRir: 2 }),
          tplEx(7, 4, 3, { targetWeight: 16, targetTopSetReps: 10, targetTotalReps: 30, targetRir: 1 }),
          tplEx(8, 5, 3, { targetWeight: 28, targetTopSetReps: 10, targetTotalReps: 30, targetRir: 1 }),
        ],
      },
      {
        name: "Lower A",
        dayNumber: 2,
        exercises: [
          tplEx(1, 1, 4, { targetWeight: 120, targetTopSetReps: 5, targetTotalReps: 20, targetRir: 2 }),
          tplEx(2, 2, 3, { targetWeight: 160, targetTopSetReps: 5, targetTotalReps: 15, targetRir: 2 }),
          tplEx(9, 3, 3, { targetWeight: 50, targetTopSetReps: 10, targetTotalReps: 30, targetRir: 1 }),
        ],
      },
      {
        name: "Upper B",
        dayNumber: 3,
        exercises: [
          tplEx(0, 1, 3, { targetWeight: 80, targetTopSetReps: 10, targetTotalReps: 30, targetRir: 2 }),
          tplEx(5, 2, 4, { targetTopSetReps: 8, targetTotalReps: 32, targetRir: 2 }),
          tplEx(6, 3, 3, { targetWeight: 12, targetTopSetReps: 15, targetTotalReps: 45, targetRir: 1 }),
          tplEx(7, 4, 3, { targetWeight: 14, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
          tplEx(8, 5, 3, { targetWeight: 25, targetTopSetReps: 12, targetTotalReps: 36, targetRir: 1 }),
        ],
      },
      {
        name: "Lower B",
        dayNumber: 4,
        exercises: [
          tplEx(1, 1, 3, { targetWeight: 100, targetTopSetReps: 10, targetTotalReps: 30, targetRir: 2 }),
          tplEx(9, 2, 4, { targetWeight: 45, targetTopSetReps: 12, targetTotalReps: 48, targetRir: 1 }),
        ],
      },
    ],
  },
];

async function clearDatabase(): Promise<void> {
  await prisma.sessionExerciseSet.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.generatedWorkout.deleteMany();
  await prisma.session.deleteMany();
  await prisma.programWorkoutExercise.deleteMany();
  await prisma.programWorkout.deleteMany();
  await prisma.program.deleteMany();
  await prisma.templateWorkoutExercise.deleteMany();
  await prisma.templateWorkout.deleteMany();
  await prisma.template.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.user.deleteMany();
}

/** Better Auth email/password: credential `Account` row holds the password hash. */
async function createCredentialAccount(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await prisma.account.create({
    data: {
      id: randomUUID(),
      userId,
      providerId: "credential",
      accountId: userId,
      password: passwordHash,
    },
  });
}

function exerciseIdAt(ids: ExerciseIds, index: number): string {
  const id = ids[index];
  if (id === undefined) {
    throw new Error(`Invalid exercise index: ${String(index)}`);
  }
  return id;
}

async function seedTemplates(ids: ExerciseIds): Promise<void> {
  for (const def of templateDefinitions) {
    await prisma.template.create({
      data: {
        name: def.name,
        description: def.description,
        daysPerWeek: def.daysPerWeek,
        difficulty: def.difficulty,
        splitType: def.splitType,
        goal: def.goal,
        createdByUserId: null,
        workouts: {
          create: def.workouts.map((w) => ({
            name: w.name,
            dayNumber: w.dayNumber,
            exercises: {
              create: w.exercises.map((ex) => ({
                exerciseId: exerciseIdAt(ids, ex.exerciseIndex),
                order: ex.order,
                targetSets: ex.targetSets,
                targetWeight: ex.targetWeight ?? null,
                targetTopSetReps: ex.targetTopSetReps ?? null,
                targetTotalReps: ex.targetTotalReps ?? null,
                targetRir: ex.targetRir ?? null,
              })),
            },
          })),
        },
      },
    });
  }
}

async function seed(): Promise<void> {
  try {
    console.log("Clearing existing data...");
    await clearDatabase();
    console.log("Cleared related tables");

    console.log("Creating exercises...");
    const createdExercises = await prisma.$transaction(
      exerciseSeeds.map((data) =>
        prisma.exercise.create({
          data: { ...data, createdByUserId: null },
        }),
      ),
    );
    const exerciseIds = createdExercises.map((e) => e.id);
    console.log(`Created ${String(createdExercises.length)} exercises`);

    console.log("Creating test users...");
    const hashedPassword = await hashPassword("password123");
    const regularUser = await prisma.user.create({
      data: {
        email: "test@test.com",
        name: "Test User",
        role: Role.user,
        units: Units.metric,
        weekStartsOn: WeekStartsOn.monday,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        name: "Admin User",
        role: Role.admin,
        units: Units.metric,
        weekStartsOn: WeekStartsOn.monday,
      },
    });
    console.log(`Created users: ${regularUser.email} (user), ${adminUser.email} (admin)`);

    await createCredentialAccount(regularUser.id, hashedPassword);
    await createCredentialAccount(adminUser.id, hashedPassword);
    console.log("Created Better Auth credential accounts for seeded users");

    console.log("Creating program templates...");
    await seedTemplates(exerciseIds);
    const templateCount = templateDefinitions.length;
    console.log(`Created ${String(templateCount)} program templates`);

    console.log("\n--- Seed Complete ---");
    console.log("Regular user:");
    console.log("  Email: test@test.com");
    console.log("  Password: password123");
    console.log("Admin user:");
    console.log("  Email: admin@test.com");
    console.log("  Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void seed();

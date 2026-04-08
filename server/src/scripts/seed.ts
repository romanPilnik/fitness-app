import bcrypt from "bcryptjs";
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
];

/** Exercise list index → Prisma exercise id (filled after insert). */
type ExerciseIds = string[];

function tplEx(
  exerciseIndex: number,
  order: number,
  targetSets: number,
): { exerciseIndex: number; order: number; targetSets: number } {
  return { exerciseIndex, order, targetSets };
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
          tplEx(0, 1, 4),
          tplEx(1, 2, 4),
          tplEx(4, 3, 3),
          tplEx(7, 4, 3),
        ],
      },
      {
        name: "Full Body B",
        dayNumber: 2,
        exercises: [
          tplEx(2, 1, 4),
          tplEx(3, 2, 4),
          tplEx(5, 3, 3),
          tplEx(8, 4, 3),
        ],
      },
      {
        name: "Full Body C",
        dayNumber: 3,
        exercises: [
          tplEx(0, 1, 3),
          tplEx(1, 2, 3),
          tplEx(6, 3, 3),
          tplEx(9, 4, 3),
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
          tplEx(0, 1, 4),
          tplEx(3, 2, 4),
          tplEx(6, 3, 3),
          tplEx(8, 4, 3),
        ],
      },
      {
        name: "Pull",
        dayNumber: 2,
        exercises: [tplEx(4, 1, 4), tplEx(5, 2, 4), tplEx(7, 3, 3)],
      },
      {
        name: "Legs",
        dayNumber: 3,
        exercises: [tplEx(1, 1, 4), tplEx(2, 2, 3), tplEx(9, 3, 3)],
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
          tplEx(0, 1, 4),
          tplEx(4, 2, 4),
          tplEx(3, 3, 3),
          tplEx(7, 4, 3),
          tplEx(8, 5, 3),
        ],
      },
      {
        name: "Lower A",
        dayNumber: 2,
        exercises: [tplEx(1, 1, 4), tplEx(2, 2, 3), tplEx(9, 3, 3)],
      },
      {
        name: "Upper B",
        dayNumber: 3,
        exercises: [
          tplEx(0, 1, 3),
          tplEx(5, 2, 4),
          tplEx(6, 3, 3),
          tplEx(7, 4, 3),
          tplEx(8, 5, 3),
        ],
      },
      {
        name: "Lower B",
        dayNumber: 4,
        exercises: [tplEx(1, 1, 3), tplEx(9, 2, 4)],
      },
    ],
  },
];

async function clearDatabase(): Promise<void> {
  await prisma.sessionExerciseSet.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.session.deleteMany();
  await prisma.programWorkoutExercise.deleteMany();
  await prisma.programWorkout.deleteMany();
  await prisma.program.deleteMany();
  await prisma.templateWorkoutExercise.deleteMany();
  await prisma.templateWorkout.deleteMany();
  await prisma.template.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();
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
    const hashedPassword = await bcrypt.hash("password123", 10);
    const regularUser = await prisma.user.create({
      data: {
        email: "test@test.com",
        password: hashedPassword,
        name: "Test User",
        role: Role.user,
        units: Units.metric,
        weekStartsOn: WeekStartsOn.monday,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: hashedPassword,
        name: "Admin User",
        role: Role.admin,
        units: Units.metric,
        weekStartsOn: WeekStartsOn.monday,
      },
    });
    console.log(`Created users: ${regularUser.email} (user), ${adminUser.email} (admin)`);

    console.log("Creating program templates...");
    await seedTemplates(exerciseIds);
    console.log(
      `Created ${String(templateDefinitions.length)} program templates`,
    );

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

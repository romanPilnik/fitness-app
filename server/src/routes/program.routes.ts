import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { ProgramController } from "../controllers/program.controller";
import {
  getProgramsSchema,
  getProgramByIdSchema,
  createFromTemplateSchema,
  createCustomProgramSchema,
  updateProgramSchema,
  deleteProgramSchema,
  addProgramWorkoutSchema,
  updateProgramWorkoutSchema,
  deleteProgramWorkoutSchema,
  addWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  deleteWorkoutExerciseSchema,
  bulkReorderWorkoutExercisesSchema,
} from "../validations/program.validation";

const programRouter = Router();

programRouter.get(
  "/",
  verifyToken,
  validate(getProgramsSchema),
  ProgramController.getPrograms,
);

programRouter.get("/active", verifyToken, ProgramController.getActiveProgram);

programRouter.get(
  "/:id",
  verifyToken,
  validate(getProgramByIdSchema),
  ProgramController.getProgramById,
);

programRouter.post(
  "/from-template",
  verifyToken,
  validate(createFromTemplateSchema),
  ProgramController.createFromTemplate,
);

programRouter.post(
  "/custom",
  verifyToken,
  validate(createCustomProgramSchema),
  ProgramController.createCustomProgram,
);

programRouter.patch(
  "/:id",
  verifyToken,
  validate(updateProgramSchema),
  ProgramController.updateProgram,
);

programRouter.delete(
  "/:id",
  verifyToken,
  validate(deleteProgramSchema),
  ProgramController.deleteProgram,
);

programRouter.post(
  "/:id/workouts",
  verifyToken,
  validate(addProgramWorkoutSchema),
  ProgramController.addProgramWorkout,
);

programRouter.patch(
  "/:id/workouts/:workoutId",
  verifyToken,
  validate(updateProgramWorkoutSchema),
  ProgramController.updateProgramWorkout,
);

programRouter.delete(
  "/:id/workouts/:workoutId",
  verifyToken,
  validate(deleteProgramWorkoutSchema),
  ProgramController.deleteProgramWorkout,
);

programRouter.post(
  "/:id/workouts/:workoutId/exercises",
  verifyToken,
  validate(addWorkoutExerciseSchema),
  ProgramController.addWorkoutExercise,
);

programRouter.put(
  "/:id/workouts/:workoutId/exercises/reorder",
  verifyToken,
  validate(bulkReorderWorkoutExercisesSchema),
  ProgramController.bulkReorderWorkoutExercises,
);

programRouter.patch(
  "/:id/workouts/:workoutId/exercises/:exerciseId",
  verifyToken,
  validate(updateWorkoutExerciseSchema),
  ProgramController.updateWorkoutExercise,
);

programRouter.delete(
  "/:id/workouts/:workoutId/exercises/:exerciseId",
  verifyToken,
  validate(deleteWorkoutExerciseSchema),
  ProgramController.deleteWorkoutExercise,
);

export default programRouter;

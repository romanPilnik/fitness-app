/** Same options as program/template lists; used for the catalog within each muscle group. */
export type ExerciseListSort =
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "name_desc";

export type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment: string;
  movementPattern: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  instructions: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

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

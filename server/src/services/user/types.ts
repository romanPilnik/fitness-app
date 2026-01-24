import type { Units, WeekStartsOn } from '../../types/enums.types.js';

export type ProfileUpdates = {
  name?: string;
  preferences?: {
    units?: Units;
    weekStartsOn?: WeekStartsOn;
  };
};

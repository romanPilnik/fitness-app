export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  units: 'metric' | 'imperial';
  weekStartsOn: 'sunday' | 'monday' | 'saturday';
  createdAt: string;
  updatedAt: string;
};

export type AiUserPreferences = {
  progressionStyle: 'conservative' | 'moderate' | 'aggressive';
  progressionPreference: 'weight' | 'reps' | 'balanced';
  deloadSensitivity: 'low' | 'medium' | 'high';
  rirFloor: number;
};

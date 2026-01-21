export const programTemplatesMock = {
  success: true,
  message: 'Program templates retrieved successfully',
  data: {
    docs: [
      {
        _id: '64b7f9a2e4f1a9c1d2e3f455',
        name: 'Upper / Lower Strength',
        description: 'A 4-day upper/lower strength-focused program',
        splitType: 'upper_lower',
        difficulty: 'intermediate',
        daysPerWeek: 4,
        createdBy: 'system',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        workouts: [
          {
            dayNumber: 1,
            name: 'Upper Strength A',
            exercises: [
              {
                exerciseId: { _id: 'ex_1', name: 'Bench Press' },
                targetSets: 4,
                targetReps: 6,
              },
              {
                exerciseId: { _id: 'ex_2', name: 'Barbell Row' },
                targetSets: 3,
                targetReps: 8,
              },
            ],
          },
          {
            dayNumber: 2,
            name: 'Lower Strength A',
            exercises: [
              {
                exerciseId: { _id: 'ex_3', name: 'Squat' },
                targetSets: 5,
                targetReps: 5,
              },
            ],
          },
        ],
      },
      {
        _id: '64b7f9a2e4f1a9c1d2e3f456',
        name: 'Push Pull Legs',
        description: 'A classic 3-day push/pull/legs template',
        splitType: 'ppl',
        difficulty: 'beginner',
        daysPerWeek: 3,
        createdBy: 'system',
        isActive: true,
        createdAt: '2025-01-02T00:00:00Z',
        workouts: [
          {
            dayNumber: 1,
            name: 'Push',
            exercises: [
              { exerciseId: { _id: 'ex_4', name: 'Overhead Press' }, targetSets: 3, targetReps: 8 },
              {
                exerciseId: { _id: 'ex_5', name: 'Incline Dumbbell Press' },
                targetSets: 3,
                targetReps: 10,
              },
            ],
          },
        ],
      },
    ],
    totalDocs: 2,
    limit: 20,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

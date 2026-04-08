import { lazy } from 'react';

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
export const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
export const LibraryPage = lazy(() =>
  import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
export const ExercisesPage = lazy(() =>
  import('@/features/exercises/pages/ExercisesPage').then((m) => ({ default: m.ExercisesPage })),
);
export const ExerciseProgressPage = lazy(() =>
  import('@/features/exercise-performance/pages/ExerciseProgressPage').then((m) => ({
    default: m.ExerciseProgressPage,
  })),
);
export const ExerciseDetailPage = lazy(() =>
  import('@/features/exercises/pages/ExerciseDetailPage').then((m) => ({
    default: m.ExerciseDetailPage,
  })),
);
export const TemplatesPage = lazy(() =>
  import('@/features/templates/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })),
);
export const TemplateDetailPage = lazy(() =>
  import('@/features/templates/pages/TemplateDetailPage').then((m) => ({
    default: m.TemplateDetailPage,
  })),
);
export const NewTemplatePage = lazy(() =>
  import('@/features/templates/pages/NewTemplatePage').then((m) => ({
    default: m.NewTemplatePage,
  })),
);
export const EditTemplatePage = lazy(() =>
  import('@/features/templates/pages/EditTemplatePage').then((m) => ({
    default: m.EditTemplatePage,
  })),
);
export const ProgramsPage = lazy(() =>
  import('@/features/programs/pages/ProgramsPage').then((m) => ({ default: m.ProgramsPage })),
);
export const ProgramDetailPage = lazy(() =>
  import('@/features/programs/pages/ProgramDetailPage').then((m) => ({
    default: m.ProgramDetailPage,
  })),
);
export const ProgramEditPage = lazy(() =>
  import('@/features/programs/pages/ProgramEditPage').then((m) => ({
    default: m.ProgramEditPage,
  })),
);
export const ProgramFromTemplatePage = lazy(() =>
  import('@/features/programs/pages/ProgramFromTemplatePage').then((m) => ({
    default: m.ProgramFromTemplatePage,
  })),
);
export const ProgramCreateHubPage = lazy(() =>
  import('@/features/programs/pages/ProgramCreateHubPage').then((m) => ({
    default: m.ProgramCreateHubPage,
  })),
);
export const NewProgramPage = lazy(() =>
  import('@/features/programs/pages/NewProgramPage').then((m) => ({ default: m.NewProgramPage })),
);
export const SessionsPage = lazy(() =>
  import('@/features/sessions/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })),
);
export const SessionDetailPage = lazy(() =>
  import('@/features/sessions/pages/SessionDetailPage').then((m) => ({
    default: m.SessionDetailPage,
  })),
);
export const LogSessionPage = lazy(() =>
  import('@/features/sessions/pages/LogSessionPage').then((m) => ({ default: m.LogSessionPage })),
);
export const StartWorkoutPage = lazy(() =>
  import('@/features/sessions/pages/StartWorkoutPage').then((m) => ({
    default: m.StartWorkoutPage,
  })),
);
export const AccountPage = lazy(() =>
  import('@/features/users/pages/AccountPage').then((m) => ({ default: m.AccountPage })),
);
export const ChangePasswordPage = lazy(() =>
  import('@/features/users/pages/ChangePasswordPage').then((m) => ({
    default: m.ChangePasswordPage,
  })),
);
export const AdminExercisesPage = lazy(() =>
  import('@/features/exercises/pages/AdminExercisesPage').then((m) => ({
    default: m.AdminExercisesPage,
  })),
);
export const NewExercisePage = lazy(() =>
  import('@/features/exercises/pages/NewExercisePage').then((m) => ({
    default: m.NewExercisePage,
  })),
);

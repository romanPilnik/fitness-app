import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShellLayout } from '@/layouts/AppShellLayout';
import { AdminRoute } from './AdminRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RootRedirect } from './RootRedirect';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LibraryPage = lazy(() =>
  import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
const ExercisesPage = lazy(() =>
  import('@/features/exercises/pages/ExercisesPage').then((m) => ({ default: m.ExercisesPage })),
);
const ExerciseProgressPage = lazy(() =>
  import('@/features/exercise-performance/pages/ExerciseProgressPage').then((m) => ({
    default: m.ExerciseProgressPage,
  })),
);
const ExerciseDetailPage = lazy(() =>
  import('@/features/exercises/pages/ExerciseDetailPage').then((m) => ({
    default: m.ExerciseDetailPage,
  })),
);
const TemplatesPage = lazy(() =>
  import('@/features/templates/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })),
);
const TemplateDetailPage = lazy(() =>
  import('@/features/templates/pages/TemplateDetailPage').then((m) => ({
    default: m.TemplateDetailPage,
  })),
);
const NewTemplatePage = lazy(() =>
  import('@/features/templates/pages/NewTemplatePage').then((m) => ({
    default: m.NewTemplatePage,
  })),
);
const EditTemplatePage = lazy(() =>
  import('@/features/templates/pages/EditTemplatePage').then((m) => ({
    default: m.EditTemplatePage,
  })),
);
const ProgramsPage = lazy(() =>
  import('@/features/programs/pages/ProgramsPage').then((m) => ({ default: m.ProgramsPage })),
);
const ProgramDetailPage = lazy(() =>
  import('@/features/programs/pages/ProgramDetailPage').then((m) => ({
    default: m.ProgramDetailPage,
  })),
);
const ProgramFromTemplatePage = lazy(() =>
  import('@/features/programs/pages/ProgramFromTemplatePage').then((m) => ({
    default: m.ProgramFromTemplatePage,
  })),
);
const ProgramCreateHubPage = lazy(() =>
  import('@/features/programs/pages/ProgramCreateHubPage').then((m) => ({
    default: m.ProgramCreateHubPage,
  })),
);
const NewProgramPage = lazy(() =>
  import('@/features/programs/pages/NewProgramPage').then((m) => ({ default: m.NewProgramPage })),
);
const SessionsPage = lazy(() =>
  import('@/features/sessions/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })),
);
const SessionDetailPage = lazy(() =>
  import('@/features/sessions/pages/SessionDetailPage').then((m) => ({
    default: m.SessionDetailPage,
  })),
);
const LogSessionPage = lazy(() =>
  import('@/features/sessions/pages/LogSessionPage').then((m) => ({ default: m.LogSessionPage })),
);
const StartWorkoutPage = lazy(() =>
  import('@/features/sessions/pages/StartWorkoutPage').then((m) => ({
    default: m.StartWorkoutPage,
  })),
);
const AccountPage = lazy(() =>
  import('@/features/users/pages/AccountPage').then((m) => ({ default: m.AccountPage })),
);
const ChangePasswordPage = lazy(() =>
  import('@/features/users/pages/ChangePasswordPage').then((m) => ({
    default: m.ChangePasswordPage,
  })),
);
const AdminExercisesPage = lazy(() =>
  import('@/features/exercises/pages/AdminExercisesPage').then((m) => ({
    default: m.AdminExercisesPage,
  })),
);
const NewExercisePage = lazy(() =>
  import('@/features/exercises/pages/NewExercisePage').then((m) => ({
    default: m.NewExercisePage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--bg) px-4">
      <p className="text-sm text-(--text)">Loading…</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppShellLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin/exercises" element={<AdminExercisesPage />} />
              <Route path="/admin/exercises/new" element={<NewExercisePage />} />
            </Route>
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/exercises/new" element={<NewExercisePage />} />
            <Route path="/exercises/:id/progress" element={<ExerciseProgressPage />} />
            <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/new" element={<NewTemplatePage />} />
            <Route path="/templates/:id/edit" element={<EditTemplatePage />} />
            <Route path="/templates/:id" element={<TemplateDetailPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/from-template" element={<ProgramFromTemplatePage />} />
            <Route path="/programs/new/custom" element={<NewProgramPage />} />
            <Route path="/programs/new" element={<ProgramCreateHubPage />} />
            <Route path="/programs/:id" element={<ProgramDetailPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/sessions/start" element={<StartWorkoutPage />} />
            <Route path="/sessions/new" element={<LogSessionPage />} />
            <Route path="/workouts/log" element={<Navigate to="/sessions/start" replace />} />
            <Route path="/sessions/:id" element={<SessionDetailPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/password" element={<ChangePasswordPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

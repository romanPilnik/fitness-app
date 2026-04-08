import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShellLayout } from '@/layouts/AppShellLayout';
import { AdminRoute } from './AdminRoute';
import * as P from './lazyPages';
import { ProtectedRoute } from './ProtectedRoute';
import { RootLayout } from './RootLayout';
import { RootRedirect } from './RootRedirect';

/** Data router required for `useBlocker` (unsaved-changes prompts). */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <RootRedirect /> },
      { path: 'login', element: <P.LoginPage /> },
      { path: 'register', element: <P.RegisterPage /> },
      {
        element: <AppShellLayout />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              {
                element: <AdminRoute />,
                children: [
                  { path: 'admin/exercises', element: <P.AdminExercisesPage /> },
                  { path: 'admin/exercises/new', element: <P.NewExercisePage /> },
                ],
              },
              { path: 'exercises', element: <P.ExercisesPage /> },
              { path: 'exercises/new', element: <P.NewExercisePage /> },
              { path: 'exercises/:id/progress', element: <P.ExerciseProgressPage /> },
              { path: 'exercises/:id', element: <P.ExerciseDetailPage /> },
              { path: 'templates', element: <P.TemplatesPage /> },
              { path: 'templates/new', element: <P.NewTemplatePage /> },
              { path: 'templates/:id/edit', element: <P.EditTemplatePage /> },
              { path: 'templates/:id', element: <P.TemplateDetailPage /> },
              { path: 'home', element: <P.HomePage /> },
              { path: 'library', element: <P.LibraryPage /> },
              { path: 'programs', element: <P.ProgramsPage /> },
              { path: 'programs/from-template', element: <P.ProgramFromTemplatePage /> },
              { path: 'programs/new/custom', element: <P.NewProgramPage /> },
              { path: 'programs/new', element: <P.ProgramCreateHubPage /> },
              { path: 'programs/:id/edit', element: <P.ProgramEditPage /> },
              { path: 'programs/:id', element: <P.ProgramDetailPage /> },
              { path: 'sessions', element: <P.SessionsPage /> },
              { path: 'sessions/start', element: <P.StartWorkoutPage /> },
              { path: 'sessions/new', element: <P.LogSessionPage /> },
              { path: 'workouts/log', element: <Navigate to="/sessions/start" replace /> },
              { path: 'sessions/:id', element: <P.SessionDetailPage /> },
              { path: 'account', element: <P.AccountPage /> },
              { path: 'account/password', element: <P.ChangePasswordPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

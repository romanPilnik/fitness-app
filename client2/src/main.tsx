import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/api/queryClient';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { LiveSessionProvider } from '@/features/sessions/LiveSessionProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppErrorBoundary>
          <AuthProvider>
            <LiveSessionProvider>
              <App />
            </LiveSessionProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

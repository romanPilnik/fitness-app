import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { useAuth } from '@/features/auth/useAuth';
import { fetchCurrentUser, userQueryKeys } from '@/features/users/api';

function StatusBox({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-lg px-4 py-8">{children}</div>;
}

export function AdminRoute() {
  const { isAuthenticated } = useAuth();

  const q = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (q.isPending) {
    return (
      <StatusBox>
        <p className="text-sm text-(--text)">Loading…</p>
      </StatusBox>
    );
  }

  if (q.isError) {
    return (
      <StatusBox>
        <QueryErrorMessage error={q.error} refetch={() => void q.refetch()} />
      </StatusBox>
    );
  }

  if (q.data.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

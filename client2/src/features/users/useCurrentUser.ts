import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { fetchCurrentUser, userQueryKeys } from './api';

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import type { AuthStatus } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<AuthStatus>({
    queryKey: ['auth-status'],
    queryFn: async () => {
      // Check for one-time exchange token in URL
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('auth_token');

      if (authToken) {
        try {
          const exchangeRes = await authApi.exchangeToken(authToken);
          // Clean the URL without refreshing
          params.delete('auth_token');
          const newSearch = params.toString() ? `?${params.toString()}` : '';
          window.history.replaceState({}, '', window.location.pathname + newSearch);
          if (exchangeRes.authenticated) {
            return exchangeRes;
          }
        } catch (err) {
          console.error('[Auth] Token exchange failed', err);
          params.delete('auth_token');
          const newSearch = params.toString() ? `?${params.toString()}` : '';
          window.history.replaceState({}, '', window.location.pathname + newSearch);
        }
      }

      return authApi.status();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    // If an auth error is in the URL, clean it up after logging
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      console.warn('[Auth] Redirect error from Spotify:', params.get('error'));
    }
  }, []);

  return {
    isAuthenticated: data?.authenticated ?? false,
    user: data?.user ?? null,
    isLoading,
    error,
    refetch,
    connectSpotify: authApi.connectSpotify,
    logout: async () => {
      await authApi.logout();
      queryClient.setQueryData(['auth-status'], { authenticated: false });
      refetch();
      window.location.href = '/';
    },
  };
}

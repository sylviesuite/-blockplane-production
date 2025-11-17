import { useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Standalone deployment: No authentication required
// Returns a mock auth state with no user
export function useAuth(_options?: UseAuthOptions) {
  const state = useMemo(() => {
    return {
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    };
  }, []);

  return {
    ...state,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}

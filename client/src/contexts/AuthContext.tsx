import { createContext, useContext } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type AuthUser = {
  id: string;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => navigate("/"),
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        logout: () => logoutMutation.mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

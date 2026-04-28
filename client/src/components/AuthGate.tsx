import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type Props = {
  children?: React.ReactNode;
  /** Redirect to /login instead of rendering an inline prompt. */
  redirect?: boolean;
  /** Override the default inline prompt message. */
  message?: string;
};

/**
 * Wraps content that requires authentication.
 *
 * redirect=false (default): renders an inline sign-in card in place of children.
 * redirect=true: sends unauthenticated users to /login?from=<current path>.
 *
 * Both modes render nothing while the session is loading — no flicker.
 */
export default function AuthGate({ children, redirect = false, message }: Props) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (redirect && !isLoading && !user) {
      navigate(`/login?from=${encodeURIComponent(location)}`);
    }
  }, [redirect, isLoading, user, location, navigate]);

  // While session resolves, render nothing to avoid content flash.
  if (isLoading) return null;

  // Redirect mode: nothing to render — the effect handles navigation.
  if (redirect) {
    return user ? <>{children}</> : null;
  }

  // Inline mode: show children for authenticated users, prompt for others.
  if (user) return <>{children}</>;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 flex flex-col items-center gap-3 text-center">
      <div className="rounded-full bg-slate-800 p-3">
        <Lock className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm text-slate-300 max-w-xs">
        {message ?? "Sign in to access this feature."}
      </p>
      <div className="flex gap-2">
        <Link href={`/login?from=${encodeURIComponent(location)}`}>
          <Button size="sm">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" variant="outline">Create account</Button>
        </Link>
      </div>
    </div>
  );
}

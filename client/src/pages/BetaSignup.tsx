import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BetaSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);

  const betaSignup = trpc.auth.betaSignup.useMutation({
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (msg.includes("23505") || msg.includes("duplicate")) {
        setError("You're already on the list! Head to Sign in below.");
      } else {
        setError(err.message);
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (honeypot) return;
    betaSignup.mutate({ email, name: name || undefined, role: role || undefined, org: org || undefined });
  }

  if (betaSignup.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">You're in.</h1>
          <p className="text-muted-foreground">
            We're onboarding residential architects and designers first. We'll be in touch soon with your early access details.
          </p>
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Design greener homes from day one</h1>
          <p className="text-sm text-muted-foreground">
            Block Plane is built for residential architects and designers. Compare embodied carbon trade-offs during early concept work — before materials are locked in. Built around a 2,000 sq ft family home benchmark you can shape to fit your vision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              placeholder="e.g. Architect, Engineer, Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org">Organisation</Label>
            <Input
              id="org"
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
            />
          </div>

          {/* Honeypot: off-screen, invisible to humans, filled by bots */}
          <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={betaSignup.isPending}>
            {betaSignup.isPending ? "Submitting…" : "Request early access"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}

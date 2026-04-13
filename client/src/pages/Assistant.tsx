import { Header } from "@/components/Header";
import { Link } from "wouter";

export default function Assistant() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">AI Builder&apos;s Assistant (Beta)</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          This will be your guided helper for comparing materials, interpreting LIS/RIS, and exploring better alternatives. For now, this is a placeholder while we connect the InsightBox v2 + Claude backend.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm mb-8">
          <li>Explain LIS, RIS, and CPI scores</li>
          <li>Compare two materials</li>
          <li>Suggest better alternatives for a given spec</li>
        </ul>
        <Link href="/home">
          <span className="text-sm text-primary hover:underline">← Back to Home</span>
        </Link>
      </main>
    </div>
  );
}

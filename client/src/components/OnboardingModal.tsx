import { useState } from "react";
import { trpc } from "@/lib/trpc";

const STEPS = [
  {
    emoji: "🌿",
    title: "Welcome to BlockPlane",
    description:
      "BlockPlane helps you make smarter material choices for your construction projects. Track embodied carbon, compare sustainability scores, and find lower-impact alternatives — all in one place.",
    link: null,
  },
  {
    emoji: "🔍",
    title: "Explore Materials",
    description:
      "Browse our database of hundreds of construction materials, each scored for lifecycle carbon impact (LIS) and regenerative potential (RIS). Filter by category, compare side-by-side, and dig into the data.",
    link: { label: "Browse the Material Library", href: "/materials" },
  },
  {
    emoji: "⭐",
    title: "The Frontier Index",
    description:
      "Frontier showcases the top-performing materials in each category — the ones setting the standard for low-carbon, high-regenerative building. Use it as your shortlist for sustainable specs.",
    link: { label: "See Frontier Materials", href: "/frontier" },
  },
  {
    emoji: "📐",
    title: "Start Your First Project",
    description:
      "Add your project's materials, run a full carbon analysis, and explore swap recommendations. Your saved projects let you track progress and revisit calculations anytime.",
    link: { label: "Go to My Projects", href: "/my-projects" },
  },
] as const;

interface Props {
  onDismiss: () => void;
}

export default function OnboardingModal({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const utils = trpc.useUtils();

  const completeOnboarding = trpc.auth.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  function finish() {
    completeOnboarding.mutate();
    onDismiss();
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 16, 10, 0.78)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-[#faf7f2]">
        {/* Header band */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ background: "#1a2e1f" }}
        >
          <div className="text-4xl mb-3">{current.emoji}</div>
          <h2 className="text-xl font-semibold text-white">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-sm leading-relaxed text-gray-600">{current.description}</p>

          {current.link && (
            <a
              href={current.link.href}
              onClick={finish}
              className="inline-block mt-4 text-sm font-medium"
              style={{ color: "#c17f24" }}
            >
              {current.link.label} →
            </a>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 px-8 pb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="h-2 rounded-full transition-all duration-200"
              style={{
                width: i === step ? "24px" : "8px",
                background: i === step ? "#c17f24" : "#d1d5db",
              }}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5">
          <button
            onClick={finish}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep(step + 1)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#c17f24" }}
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";

const STEPS = [
  {
    emoji: "🌿",
    title: "What is BlockPlane?",
    body: "Smart material choices for builders, architects, and anyone who cares what goes into their project. 425+ materials scored for embodied carbon, regenerative impact, and regional feasibility.",
  },
  {
    emoji: "📊",
    title: "How the scores work",
    body: null, // rendered as structured list
  },
  {
    emoji: "🚀",
    title: "Where to start",
    body: null, // rendered as CTA buttons
  },
] as const;

interface Props {
  onDismiss: () => void;
}

export default function AnonWelcomeModal({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const [, navigate] = useLocation();

  function go(href: string) {
    onDismiss();
    navigate(href);
  }

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 16, 10, 0.78)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-[#faf7f2]">
        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ background: "#1a2e1f" }}>
          <div className="text-4xl mb-3">{current.emoji}</div>
          <h2 className="text-xl font-semibold text-white">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="px-8 py-6 min-h-[140px]">
          {step === 0 && (
            <p className="text-sm leading-relaxed text-gray-600">{current.body}</p>
          )}

          {step === 1 && (
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-800">LIS — Lifecycle Impact Score</span>
                <p className="mt-1 leading-relaxed">
                  0–100, higher is better. Total carbon footprint from extraction through disposal. Low-carbon materials score high.
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-800">RIS — Regenerative Impact Score</span>
                <p className="mt-1 leading-relaxed">
                  0–100, higher is better. Does the material sequester carbon, use recycled content, or restore ecosystems?
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-800">CPI — Cost Performance</span>
                <p className="mt-1 leading-relaxed">
                  good → extreme. Cost per tonne of CO₂ avoided — helps you weigh environmental benefit against budget.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-gray-600 mb-4">Pick a place to begin:</p>
              <button
                onClick={() => go("/materials")}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white text-left transition-opacity hover:opacity-90"
                style={{ background: "#1a2e1f" }}
              >
                🔍 Explore Materials
                <span className="block text-xs font-normal opacity-70 mt-0.5">
                  Browse 425+ scored construction materials
                </span>
              </button>
              <button
                onClick={() => go("/frontier")}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-left border-2 transition-colors hover:bg-amber-50"
                style={{ borderColor: "#c17f24", color: "#c17f24" }}
              >
                ⭐ See Frontier Materials
                <span className="block text-xs font-normal opacity-70 mt-0.5">
                  Top-rated low-carbon picks by category
                </span>
              </button>
            </div>
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
            onClick={onDismiss}
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
            {!isLast && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#c17f24" }}
              >
                Next
              </button>
            )}
            {isLast && (
              <button
                onClick={onDismiss}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#c17f24" }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

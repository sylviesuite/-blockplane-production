type ScoreConfidence = "verified" | "estimated" | "placeholder" | null | undefined;

interface ScoreConfidenceBadgeProps {
  confidence: ScoreConfidence;
  className?: string;
}

const CONFIG = {
  verified:    { label: "Verified data",              bg: "#EAF3DE", color: "#27500A", border: "#b0d48a" },
  estimated:   { label: "Estimated",                  bg: "#FDF3E3", color: "#633806", border: "#e8c87a" },
  placeholder: { label: "Unreviewed · use with caution", bg: "#F3F3F2", color: "#5a5a56", border: "#d0cfcc" },
  missing:     { label: "Unreviewed",                 bg: "#F3F3F2", color: "#5a5a56", border: "#d0cfcc" },
};

export function ScoreConfidenceBadge({ confidence, className = "" }: ScoreConfidenceBadgeProps) {
  const key = confidence && confidence !== "" ? confidence : "missing";
  const cfg = CONFIG[key as keyof typeof CONFIG] ?? CONFIG.missing;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

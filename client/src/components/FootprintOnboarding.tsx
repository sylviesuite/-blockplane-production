// FootprintOnboarding — platform transparency panel shown on first login.
// STATE A (current): all activity metrics shown as em dashes with "logging soon".
// STATE B (future): replace METRIC_CARDS values with live data from
//   get_monthly_footprint_summary() Supabase function and add a lastUpdated timestamp.

interface Props {
  onDismiss: () => void;
}

const METRIC_CARDS = [
  { label: "AI calls",             value: "—", sub: "logging soon" },
  { label: "Tokens processed",     value: "—", sub: "logging soon" },
  { label: "Reports generated",    value: "—", sub: "logging soon" },
  { label: "Projects analyzed",    value: "—", sub: "logging soon" },
  { label: "Material comparisons", value: "—", sub: "logging soon" },
  { label: "Hosting region",       value: "US East", sub: "Virginia · Render" },
] as const;

const CATEGORY_ROWS = [
  { icon: "⚡", label: "Compute energy",       badge: "Proxy estimate",        badgeStyle: "amber"  },
  { icon: "💧", label: "Cooling water",        badge: "Under investigation",   badgeStyle: "gray"   },
  { icon: "🌫", label: "Operational emissions", badge: "Proxy estimate",        badgeStyle: "amber"  },
  { icon: "🤖", label: "AI processing load",   badge: "Direct measurement",    badgeStyle: "green"  },
  { icon: "🏢", label: "Hosting assumptions",  badge: "Pending confirmation",  badgeStyle: "gray"   },
  { icon: "🌱", label: "Influenced decisions", badge: "V2 methodology",         badgeStyle: "blue"   },
] as const;

const STATUS_CARDS = [
  {
    dot: "green",
    title: "Activity logging",
    body: "Platform events tracked directly from BlockPlane systems.",
    badge: "High confidence",
    badgeStyle: "green",
  },
  {
    dot: "amber",
    title: "Energy and emissions estimates",
    body: "Derived from token volume and hosting assumptions using third-party proxy methodology. Published as ranges with documented assumptions.",
    badge: "Medium confidence · In progress",
    badgeStyle: "amber",
  },
  {
    dot: "amber",
    title: "Water use",
    body: "An active part of our methodology. We are not publishing water figures until we can support them with source-specific data — not industry averages.",
    badge: "Under investigation",
    badgeStyle: "amber",
  },
  {
    dot: "gray",
    title: "Downstream influence",
    body: "The environmental value created by better material decisions. Tracked as activity data in V1. A verified impact methodology is in development for V2.",
    badge: "V2 methodology",
    badgeStyle: "gray",
  },
] as const;

const DOT_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-400",
  gray:  "bg-gray-400",
};

const BADGE_STYLES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  amber: "bg-amber-50  text-amber-700  border border-amber-200",
  gray:  "bg-gray-100  text-gray-500   border border-gray-200",
  blue:  "bg-blue-50   text-blue-600   border border-blue-200",
};

function Divider() {
  return <hr className="border-gray-200 my-8" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
      {children}
    </p>
  );
}

export default function FootprintOnboarding({ onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="BlockPlane platform transparency"
    >
      <div className="min-h-full flex flex-col">
        {/* Top bar */}
        <div className="shrink-0 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#1a2e1f" }}
          >
            Platform transparency
          </span>
          <button
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              BlockPlane measures itself
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-2xl">
              No system is impact-free — including this one. We apply the same lifecycle
              principles to our own platform that we ask the construction industry to apply
              to materials and buildings.
            </p>
          </div>

          <Divider />

          {/* Activity log */}
          <SectionLabel>This month — activity log</SectionLabel>
          <div className="grid grid-cols-3 gap-4">
            {METRIC_CARDS.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4"
              >
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-semibold text-gray-800 leading-none">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <Divider />

          {/* What we are building toward */}
          <SectionLabel>What we are building toward</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="text-lg leading-none">{row.icon}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">{row.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${BADGE_STYLES[row.badgeStyle]}`}>
                  {row.badge}
                </span>
              </div>
            ))}
          </div>

          <Divider />

          {/* Methodology status */}
          <SectionLabel>Methodology status</SectionLabel>
          <div className="space-y-4">
            {STATUS_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white px-6 py-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${DOT_COLORS[card.dot]}`} />
                    <p className="text-sm font-semibold text-gray-800">{card.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${BADGE_STYLES[card.badgeStyle]}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-[18px]">{card.body}</p>
              </div>
            ))}
          </div>

          <Divider />

          {/* Principle statement */}
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-500 text-sm leading-relaxed mb-6">
            "We measure ourselves using the same principles we ask others to use."
          </blockquote>

          {/* Methodology link + dismiss */}
          <div className="flex items-center justify-between">
            <a
              href="/methodology"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: "#c17f24" }}
            >
              Read the methodology
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              onClick={onDismiss}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#1a2e1f" }}
            >
              Continue to BlockPlane →
            </button>
          </div>

          {/* Bottom padding */}
          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}

import type { Context } from "https://edge.netlify.com";

const BOT_UA = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|rogerbot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|gptbot|claudebot|anthropic-ai|bytespider|ia_archiver|archive\.org_bot/i;

const STATIC_EXT = /\.(?:js|mjs|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|eot|mp4|webm|pdf|json|xml|txt|map)$/i;

const OG_IMAGE = "https://blockplanemetric.com/assets/og-image.png";
const SITE_URL = "https://blockplanemetric.com";

interface RouteMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "BlockPlane — Embodied Carbon & Material Intelligence",
    description: "BlockPlane scores 425+ construction materials for embodied carbon, regenerative impact (RIS), and lifecycle performance (LIS). Built for builders, architects, and contractors who need better material decisions faster.",
    ogTitle: "BlockPlane — Embodied Carbon & Material Intelligence",
    ogDescription: "425+ construction materials scored for embodied carbon, regenerative impact, and regional feasibility. LIS, RIS, and CPI on every material. Free for beta testers.",
  },
  "/pricing": {
    title: "Pricing — BlockPlane",
    description: "BlockPlane is free for beta testers. Full material database, LIS/RIS/CPI scoring, and InsightBox AI — at no cost, forever. Paid tiers coming soon.",
    ogTitle: "Pricing — BlockPlane",
    ogDescription: "Free beta access forever. 260+ materials scored, InsightBox AI builder's assistant, wall systems analysis, and more. No credit card required.",
  },
  "/materials": {
    title: "Materials — BlockPlane",
    description: "260+ construction materials scored on lifecycle impact (LIS), regenerative value (RIS), and carbon efficiency (CPI). Filter, compare, and find the right material for your project.",
    ogTitle: "Materials Database — BlockPlane",
    ogDescription: "260+ construction materials scored on lifecycle impact, regenerative value, and carbon efficiency. Filter by category, region, and performance score.",
  },
  "/frontier": {
    title: "Frontier Materials — BlockPlane",
    description: "The highest-performing materials in the BlockPlane database — scored for regenerative impact, low embodied carbon, and next-generation construction performance.",
    ogTitle: "Frontier Materials — BlockPlane",
    ogDescription: "The top-tier materials in the BlockPlane database. Regenerative, low-carbon, high-performance — the frontier of sustainable construction.",
  },
  "/analysis": {
    title: "Analysis — BlockPlane",
    description: "LIS vs RIS analysis across the full material database. Visualize tradeoffs between lifecycle impact and regenerative value for every scored material.",
    ogTitle: "Material Analysis — BlockPlane",
    ogDescription: "LIS vs RIS scatter analysis across 260+ construction materials. Identify high-performance, low-impact materials for your next project.",
  },
  "/how-it-works": {
    title: "How It Works — BlockPlane",
    description: "Learn how BlockPlane scores construction materials on lifecycle impact (LIS), regenerative value (RIS), and carbon efficiency (CPI). Built for builders and architects.",
    ogTitle: "How It Works — BlockPlane",
    ogDescription: "The scoring methodology behind LIS, RIS, and CPI — how BlockPlane turns EPD data into actionable material intelligence for builders and architects.",
  },
};

function buildHTML(url: URL, meta: RouteMeta): string {
  const canonical = `${SITE_URL}${url.pathname}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Favicon + Touch Icon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />

    <!-- Primary meta -->
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="BlockPlane" />
    <meta property="og:title" content="${meta.ogTitle}" />
    <meta property="og:description" content="${meta.ogDescription}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter / X card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.ogTitle}" />
    <meta name="twitter:description" content="${meta.ogDescription}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />

    <!-- Structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "BlockPlane",
      "url": "${SITE_URL}",
      "description": "Embodied carbon and material intelligence platform for the construction industry.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "creator": { "@type": "Organization", "name": "BlockPlane", "url": "${SITE_URL}" }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);

  // Pass static assets through immediately
  if (STATIC_EXT.test(url.pathname)) {
    return context.next();
  }

  // Only intercept known bots
  const ua = request.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(ua)) {
    return context.next();
  }

  // Match route (strip trailing slash except for root)
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
  const meta = ROUTES[path];

  // Unknown route — let Netlify serve index.html normally
  if (!meta) {
    return context.next();
  }

  return new Response(buildHTML(url, meta), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "index, follow",
    },
  });
}

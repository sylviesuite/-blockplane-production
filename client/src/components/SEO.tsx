import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SITE_NAME = "BlockPlane Metric";
const DEFAULT_DESC =
  "Material decision intelligence for builders, architects, and contractors. 394+ building materials scored for embodied carbon, regenerative impact, and Great Lakes regional feasibility.";
const DEFAULT_IMAGE = "https://blockplanemetric.com/assets/logo-blockplane.png";
const BASE_URL = "https://blockplanemetric.com";

export default function SEO({ title, description, image, url }: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const canonical = url || BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}

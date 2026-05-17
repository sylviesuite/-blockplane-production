import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/materials", priority: "0.9", changefreq: "daily" },
  { path: "/frontier", priority: "0.8", changefreq: "weekly" },
  { path: "/compare", priority: "0.8", changefreq: "weekly" },
  { path: "/benchmark", priority: "0.7", changefreq: "monthly" },
  { path: "/how-it-works", priority: "0.6", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "monthly" },
];

const { data: materials, error } = await supabase
  .from("materials")
  .select("id, updated_at");

if (error) {
  console.error("Supabase error:", error.message);
  process.exit(1);
}

const today = new Date().toISOString().split("T")[0];

const staticUrls = staticPages.map(
  ({ path, priority, changefreq }) => `
  <url>
    <loc>https://blockplanemetric.com${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
);

const materialUrls = (materials || []).map(
  (m) => `
  <url>
    <loc>https://blockplanemetric.com/materials/${m.id}</loc>
    <lastmod>${m.updated_at ? m.updated_at.split("T")[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...materialUrls].join("")}
</urlset>`;

fs.writeFileSync("client/public/sitemap.xml", sitemap);
console.log(
  `Sitemap generated: ${staticPages.length} static + ${materialUrls.length} material pages = ${staticPages.length + materialUrls.length} total URLs`
);

/**
 * Generates client/public/assets/og-image.png (1200x630)
 * Uses sharp to composite: forest-green background + logo + SVG text overlay
 *
 * Run once: node scripts/generate-og-image.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const W = 1200;
const H = 630;
const FOREST = "#1a2e1f";

// ─── Background ─────────────────────────────────────────────────────────────
const background = await sharp({
  create: { width: W, height: H, channels: 3, background: FOREST },
}).png().toBuffer();

// ─── Logo (circular, centred horizontally, upper third) ─────────────────────
const logoPath = path.join(ROOT, "client/public/assets/logo-blockplane.png");
const logoSize = 160;
const logo = await sharp(readFileSync(logoPath))
  .resize(logoSize, logoSize, { fit: "cover" })
  .png()
  .toBuffer();

// Circular mask
const circleMask = Buffer.from(
  `<svg width="${logoSize}" height="${logoSize}">
    <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white"/>
  </svg>`
);
const logoCircular = await sharp(logo)
  .composite([{ input: circleMask, blend: "dest-in" }])
  .png()
  .toBuffer();

const logoLeft = Math.round((W - logoSize) / 2);
const logoTop = 160;

// ─── Text overlay (SVG) ─────────────────────────────────────────────────────
// Wordmark sits below the logo, tagline below that
const textLeft = 0;
const wordmarkY = logoTop + logoSize + 52;  // baseline below logo
const taglineY = wordmarkY + 58;

const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <!-- Wordmark: BlockPlane -->
  <text
    x="${W / 2}"
    y="${wordmarkY}"
    font-family="system-ui, -apple-system, Helvetica Neue, Arial, sans-serif"
    font-size="72"
    font-weight="700"
    letter-spacing="-1"
    text-anchor="middle"
    fill="#f5f2ec"
  >BlockPlane</text>

  <!-- Tagline -->
  <text
    x="${W / 2}"
    y="${taglineY}"
    font-family="system-ui, -apple-system, Helvetica Neue, Arial, sans-serif"
    font-size="28"
    font-weight="400"
    letter-spacing="0.5"
    text-anchor="middle"
    fill="rgba(245,242,236,0.65)"
  >Embodied carbon intelligence for builders</text>
</svg>`);

// ─── Compose ─────────────────────────────────────────────────────────────────
const outPath = path.join(ROOT, "client/public/assets/og-image.png");

await sharp(background)
  .composite([
    { input: logoCircular, top: logoTop, left: logoLeft },
    { input: textSvg, top: 0, left: textLeft },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`✓ OG image written to ${outPath}`);

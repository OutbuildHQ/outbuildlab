/* ============================================================
   Build the brand asset kit into /brand for external use.
   - Icon: font-independent SVG variants + PNG sizes
   - Badge: rounded-square app/avatar icon
   - Lockup: icon + wordmark (editable SVG; uses Clash Display
     with a system fallback)
   Re-run after any mark change:  node scripts/build-brand.mjs
   ============================================================ */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const INK = "#0B0B0C";
const LIME = "#D7FF3E";
const OLIVE = "#66800B"; // accessible lime-as-ink for light backgrounds
const PAPER = "#EDEDE8";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "brand");
const iconDir = join(root, "icon");
const pngDir = join(iconDir, "png");
const lockDir = join(root, "lockup");
[root, iconDir, pngDir, lockDir].forEach((d) => mkdirSync(d, { recursive: true }));

// The mark, parameterised by colour (viewBox 0 0 32 32)
const mark = (c) =>
  `<path d="M19.26 6.54 A10 10 0 1 0 25.46 12.74" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>` +
  `<rect x="21.07" y="6.93" width="4" height="4" rx="0.8" fill="${c}" transform="rotate(45 23.07 8.93)"/>`;

const iconSvg = (c) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512" role="img" aria-label="Outbuild Lab">
  <title>Outbuild Lab</title>
  ${mark(c)}
</svg>\n`;

const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512" role="img" aria-label="Outbuild Lab">
  <title>Outbuild Lab</title>
  <rect width="32" height="32" rx="7" fill="${INK}"/>
  ${mark(LIME)}
</svg>\n`;

// Horizontal lockup: mark + "OUTBUILD" + small mono "LAB"
const lockup = ({ markColor, word, tag, bg }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48" width="420" height="96" role="img" aria-label="Outbuild Lab">
  <title>Outbuild Lab</title>
  ${bg ? `<rect width="210" height="48" rx="8" fill="${bg}"/>` : ""}
  <g transform="translate(5,8) scale(0.9375)">${mark(markColor)}</g>
  <text x="48" y="33" font-family="'Clash Display','Helvetica Neue',Arial,sans-serif" font-weight="600" font-size="27" letter-spacing="0.3" fill="${word}">OUTBUILD</text>
  <text x="183" y="20" font-family="'IBM Plex Mono','SFMono-Regular',monospace" font-size="9" letter-spacing="1.2" fill="${tag}">LAB</text>
</svg>\n`;

// --- write SVGs ---
writeFileSync(join(iconDir, "outbuild-icon.svg"), iconSvg(LIME));
writeFileSync(join(iconDir, "outbuild-icon-ink.svg"), iconSvg(INK));
writeFileSync(join(iconDir, "outbuild-icon-white.svg"), iconSvg("#FFFFFF"));
writeFileSync(join(iconDir, "outbuild-badge.svg"), badgeSvg);
writeFileSync(join(lockDir, "outbuild-lockup-dark.svg"), lockup({ markColor: LIME, word: PAPER, tag: LIME, bg: null }));
writeFileSync(join(lockDir, "outbuild-lockup-light.svg"), lockup({ markColor: INK, word: INK, tag: OLIVE, bg: null }));

// --- rasterise icon + badge PNGs (font-free, always accurate) ---
const render = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: 512 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(pngDir, file));

const limeIcon = iconSvg(LIME);
for (const s of [16, 32, 64, 128, 256, 512]) await render(limeIcon, s, `outbuild-icon-${s}.png`);
await render(badgeSvg, 512, "outbuild-badge-512.png");
await render(badgeSvg, 180, "outbuild-badge-180.png"); // apple-touch size

console.log("Brand kit written to /brand");

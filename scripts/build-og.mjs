/* ============================================================
   Build the social share image — public/og.png (1200×630).
   Authors an SVG (brand mark = particle "O" ring + wordmark),
   rasterizes to PNG with sharp. Re-run after brand changes:
     node scripts/build-og.mjs
   ============================================================ */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const W = 1200, H = 630;
const BG = "#0b0b0c", INK = "#edede8", ACCENT = "#d7ff3e", DIM = "#5a5a54";

// --- particle ring "O" (tilted torus of dots) on the right ---
const cx = 935, cy = 300;
const ringDots = [];
const ring = (radius, count, every) => {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    const accent = i % every === 0;
    const r = accent ? 3.4 : 2.6;
    ringDots.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${accent ? ACCENT : DIM}" opacity="${accent ? 1 : 0.72}"/>`
    );
  }
};
ring(205, 70, 6);
ring(150, 54, 6);
ring(108, 40, 7);

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="78%" cy="34%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="${ACCENT}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05"/>

  <!-- particle "O" -->
  <g transform="translate(${cx},${cy}) rotate(-15) scale(1,0.8)">
    <circle r="205" fill="none" stroke="${ACCENT}" stroke-width="1" opacity="0.14"/>
    <circle r="108" fill="none" stroke="${ACCENT}" stroke-width="1" opacity="0.14"/>
    ${ringDots.join("")}
  </g>

  <!-- eyebrow -->
  <g font-family="Menlo, 'Courier New', monospace" font-size="22" letter-spacing="4">
    <circle cx="86" cy="142" r="6" fill="${ACCENT}"/>
    <text x="104" y="150" fill="#9a9a93">AI-NATIVE PRODUCT STUDIO</text>
  </g>

  <!-- wordmark -->
  <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800">
    <text x="74" y="318" font-size="132" letter-spacing="-5" fill="${INK}">OUTBUILD</text>
    <text x="80" y="446" font-size="104" letter-spacing="-3" font-weight="700">
      <tspan fill="none" stroke="${INK}" stroke-width="2">THE</tspan><tspan fill="${INK}"> TIMELINE</tspan><tspan fill="${ACCENT}" font-size="40" dy="-44">®</tspan>
    </text>
  </g>

  <!-- footer url -->
  <text x="80" y="560" font-family="Menlo, 'Courier New', monospace" font-size="24" letter-spacing="2" fill="${ACCENT}">outbuildlab.com</text>
</svg>`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, "..", "public");
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, "og-source.svg"), svg);

await sharp(Buffer.from(svg)).png().toFile(join(pub, "og.png"));
console.log("Wrote public/og.png and public/og-source.svg");

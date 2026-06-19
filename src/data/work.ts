/* ============================================================
   OUTBUILD LAB — Work / case studies
   Single source of truth for the grid (home + /work) and the
   individual case pages (/work/[slug]). These are self-initiated
   CONCEPT builds — results are honest build facts, not invented
   client metrics, in keeping with "no inflated case studies".
   ============================================================ */

export interface CaseFeature {
  title: string;
  body: string;
}
export interface CaseScreen {
  n: number; // which mockup screen to render
  title: string;
  body: string;
}
export interface CaseStat {
  num: string;
  suffix: string;
  label: string;
}
export interface CaseStudy {
  // grid
  slug: string;
  name: string;
  mono: string;
  desc: string;
  tag: string; // build time, shown on the card
  variant: string; // grid placement class
  art: string; // gradient art class
  accent: string; // case accent hex
  // case page
  sector: string;
  year: string;
  role: string[];
  oneLiner: string;
  overview: string;
  challenge: string;
  approach: string;
  features: CaseFeature[];
  screens: CaseScreen[];
  stats: CaseStat[];
}

export const work: CaseStudy[] = [
  {
    slug: "helio",
    name: "Helio",
    mono: "He",
    desc: "Fintech app — strategy, product & build",
    tag: "5-DAY BUILD",
    variant: "wc-a",
    art: "wv-art-1",
    accent: "#b8e637",
    sector: "Fintech",
    year: "2026",
    role: ["Product strategy", "UX/UI design", "Engineering"],
    oneLiner: "A consumer banking app that makes your money legible at a glance.",
    overview:
      "Helio is a concept build exploring how an AI-native team ships a polished, trustworthy fintech surface in days — not the two quarters a bank would quote. The whole product is organised around one idea: the number you opened the app for should be the first thing you see.",
    challenge:
      "Most banking apps bury your balance under cards, carousels and cross-sell. The one number you came for takes three taps to trust. We wanted a dashboard that answers \"how am I doing?\" before you've finished unlocking your phone.",
    approach:
      "We generated a dozen dashboard directions with AI in an afternoon, curated hard to one calm layout, then built a working prototype on a double-entry ledger model so the numbers actually reconcile. Spend categorisation runs on a lightweight classifier; everything else is in service of clarity.",
    features: [
      { title: "Glanceable balance", body: "Your real balance and safe-to-spend, above the fold, always." },
      { title: "Auto-categorised spend", body: "Transactions sort themselves into clear buckets — no manual tagging." },
      { title: "Instant send", body: "A two-tap transfer flow with confirmation that feels safe, not scary." },
      { title: "Reconciled ledger", body: "A double-entry core behind the UI, because money bugs are unforgivable." },
    ],
    screens: [
      { n: 2, title: "Send in two taps", body: "A transfer flow that confirms who and how much before you commit — fast, but never careless." },
      { n: 3, title: "Spending, made obvious", body: "Auto-categorised insights with a glanceable breakdown, so you see where it went without doing the maths." },
    ],
    stats: [
      { num: "5", suffix: "", label: "Days, brief to prototype" },
      { num: "14", suffix: "", label: "Screens designed" },
      { num: "1", suffix: "", label: "Designer-engineer" },
      { num: "100", suffix: "%", label: "AI-assisted build" },
    ],
  },
  {
    slug: "northvane",
    name: "Northvane",
    mono: "Nv",
    desc: "Commerce platform — design & engineering",
    tag: "4-DAY BUILD",
    variant: "wc-b",
    art: "wv-art-2",
    accent: "#7a7dff",
    sector: "Commerce",
    year: "2026",
    role: ["Art direction", "UX/UI design", "Engineering"],
    oneLiner: "A headless storefront that loads instantly and feels like the brand.",
    overview:
      "Northvane is a concept build for a direct-to-consumer brand that refused to look like every other theme. It's a study in how far an AI-native team can push commerce craft — editorial design, real performance, a checkout that doesn't leak — on a four-day clock.",
    challenge:
      "Off-the-shelf commerce themes converge on the same template, and every extra step in checkout quietly costs sales. The brief: a storefront that feels art-directed, scores green on Core Web Vitals, and gets a shopper from product to paid in as few taps as possible.",
    approach:
      "Headless from the start. We generated art-direction routes with AI, curated to one confident system, and built an editorial product page plus a one-tap checkout on top of a headless commerce backend — with a CMS so the team ships content without a developer.",
    features: [
      { title: "Editorial PDP", body: "Product pages that read like a lookbook, not a spec sheet." },
      { title: "One-tap checkout", body: "Apple/Google Pay first, with a fallback that never loses the cart." },
      { title: "CMS without devs", body: "Merchandising and content edits ship without touching code." },
      { title: "Green Core Web Vitals", body: "Edge-cached and fast — because speed is a conversion lever." },
    ],
    screens: [
      { n: 2, title: "Product pages that sell", body: "An editorial PDP with gallery, sizing and one-line add-to-cart — designed like a lookbook, not a database row." },
      { n: 3, title: "Checkout that doesn't leak", body: "Wallet-first, card fallback, total always visible. Every step removed is a sale kept." },
    ],
    stats: [
      { num: "4", suffix: "", label: "Days, brief to prototype" },
      { num: "98", suffix: "", label: "Lighthouse target" },
      { num: "3", suffix: "", label: "Checkout taps" },
      { num: "100", suffix: "%", label: "AI-assisted build" },
    ],
  },
  {
    slug: "pulseroom",
    name: "Pulseroom",
    mono: "Pr",
    desc: "Health AI companion — RAG, product & mobile",
    tag: "6-DAY BUILD",
    variant: "wc-c",
    art: "wv-art-3",
    accent: "#ff7a5c",
    sector: "Health AI",
    year: "2026",
    role: ["Product strategy", "AI engineering", "Mobile design"],
    oneLiner: "An AI health companion that turns daily check-ins into a plan.",
    overview:
      "Pulseroom is our AI-products concept — a mobile health companion that listens to a 30-second daily check-in and turns it into something actionable. It's where the studio's \"build AI into the product\" capability gets to show its work: RAG, guardrails and evals, not a chatbot bolted on.",
    challenge:
      "Health apps track everything and tell you nothing. The hard part isn't the tracker — it's a companion that gives genuinely helpful, personalised guidance without drifting into medical advice it has no business giving.",
    approach:
      "We built retrieval over the user's own history so the companion reasons about you, not the average person — wrapped in guardrails that keep it firmly on the safe side of advice, and an eval set so quality is measured, not hoped for. The interface stays calm: a companion that explains, not a dashboard that nags.",
    features: [
      { title: "30-second check-in", body: "A daily voice or tap check-in that takes less time than making tea." },
      { title: "Companion with memory", body: "RAG over your own logs, so it reasons about you specifically." },
      { title: "Guardrailed advice", body: "Tuned and eval'd to stay clearly on the right side of medical guidance." },
      { title: "Gentle nudges", body: "Progress that motivates instead of shames, and earns a daily return." },
    ],
    screens: [
      { n: 2, title: "Vitals at a glance", body: "Sleep, HRV, steps and resting heart rate in one calm grid — the signal, without the spreadsheet." },
      { n: 3, title: "Patterns you'd miss", body: "The companion reads your week and surfaces the one insight that actually changes tomorrow." },
    ],
    stats: [
      { num: "6", suffix: "", label: "Days, brief to prototype" },
      { num: "40", suffix: "+", label: "Evals written" },
      { num: "2", suffix: "", label: "Guardrail layers" },
      { num: "100", suffix: "%", label: "AI-assisted build" },
    ],
  },
  {
    slug: "arcfield",
    name: "Arcfield",
    mono: "Af",
    desc: "Dev-tools — agent, brand, site & docs",
    tag: "3-DAY BUILD",
    variant: "wc-d",
    art: "wv-art-4",
    accent: "#3ee6c4",
    sector: "Developer Tools",
    year: "2026",
    role: ["Brand & identity", "Web", "AI engineering"],
    oneLiner: "A docs platform with an embedded agent that writes the integration for you.",
    overview:
      "Arcfield is a concept for a developer-tools company — brand, marketing site and docs system — with one twist that makes it AI-native: an agent living in the docs that drafts your integration code from a plain-English ask. Three days, end to end.",
    challenge:
      "Developer docs explain the API; they rarely get you to your first successful call. The gap between \"reading the reference\" and \"it works in my codebase\" is where most integrations stall — and where developers churn.",
    approach:
      "We built the identity and site fast with AI, then the differentiator: an agent embedded in the docs that takes \"send a webhook when a payment succeeds\" and returns working, copy-pasteable code for your stack — grounded in the live reference so it doesn't invent endpoints.",
    features: [
      { title: "Agent in the docs", body: "Ask in English, get integration code grounded in the real API." },
      { title: "Live playground", body: "Run calls against a sandbox without leaving the page." },
      { title: "Versioned reference", body: "Docs that track the API across versions, generated from source." },
      { title: "Brand & site", body: "A full identity and marketing site that looks like a real company." },
    ],
    screens: [
      { n: 2, title: "Try it before you wire it", body: "A live playground runs real calls against a sandbox and shows the response inline — no setup, no leaving the page." },
      { n: 3, title: "A dashboard devs trust", body: "Keys, environments and request volume in one clean console — the unglamorous surface, done right." },
    ],
    stats: [
      { num: "3", suffix: "", label: "Days, brief to ship" },
      { num: "1", suffix: "", label: "Embedded agent" },
      { num: "9", suffix: "", label: "Pages & references" },
      { num: "100", suffix: "%", label: "AI-assisted build" },
    ],
  },
];

export function getCase(slug: string): CaseStudy | undefined {
  return work.find((w) => w.slug === slug);
}
export function adjacent(slug: string): { prev: CaseStudy; next: CaseStudy } {
  const i = work.findIndex((w) => w.slug === slug);
  return {
    prev: work[(i - 1 + work.length) % work.length],
    next: work[(i + 1) % work.length],
  };
}

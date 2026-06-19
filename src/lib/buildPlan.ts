/* ============================================================
   OUTBUILD LAB — Build Plan generator
   Shared by the /api/build-plan endpoint (server, used as the
   fallback when no model key is set) and the client island
   (used if the endpoint is unreachable on a static deploy).

   It classifies a free-text product idea into an archetype and
   assembles a tailored plan: definition, scope, stack, day-by-day
   timeline and risks. Deterministic, instant, no network.
   ============================================================ */

export interface PlanStackItem {
  label: string;
  value: string;
}
export interface PlanPhase {
  day: string;
  label: string;
  detail: string;
}
export interface BuildPlan {
  idea: string;
  oneLiner: string;
  type: string;
  audience: string;
  signals: string[];
  scope: string[];
  stack: PlanStackItem[];
  timeline: PlanPhase[];
  risks: string[];
  source: "ai" | "lab";
}

interface Archetype {
  key: string;
  label: string;
  keywords: string[];
  audience: string;
  /** generic, always-grammatical framing — never interpolates raw user text */
  framing: string;
  scope: string[];
  stack: PlanStackItem[];
  risks: string[];
  days: number;
  buildDetail: string;
}

const COMMON_STACK: PlanStackItem[] = [
  { label: "Frontend", value: "Next.js · TypeScript · Tailwind" },
  { label: "Backend", value: "Edge functions · Postgres" },
  { label: "Infra", value: "Vercel · CI on every push" },
];

const ARCHETYPES: Archetype[] = [
  {
    key: "ai",
    label: "AI application",
    keywords: ["ai", "a.i", "gpt", "llm", "chatbot", "chat bot", "assistant", "agent", "generate", "summari", "copilot", "rag", "ml", "model", "prompt"],
    audience: "teams who want an AI feature that's dependable, not just a demo",
    framing:
      "We'd build this as an AI-native product — wrapped in the evals, guardrails and cost controls that make it dependable, not just a demo.",
    scope: [
      "Core LLM flow with streaming responses",
      "Retrieval layer (RAG) over your own data",
      "Eval harness so quality is measured, not vibes",
      "Guardrails, fallbacks and cost/latency budget",
      "Lightweight admin to inspect and correct outputs",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · streaming UI · Tailwind" },
      { label: "AI", value: "Claude · function calling · evals" },
      { label: "Data", value: "Postgres · pgvector retrieval" },
      { label: "Infra", value: "Edge functions · Vercel" },
    ],
    risks: [
      "Hallucination on edge cases — answered with retrieval + evals, not hope",
      "Token cost at scale — we model unit economics before launch",
      "Latency on long context — streaming + caching keep it snappy",
    ],
    days: 6,
    buildDetail: "Wire the model flow, retrieval and guardrails; stand up the eval set.",
  },
  {
    key: "marketplace",
    label: "two-sided marketplace",
    keywords: ["marketplace", "two-sided", "two sided", "buyers", "sellers", "vendors", "rent", "hire", "book a", "freelancer", "gig", "listing"],
    audience: "two sides who need each other but can't find each other",
    framing:
      "We'd build this as a two-sided marketplace — lean, proving liquidity on one side before scaling the other.",
    scope: [
      "Supply onboarding + listing creation",
      "Search, filters and a trust-building profile",
      "Booking / checkout with escrowed payments",
      "Ratings and reviews to bootstrap trust",
      "Ops dashboard to seed and monitor liquidity",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · TypeScript · Tailwind" },
      { label: "Backend", value: "Postgres · search index" },
      { label: "Payments", value: "Stripe Connect · escrow" },
      { label: "Infra", value: "Vercel · CI on every push" },
    ],
    risks: [
      "Cold-start liquidity — we pick the thin side and concierge it first",
      "Trust between strangers — reviews, verification, escrow from day one",
      "Disintermediation — keep the transaction worth keeping on-platform",
    ],
    days: 8,
    buildDetail: "Build listings, search, and the booking + payments core.",
  },
  {
    key: "fintech",
    label: "fintech product",
    keywords: ["payment", "wallet", "bank", "finance", "fintech", "invoice", "crypto", "lending", "loan", "savings", "money", "transfer", "payroll", "card"],
    audience: "people moving or managing money who are underserved today",
    framing:
      "We'd build this as a fintech product — engineered for the trust, accuracy and compliance money demands.",
    scope: [
      "KYC onboarding + secure auth",
      "Core ledger with audit trail",
      "Payments / transfers via a regulated rail",
      "Transaction history and clear statements",
      "Fraud and rate-limit guardrails",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · TypeScript · Tailwind" },
      { label: "Backend", value: "Postgres · double-entry ledger" },
      { label: "Payments", value: "Stripe / local rail · webhooks" },
      { label: "Infra", value: "Vercel · audit logging" },
    ],
    risks: [
      "Money bugs are unforgivable — double-entry ledger + reconciliation",
      "Compliance / KYC — scoped in from day one, not bolted on",
      "Fraud — velocity limits and anomaly checks before launch",
    ],
    days: 8,
    buildDetail: "Build the ledger, KYC and payment rail with full audit trail.",
  },
  {
    key: "saas",
    label: "B2B SaaS tool",
    keywords: ["dashboard", "analytics", "b2b", "saas", "workflow", "crm", "team", "internal tool", "admin", "report", "automation", "ops"],
    audience: "teams drowning in a manual workflow a tool should own",
    framing:
      "We'd build this as a B2B SaaS tool — opinionated enough to replace the spreadsheet it competes with.",
    scope: [
      "Auth with teams, roles and invites",
      "The core workflow, end to end",
      "Dashboard with the metrics that matter",
      "Integrations / import from what they use now",
      "Billing and usage limits",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · TypeScript · Tailwind" },
      { label: "Backend", value: "Postgres · row-level security" },
      { label: "Billing", value: "Stripe · metered usage" },
      { label: "Infra", value: "Vercel · CI on every push" },
    ],
    risks: [
      "Doing too much — we ship the one workflow that earns the login",
      "Migration friction — import from spreadsheets/tools they already use",
      "Multi-tenant data isolation — enforced at the database, not the app",
    ],
    days: 6,
    buildDetail: "Build auth, the core workflow and the metrics dashboard.",
  },
  {
    key: "commerce",
    label: "commerce experience",
    keywords: ["shop", "store", "ecommerce", "e-commerce", "commerce", "products", "checkout", "brand", "merch", "catalog", "dtc"],
    audience: "a brand whose store should convert and feel like them",
    framing:
      "We'd build this as a commerce experience — fast, beautiful, and tuned to convert.",
    scope: [
      "Editorial storefront + product pages",
      "Cart and a checkout that doesn't leak sales",
      "CMS so the team ships without a developer",
      "Payments, shipping and tax",
      "Analytics + abandoned-cart recovery",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · Tailwind · motion" },
      { label: "Commerce", value: "Shopify / Medusa · headless" },
      { label: "Payments", value: "Stripe · Apple/Google Pay" },
      { label: "Infra", value: "Vercel · edge caching" },
    ],
    risks: [
      "Checkout drop-off — measured and tuned, every step",
      "Page speed — core web vitals are a conversion lever, not a vanity score",
      "Content bottleneck — the CMS hands the keys to the team",
    ],
    days: 5,
    buildDetail: "Build the storefront, checkout and CMS-driven content.",
  },
  {
    key: "social",
    label: "social / community product",
    keywords: ["social", "community", "feed", "follow", "share", "creators", "messaging", "chat app", "forum", "network", "audience"],
    audience: "a community that doesn't have a home built for it yet",
    framing:
      "We'd build this as a community product — designed for the first hundred true fans before the next million.",
    scope: [
      "Profiles, follows and a real-time feed",
      "Posting with rich media",
      "Notifications and lightweight messaging",
      "Moderation tools from day one",
      "Onboarding that seeds the first connections",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · realtime · Tailwind" },
      { label: "Backend", value: "Postgres · websockets" },
      { label: "Media", value: "Object storage · CDN" },
      { label: "Infra", value: "Vercel · edge functions" },
    ],
    risks: [
      "Empty-room problem — onboarding seeds connections immediately",
      "Moderation — tools and policy exist before the first bad actor",
      "Realtime cost — we right-size the infra for the actual graph",
    ],
    days: 7,
    buildDetail: "Build profiles, the realtime feed and moderation tooling.",
  },
  {
    key: "health",
    label: "health / wellness product",
    keywords: ["health", "fitness", "patient", "wellness", "medical", "therapy", "mental", "care", "clinic", "doctor", "diet", "sleep"],
    audience: "people managing their health who deserve a calmer tool",
    framing:
      "We'd build this as a health product — calm, private and trustworthy by design.",
    scope: [
      "Private, secure onboarding + profile",
      "The core tracking / care loop",
      "Reminders and gentle nudges",
      "Progress views that motivate, not shame",
      "Data export and privacy controls",
    ],
    stack: [
      { label: "Frontend", value: "Next.js / Expo · Tailwind" },
      { label: "Backend", value: "Postgres · encrypted at rest" },
      { label: "Privacy", value: "Consent + export · audit log" },
      { label: "Infra", value: "Vercel · compliant hosting" },
    ],
    risks: [
      "Sensitive data — privacy and consent are the architecture, not a setting",
      "Adherence — the product has to earn a daily return visit",
      "Scope of claims — we stay clearly on the right side of medical advice",
    ],
    days: 7,
    buildDetail: "Build the secure profile, the tracking loop and progress views.",
  },
  {
    key: "edtech",
    label: "learning product",
    keywords: ["learn", "course", "education", "students", "teach", "edtech", "study", "tutor", "lesson", "quiz", "skill", "training"],
    audience: "learners who need to actually finish, not just enroll",
    framing:
      "We'd build this as a learning product — built around completion, not just enrollment.",
    scope: [
      "Lessons / content with progress tracking",
      "Practice or quizzes with feedback",
      "Streaks and gentle accountability",
      "Instructor or admin authoring",
      "Certificates / proof of progress",
    ],
    stack: [
      { label: "Frontend", value: "Next.js · TypeScript · Tailwind" },
      { label: "Backend", value: "Postgres · progress model" },
      { label: "Media", value: "Video / CDN · transcripts" },
      { label: "Infra", value: "Vercel · CI on every push" },
    ],
    risks: [
      "Drop-off — completion is designed for, with streaks and pacing",
      "Content pipeline — authoring is easy or the catalog stalls",
      "Assessment integrity — feedback that teaches, not just grades",
    ],
    days: 6,
    buildDetail: "Build the lesson flow, practice loop and progress tracking.",
  },
];

const DEFAULT_ARCHETYPE: Archetype = {
  key: "web",
  label: "digital product",
  keywords: [],
  audience: "the users you're building for",
  framing:
      "We'd build this as a focused digital product — scoped to the smallest version that proves the idea.",
  scope: [
    "Auth and a clean onboarding",
    "The one core flow, done well",
    "A dashboard or home that orients the user",
    "The single integration that matters most",
    "Analytics so v2 is informed, not guessed",
  ],
  stack: COMMON_STACK,
  risks: [
    "Scope creep — we ship the core loop first, then earn the rest",
    "Premature scale — built clean, sized for today's traffic",
    "Building in the dark — analytics from day one to steer v2",
  ],
  days: 5,
  buildDetail: "Build auth, the core flow and the primary integration.",
};

function classify(idea: string): { arch: Archetype; signals: string[] } {
  const text = " " + idea.toLowerCase() + " ";
  let best = DEFAULT_ARCHETYPE;
  let bestScore = 0;
  const signals = new Set<string>();
  for (const arch of ARCHETYPES) {
    let score = 0;
    for (const kw of arch.keywords) {
      if (text.includes(kw)) {
        score += 1;
        signals.add(arch.key);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }
  // mobile is a cross-cutting signal, not an archetype
  if (/\b(app|ios|android|mobile|on the go|phone)\b/.test(text)) signals.add("mobile");
  if (/\b(ai|gpt|llm|agent|assistant|smart)\b/.test(text)) signals.add("ai");
  const labels = [...signals].slice(0, 4);
  return { arch: best, signals: labels.length ? labels : ["web"] };
}

function buildTimeline(arch: Archetype): PlanPhase[] {
  const d = arch.days;
  const phases: PlanPhase[] = [
    { day: "Day 1", label: "Brief & spec", detail: "AI compresses discovery; we lock the scope and the one thing v1 must prove." },
    { day: "Day 2", label: "Design & system", detail: "Generate directions, curate to one, set tokens, components and core screens." },
  ];
  const buildDays = Math.max(1, d - 4);
  if (buildDays <= 1) {
    phases.push({ day: "Day 3", label: "Build core", detail: arch.buildDetail });
  } else {
    phases.push({ day: `Days 3–${2 + buildDays}`, label: "Build core", detail: arch.buildDetail });
  }
  const integrateDay = 3 + buildDays;
  phases.push({ day: `Day ${integrateDay}`, label: "Integrate & test", detail: "Wire payments/data/AI, write the tests that matter, hammer the edges." });
  phases.push({ day: `Day ${d}`, label: "Ship", detail: "Polish, deploy, instrument analytics, hand over the keys — live for real users." });
  return phases;
}

export function generatePlan(idea: string): BuildPlan {
  const { arch, signals } = classify(idea);
  return {
    idea: idea.trim(),
    oneLiner: arch.framing,
    type: arch.label,
    audience: arch.audience,
    signals,
    scope: arch.scope,
    stack: arch.stack,
    timeline: buildTimeline(arch),
    risks: arch.risks,
    source: "lab",
  };
}

/** Human label for a detected signal chip. */
export const SIGNAL_LABELS: Record<string, string> = {
  ai: "AI",
  marketplace: "Marketplace",
  fintech: "Payments",
  saas: "B2B SaaS",
  commerce: "Commerce",
  social: "Community",
  health: "Health",
  edtech: "Learning",
  mobile: "Mobile",
  web: "Web",
};

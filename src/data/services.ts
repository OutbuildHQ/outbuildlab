export interface Service {
  slug: string;
  name: string;
  tags: string[];
  blurb: string;
}

export const services: Service[] = [
  {
    slug: "strategy",
    name: "Product Strategy",
    tags: ["AI research", "Positioning", "Roadmaps", "Validation"],
    blurb:
      "We use AI to compress weeks of discovery into days — scanning the market, modelling users, stress-testing the idea from every angle. Then we make the calls a model can't: what's actually worth building, and the smallest version that proves it. You leave with a roadmap that survives contact with reality.",
  },
  {
    slug: "design",
    name: "Product Design",
    tags: ["AI-native systems", "Interfaces", "Prototyping", "Motion"],
    blurb:
      "We generate dozens of directions with AI and curate ruthlessly down to the one that feels inevitable. Designed in systems — tokens, components, motion — so what ships is consistent on day one and still consistent at version ten. Volume from the model, taste from us.",
  },
  {
    slug: "engineering",
    name: "Engineering",
    tags: ["AI-built", "Web & mobile", "APIs", "DevOps"],
    blurb:
      "The same team that designs it, builds it — with AI writing the first draft of nearly everything and senior judgment reviewing every line that ships. Modern web and mobile stacks, real test coverage, and infrastructure that doesn't fall over the day you get traffic.",
  },
  {
    slug: "ai-products",
    name: "AI Product Engineering",
    tags: ["RAG", "Agents", "Evals", "LLM integration"],
    blurb:
      "We don't just build with AI — we build AI into your product. RAG that doesn't hallucinate, agents that survive real users, and the eval harnesses, cost tuning and guardrails that get an AI feature from impressive demo to dependable production.",
  },
  {
    slug: "brand",
    name: "Brand & Motion",
    tags: ["Identity", "Art direction", "3D & motion", "Interaction"],
    blurb:
      "Identity that moves. Naming, art direction, interaction and 3D — generated fast, directed sharp. The layer that makes people screenshot your product and send it to a friend.",
  },
];

// Work / case-study data now lives in src/data/work.ts (single source
// of truth for the grid and the /work/[slug] case pages).

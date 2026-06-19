/* ============================================================
   POST /api/build-plan
   Returns a structured BuildPlan for a free-text product idea.

   - If ANTHROPIC_API_KEY is set, it asks Claude for the plan
     (source: "ai").
   - Otherwise — or if the model call fails — it falls back to the
     local heuristic generator (source: "lab"), so the demo always
     works, even with no key and no network.

   NOTE: this is an on-demand route. For a STATIC deploy add an
   adapter (e.g. @astrojs/vercel) so the function ships; until then
   the client island falls back to the same generator locally.
   ============================================================ */
import type { APIRoute } from "astro";
import { generatePlan, type BuildPlan } from "../../lib/buildPlan";

export const prerender = false;

const MODEL = "claude-haiku-4-5-20251001"; // fast + cheap for a public demo; bump to claude-opus-4-8 for depth

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function planWithClaude(idea: string, apiKey: string): Promise<BuildPlan> {
  const system =
    "You are a senior product strategist at Outbuild Lab, an AI-native product studio whose pitch is shipping a real v1 in days. " +
    "Given a one-line product idea, return a tight, opinionated build plan. Be concrete and lean; favour the smallest version that proves the idea. " +
    "Respond ONLY with minified JSON matching exactly this TypeScript type, no markdown, no prose:\n" +
    '{"oneLiner":string,"type":string,"audience":string,"signals":string[],"scope":string[5],"stack":{"label":string,"value":string}[],"timeline":{"day":string,"label":string,"detail":string}[],"risks":string[3]}\n' +
    "Rules: scope = 5 MVP items. timeline = 5 phases across a days-not-months build, days labelled like 'Day 1' or 'Days 3–5', ending in 'Ship'. signals = up to 4 short tags. Keep every string under 22 words.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: `Product idea: ${idea}` }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  const parsed = JSON.parse(text.slice(start, end + 1));

  // shape-guard: fall back if the model returned something unusable
  if (!parsed.oneLiner || !Array.isArray(parsed.scope) || !Array.isArray(parsed.timeline)) {
    throw new Error("Malformed plan");
  }
  return { idea: idea.trim(), source: "ai", signals: parsed.signals ?? [], ...parsed };
}

export const POST: APIRoute = async ({ request }) => {
  let idea = "";
  try {
    const body = await request.json();
    idea = typeof body?.idea === "string" ? body.idea : "";
  } catch {
    /* ignore */
  }

  idea = idea.trim();
  if (idea.length < 3) {
    return json({ error: "Tell us a little more about the idea." }, 400);
  }
  if (idea.length > 600) idea = idea.slice(0, 600);

  const apiKey =
    import.meta.env.ANTHROPIC_API_KEY ||
    (typeof process !== "undefined" ? process.env?.ANTHROPIC_API_KEY : undefined);

  if (apiKey) {
    try {
      return json(await planWithClaude(idea, apiKey));
    } catch (err) {
      // model unavailable / rate-limited / malformed — degrade gracefully
      console.warn("[build-plan] model path failed, using local generator:", (err as Error).message);
    }
  }

  return json(generatePlan(idea));
};

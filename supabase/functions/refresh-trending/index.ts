// Supabase Edge Function: refresh-trending
//
// Purpose: this is what makes the store "self-run" daily. Schedule it with
// a Supabase Cron Trigger (Dashboard > Edge Functions > refresh-trending >
// Schedule) set to run once a day, e.g. "0 8 * * *" for 8am UTC.
//
// CURRENT BEHAVIOR: re-randomizes trending_score on existing products so the
// homepage grid genuinely re-sorts each day. This is a placeholder — it
// proves the daily self-refresh loop end-to-end without needing supplier
// credentials yet.
//
// TODO (when CJDropshipping/Zendrop/Spocket API keys are added):
//   1. Fetch each supplier's trending/bestseller endpoint.
//   2. Upsert new products into `products` (map their fields to ours).
//   3. Set trending_score from real sales-velocity data instead of random.
//   4. Deactivate (is_active = false) products that are out of stock upstream.
//
// Deploy with: supabase functions deploy refresh-trending

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Simple shared-secret check so this can't be triggered by randoms.
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: products, error: fetchErr } = await supabase
    .from("products")
    .select("id, trending_score")
    .eq("is_active", true);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
  }

  // Placeholder trending logic: random walk around the current score.
  // Replace this block with real supplier-driven ranking later.
  const updates = (products ?? []).map((p) => {
    const drift = Math.floor(Math.random() * 21) - 10; // -10..+10
    const next = Math.max(0, Math.min(100, p.trending_score + drift));
    return { id: p.id, trending_score: next };
  });

  for (const u of updates) {
    await supabase.from("products").update({ trending_score: u.trending_score }).eq("id", u.id);
  }

  return new Response(
    JSON.stringify({ ok: true, updated: updates.length, ranAt: new Date().toISOString() }),
    { headers: { "Content-Type": "application/json" } }
  );
});

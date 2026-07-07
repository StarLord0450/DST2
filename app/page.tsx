import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";

export const revalidate = 60; // re-check trending order every minute

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("trending_score", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="relative py-16 sm:py-24 border-b border-line overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="font-mono text-xs text-acid mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse" />
            CATALOG SYNCED — {list.length} PRODUCTS LIVE
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-ink leading-[1.05]">
            Today's trending picks,
            <br />
            <span className="text-cyan">shipped without you lifting a finger.</span>
          </h1>
          <p className="mt-6 text-muted font-body max-w-lg">
            The catalog re-ranks itself daily against real demand signals.
            Nothing here is hand-picked — it earned its spot on the grid.
          </p>
        </div>
        <div className="scanline opacity-30" />
      </section>

      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Trending now
          </h2>
          <span className="font-mono text-xs text-muted cursor" />
        </div>

        {list.length === 0 ? (
          <div className="border border-line rounded-lg p-12 text-center text-muted font-mono text-sm">
            No products yet. Run <code className="text-cyan">supabase/seed.sql</code> to
            load the starter catalog.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

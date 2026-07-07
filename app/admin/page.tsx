import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // always fresh — this is a live dashboard

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, customer_email, tracking_number, created_at")
    .order("created_at", { ascending: false });

  const all = orders ?? [];
  const paid = all.filter((o) => o.status !== "cancelled");
  const revenueCents = paid.reduce((sum, o) => sum + o.total_cents, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = all.filter((o) => new Date(o.created_at) >= today);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total_cents, 0);

  const { data: products } = await supabase
    .from("products")
    .select("id, price_cents, cost_cents")
    .eq("is_active", true);

  const potentialMarginCents = (products ?? []).reduce(
    (sum, p) => sum + (p.price_cents - p.cost_cents),
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="flex items-center gap-2 mb-8">
        <span className="h-2 w-2 rounded-full bg-acid animate-pulse" />
        <h1 className="font-display text-2xl font-bold text-ink">Admin — live</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="total revenue" value={`$${(revenueCents / 100).toFixed(2)}`} accent="text-cyan" />
        <Stat label="today's revenue" value={`$${(todaysRevenue / 100).toFixed(2)}`} accent="text-acid" />
        <Stat label="total orders" value={String(all.length)} accent="text-ink" />
        <Stat label="orders today" value={String(todaysOrders.length)} accent="text-ink" />
      </div>

      <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
        Recent orders
      </h2>
      <div className="border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead className="bg-panel2 text-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Order</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Tracking</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-right px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {all.slice(0, 50).map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-4 py-2 text-ink">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-2 text-muted">{o.customer_email}</td>
                <td className="px-4 py-2 text-acid">{o.status}</td>
                <td className="px-4 py-2 text-muted">{o.tracking_number ?? "—"}</td>
                <td className="px-4 py-2 text-right text-cyan">
                  ${(o.total_cents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right text-muted">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {all.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">No orders yet.</div>
        )}
      </div>

      <p className="text-muted text-xs font-mono mt-6">
        Potential margin across active catalog: $
        {(potentialMarginCents / 100).toFixed(2)} (sum of price − cost on all
        active listings, not yet realized revenue)
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="border border-line rounded-lg p-4 bg-panel">
      <div className="text-muted font-mono text-[10px] uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className={`font-display text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

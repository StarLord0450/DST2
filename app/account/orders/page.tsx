import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, tracking_number, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink mb-8">Order history</h1>

      {!orders?.length ? (
        <p className="text-muted font-mono text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-line rounded-lg p-4 bg-panel font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink">{o.id.slice(0, 8)}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center justify-between mt-2 text-muted">
                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="text-cyan">${(o.total_cents / 100).toFixed(2)}</span>
              </div>
              {o.tracking_number && (
                <div className="mt-2 text-xs text-muted">
                  Tracking: <span className="text-ink">{o.tracking_number}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-warn",
    paid: "text-acid",
    fulfilled: "text-cyan",
    cancelled: "text-muted",
    refunded: "text-magenta",
  };
  return <span className={colors[status] ?? "text-muted"}>{status}</span>;
}

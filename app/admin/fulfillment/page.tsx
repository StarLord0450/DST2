import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TrackingForm from "@/components/admin/TrackingForm";

export const dynamic = "force-dynamic";

export default async function FulfillmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") redirect("/");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("status", "paid")
    .order("created_at", { ascending: true });

  const list = orders ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-ink mb-2">
        Fulfillment Queue
      </h1>
      <p className="font-mono text-xs text-muted mb-8">
        {list.length} order{list.length !== 1 ? "s" : ""} awaiting fulfillment
      </p>

      {list.length === 0 ? (
        <div className="border border-line rounded-lg p-12 text-center text-muted font-mono text-sm">
          No orders awaiting fulfillment. Nice work.
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((order: any) => {
            const addr = order.shipping_address;
            return (
              <div
                key={order.id}
                className="border border-line rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-mono text-xs text-muted">
                      Order #{order.id.slice(0, 8)} •{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="font-mono text-sm text-ink mt-1">
                      {order.customer_email}
                    </div>
                  </div>
                  <div className="font-mono text-sm text-cyan">
                    ${(order.total_cents / 100).toFixed(2)}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-xs uppercase text-muted mb-1">
                      Ship to
                    </div>
                    {addr ? (
                      <div className="font-mono text-sm text-ink leading-relaxed">
                        {addr.name}
                        <br />
                        {addr.line1}
                        {addr.line2 ? <>, {addr.line2}</> : null}
                        <br />
                        {addr.city}, {addr.state} {addr.postal_code}
                        <br />
                        {addr.country}
                      </div>
                    ) : (
                      <div className="font-mono text-sm text-red-400">
                        No shipping address on file
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-mono text-xs uppercase text-muted mb-1">
                      Items
                    </div>
                    <ul className="font-mono text-sm text-ink space-y-1">
                      {order.order_items?.map((item: any) => (
                        <li key={item.id}>
                          {item.quantity}× {item.product_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <TrackingForm
                  orderId={order.id}
                  currentTracking={order.tracking_number}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
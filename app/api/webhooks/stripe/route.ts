import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import Stripe from "stripe";

// Stripe requires the raw request body to verify the signature —
// disable Next's default body parsing for this route.
export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleOrderCreation(session);
  }

  return NextResponse.json({ received: true });
}

async function handleOrderCreation(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();

  // Idempotency: don't double-create if Stripe retries the webhook.
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const cartMeta = JSON.parse(session.metadata?.cart ?? "[]") as {
    product_id: string;
    quantity: number;
  }[];
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_email: email,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      status: "paid",
      total_cents: session.amount_total ?? 0,
      tracking_number: generateFakeTrackingNumber(),
      shipping_address: shippingAddress,
    })

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents")
    .in("id", cartMeta.map((i) => i.product_id));

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_email: email,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      status: "paid",
      total_cents: session.amount_total ?? 0,
      tracking_number: generateFakeTrackingNumber(),
    })
    .select()
    .single();

  if (orderErr || !order) {
    console.error("Failed to create order", orderErr);
    return;
  }

  const orderItems = cartMeta.map((item) => {
    const product = products?.find((p: any) => p.id === item.product_id);
    return {
      order_id: order.id,
      product_id: item.product_id,
      product_name: product?.name ?? "Product",
      unit_price_cents: product?.price_cents ?? 0,
      quantity: item.quantity,
    };
  });

  await supabase.from("order_items").insert(orderItems);

  // Clear the user's server-side cart now that it's converted to an order.
  if (userId) {
    await supabase.from("cart_items").delete().eq("user_id", userId);
  }

  await sendTrackingEmail(order, email);

  // NOTE: This is where a real supplier order would be placed —
  // e.g. POST to CJDropshipping's createOrder endpoint using order_items.
  // Left unimplemented until CJDropshipping/Zendrop/Spocket API keys are added.
}

function generateFakeTrackingNumber() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `DST${rand}`;
}

async function sendTrackingEmail(order: any, email: string) {
  if (!resend) {
    console.log(`[dev] Would send tracking email to ${email} for order ${order.id}`);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "orders@dropshiptroopers.dev",
      to: email,
      subject: `Your order is on its way — ${order.tracking_number}`,
      html: `
        <div style="font-family: monospace; background:#080b12; color:#e7eefb; padding:24px;">
          <h2 style="color:#00f0ff;">Order confirmed</h2>
          <p>Total: $${(order.total_cents / 100).toFixed(2)}</p>
          <p>Tracking number: <strong>${order.tracking_number}</strong></p>
          <p style="color:#7f8ba3; font-size:12px;">
            This is a placeholder tracking number. Real carrier tracking will
            populate here once a supplier API (CJDropshipping/Zendrop/Spocket)
            is connected.
          </p>
        </div>
      `,
    });

    const supabase = createServiceClient();
    await supabase.from("orders").update({ tracking_email_sent: true }).eq("id", order.id);
  } catch (err) {
    console.error("Failed to send tracking email", err);
  }
}

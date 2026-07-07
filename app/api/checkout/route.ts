import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { items } = (await request.json()) as {
    items: { product_id: string; quantity: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Never trust client-supplied prices — re-fetch from the DB.
  const ids = items.map((i) => i.product_id);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price_cents, image_url, stock")
    .in("id", ids);

  if (error || !products?.length) {
    return NextResponse.json({ error: "Could not load products" }, { status: 400 });
  }

  const line_items = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) throw new Error("Unknown product in cart");
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.image_url ? [product.image_url] : [],
          metadata: { product_id: product.id },
        },
        unit_amount: product.price_cents,
      },
      quantity: item.quantity,
    };
  });

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    customer_email: user?.email,
    shipping_address_collection: {
      allowed_countries: ["US", "CA"],
    },
    metadata: {
      user_id: user?.id ?? "",
      cart: JSON.stringify(
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
      ),
    },
  });

  return NextResponse.json({ url: session.url });
}

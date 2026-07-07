"use client";

import { CartLine } from "./types";
import { createClient } from "./supabase/client";

const CART_KEY = "dst_cart_v1";

export function readLocalCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  // notify any listeners in this tab (e.g. header cart badge)
  window.dispatchEvent(new CustomEvent("dst-cart-changed"));
}

export function addToLocalCart(line: CartLine) {
  const cart = readLocalCart();
  const existing = cart.find((c) => c.product_id === line.product_id);
  if (existing) {
    existing.quantity += line.quantity;
  } else {
    cart.push(line);
  }
  writeLocalCart(cart);
  return cart;
}

export function updateLocalCartQty(productId: string, quantity: number) {
  let cart = readLocalCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.product_id !== productId);
  } else {
    const line = cart.find((c) => c.product_id === productId);
    if (line) line.quantity = quantity;
  }
  writeLocalCart(cart);
  return cart;
}

export function clearLocalCart() {
  writeLocalCart([]);
}

export function cartTotalCents(cart: CartLine[]) {
  return cart.reduce((sum, l) => sum + l.price_cents * l.quantity, 0);
}

// Called after a user signs in: pushes the local (guest) cart into
// cart_items so it's tied to their account, then merges any rows that
// were already saved server-side from a previous session.
export async function syncCartToDb() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const local = readLocalCart();

  for (const line of local) {
    await supabase
      .from("cart_items")
      .upsert(
        { user_id: user.id, product_id: line.product_id, quantity: line.quantity },
        { onConflict: "user_id,product_id" }
      );
  }

  // pull merged server cart back down so local mirrors DB (source of truth once logged in)
  const { data: rows } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price_cents, image_url)")
    .eq("user_id", user.id);

  if (rows) {
    const merged: CartLine[] = rows.map((r: any) => ({
      product_id: r.product_id,
      quantity: r.quantity,
      name: r.products?.name ?? "Product",
      price_cents: r.products?.price_cents ?? 0,
      image_url: r.products?.image_url ?? null,
    }));
    writeLocalCart(merged);
  }
}

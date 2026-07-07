"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  readLocalCart,
  updateLocalCartQty,
  cartTotalCents,
} from "@/lib/cart";
import { CartLine } from "@/lib/types";

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(readLocalCart());
    const refresh = () => setCart(readLocalCart());
    window.addEventListener("dst-cart-changed", refresh);
    return () => window.removeEventListener("dst-cart-changed", refresh);
  }, []);

  function setQty(productId: string, qty: number) {
    const updated = updateLocalCartQty(productId, qty);
    setCart(updated);
  }

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout failed");
        setLoading(false);
      }
    } catch {
      alert("Checkout failed");
      setLoading(false);
    }
  }

  const total = cartTotalCents(cart);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink mb-8">Cart</h1>

      {cart.length === 0 ? (
        <p className="text-muted font-mono text-sm">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((line) => (
            <div
              key={line.product_id}
              className="flex items-center gap-4 border border-line rounded-lg p-3 bg-panel"
            >
              <div className="relative h-16 w-16 rounded overflow-hidden bg-panel2 shrink-0">
                {line.image_url && (
                  <Image src={line.image_url} alt={line.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{line.name}</p>
                <p className="font-mono text-cyan text-sm">
                  ${(line.price_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <button
                  onClick={() => setQty(line.product_id, line.quantity - 1)}
                  className="h-7 w-7 border border-line rounded hover:border-cyan text-ink"
                >
                  −
                </button>
                <span className="w-6 text-center">{line.quantity}</span>
                <button
                  onClick={() => setQty(line.product_id, line.quantity + 1)}
                  className="h-7 w-7 border border-line rounded hover:border-cyan text-ink"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setQty(line.product_id, 0)}
                className="text-muted hover:text-magenta text-xs font-mono"
              >
                remove
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t border-line">
            <span className="font-mono text-muted text-sm">Total</span>
            <span className="font-mono text-ink text-xl">
              ${(total / 100).toFixed(2)}
            </span>
          </div>

          <button
            onClick={checkout}
            disabled={loading}
            className="w-full bg-cyan text-void font-mono font-bold py-3 rounded hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "redirecting to stripe..." : "checkout"}
          </button>
        </div>
      )}
    </div>
  );
}

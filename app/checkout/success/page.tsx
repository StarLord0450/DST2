"use client";

import { useEffect } from "react";
import Link from "next/link";
import { clearLocalCart } from "@/lib/cart";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    clearLocalCart();
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-acid font-mono text-xs mb-4">PAYMENT CONFIRMED</div>
      <h1 className="font-display text-3xl font-bold text-ink mb-4">
        You're all set.
      </h1>
      <p className="text-muted font-mono text-sm mb-8">
        A confirmation and tracking number are on their way to your inbox.
      </p>
      <Link
        href="/account/orders"
        className="inline-block bg-cyan text-void font-mono font-bold px-6 py-3 rounded hover:bg-ink transition-colors"
      >
        view order history
      </Link>
    </div>
  );
}

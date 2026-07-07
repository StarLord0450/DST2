"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readLocalCart, syncCartToDb } from "@/lib/cart";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      setEmail(session?.user?.email ?? null);
      if (event === "SIGNED_IN") {
        await syncCartToDb();
        refreshCount();
      }
    });

    refreshCount();
    window.addEventListener("dst-cart-changed", refreshCount);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("dst-cart-changed", refreshCount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshCount() {
    const cart = readLocalCart();
    setCartCount(cart.reduce((n, l) => n + l.quantity, 0));
  }

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg tracking-tight text-ink">
          DROPSHIP<span className="text-cyan">TROOPERS</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-mono">
          <Link href="/" className="text-muted hover:text-cyan transition-colors">
            catalog
          </Link>
          {email && (
            <Link href="/account/orders" className="text-muted hover:text-cyan transition-colors">
              orders
            </Link>
          )}
          <Link href="/cart" className="relative text-muted hover:text-cyan transition-colors">
            cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-magenta text-void text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {email ? (
            <button onClick={signOut} className="text-muted hover:text-magenta transition-colors">
              sign out
            </button>
          ) : (
            <Link href="/login" className="text-cyan hover:text-ink transition-colors">
              sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

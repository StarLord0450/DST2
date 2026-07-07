import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-warn font-mono text-xs mb-4">CHECKOUT CANCELLED</div>
      <h1 className="font-display text-3xl font-bold text-ink mb-4">
        No charge was made.
      </h1>
      <Link
        href="/cart"
        className="inline-block bg-cyan text-void font-mono font-bold px-6 py-3 rounded hover:bg-ink transition-colors"
      >
        back to cart
      </Link>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Product } from "@/lib/types";
import { addToLocalCart } from "@/lib/cart";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToLocalCart({
      product_id: product.id,
      quantity: 1,
      name: product.name,
      price_cents: product.price_cents,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group relative card-border bg-panel rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-panel2 overflow-hidden">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {product.trending_score >= 90 && (
          <span className="absolute top-2 left-2 bg-magenta text-void text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            HOT
          </span>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity scanline" />
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between mt-auto">
          <span className="font-mono text-cyan text-base">
            ${(product.price_cents / 100).toFixed(2)}
          </span>
          <span className="font-mono text-[10px] text-muted">{product.supplier}</span>
        </div>
        <button
          onClick={handleAdd}
          className="mt-1 w-full text-xs font-mono py-2 rounded border border-cyan/40 text-cyan hover:bg-cyan hover:text-void transition-colors"
        >
          {added ? "added ✓" : "add to cart"}
        </button>
      </div>
    </div>
  );
}

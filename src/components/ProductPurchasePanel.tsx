"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

type ProductInfo = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colors: string;
  sizes: string;
  stock: number;
};

export default function ProductPurchasePanel({ product }: { product: ProductInfo }) {
  const { addItem } = useCart();
  const colors = product.colors.split(",");
  const sizes = product.sizes.split(",");
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      color,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8">
      <p className="text-sm font-bold uppercase tracking-wide">Couleur</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
              color === c ? "border-brand-black bg-brand-black text-white" : "border-neutral-300 bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-bold uppercase tracking-wide">Taille</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`h-11 w-14 rounded-xl border-2 text-sm font-bold transition ${
              size === s ? "border-brand-black bg-brand-black text-white" : "border-neutral-300 bg-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded-full border-2 border-brand-black">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 text-lg font-bold">−</button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button onClick={() => setQty(Math.min(10, qty + 1))} className="px-4 py-2 text-lg font-bold">+</button>
        </div>
        <button onClick={handleAdd} className="btn-primary flex-1">
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>

      {added && (
        <Link href="/panier" className="mt-3 inline-block text-sm font-bold text-brand-accent hover:underline">
          Voir mon panier →
        </Link>
      )}
    </div>
  );
}

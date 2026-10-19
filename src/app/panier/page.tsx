"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice, computeShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-black uppercase">Panier vide</h1>
        <p className="mt-4 text-neutral-500">Il est temps de craquer pour un tee 😏</p>
        <Link href="/boutique" className="btn-primary mt-8">Voir la boutique</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase">Mon panier</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="card flex gap-4">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/produit/${item.slug}`} className="font-bold hover:text-brand-accent">
                      {item.name}
                    </Link>
                    <p className="text-sm text-neutral-500">
                      {item.color} · Taille {item.size}
                    </p>
                  </div>
                  <p className="font-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-neutral-300">
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity - 1)}
                      className="px-3 py-1 font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity + 1)}
                      className="px-3 py-1 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-sm text-neutral-400 hover:text-brand-accent"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit">
          <h2 className="font-display text-xl font-black uppercase">Récapitulatif</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Sous-total</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd className="font-semibold">{shipping === 0 ? "Offerte 🎉" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
              <dt className="font-black">Total</dt>
              <dd className="font-black">{formatPrice(total)}</dd>
            </div>
          </dl>
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className="mt-3 text-xs text-neutral-500">
              Plus que {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} pour la livraison offerte !
            </p>
          )}
          <Link href="/checkout" className="btn-primary mt-6 w-full">Commander</Link>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { formatPrice, computeShipping } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;
  const [loading, setLoading] = useState<"card" | "paypal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    customerName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "France",
  });

  async function createPendingOrder(paymentMethod: "CARD" | "PAYPAL"): Promise<string | null> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erreur lors de la création de la commande");
      return null;
    }
    const data = await res.json();
    return data.orderId;
  }

  async function validate(): Promise<boolean> {
    if (items.length === 0) {
      setError("Votre panier est vide");
      return false;
    }
    for (const [key, value] of Object.entries(form)) {
      if (key === "addressLine2" && !value) continue;
      if (!value) {
        setError("Merci de remplir tous les champs obligatoires");
        return false;
      }
    }
    return true;
  }

  async function payByCard() {
    setError(null);
    if (!(await validate())) return;
    setLoading("card");
    const orderId = await createPendingOrder("CARD");
    if (!orderId) {
      setLoading(null);
      return;
    }
    const res = await fetch("/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      setLoading(null);
      return;
    }
    if (!data.url) {
      setError("Impossible de démarrer le paiement Stripe");
      setLoading(null);
      return;
    }
    window.location.assign(data.url);
  }

  async function payByPaypal() {
    setError(null);
    if (!(await validate())) return;
    setLoading("paypal");
    const orderId = await createPendingOrder("PAYPAL");
    if (!orderId) {
      setLoading(null);
      return;
    }
    window.location.href = `/api/checkout/paypal?orderId=${orderId}`;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-black uppercase">Panier vide</h1>
        <p className="mt-4 text-neutral-500">Ajoutez des articles avant de commander.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase">Commander</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="card">
          <h2 className="font-display text-xl font-black uppercase">Livraison</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className="input sm:col-span-2" placeholder="Email *" type="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Nom complet *"
              value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Adresse *"
              value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Complément d'adresse"
              value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
            <input className="input" placeholder="Ville *"
              value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="Code postal *"
              value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Pays *"
              value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>

          <h2 className="mt-8 font-display text-xl font-black uppercase">Paiement</h2>
          {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 space-y-3">
            <button onClick={payByCard} disabled={loading !== null} className="btn-primary w-full">
              {loading === "card" ? "Redirection…" : "💳 Payer par carte (Stripe)"}
            </button>
            <button onClick={payByPaypal} disabled={loading !== null} className="btn-outline w-full !bg-[#ffc439] !border-[#ffc439] !text-[#003087] hover:!bg-[#ffb31a]">
              {loading === "paypal" ? "Redirection…" : "🅿 Payer avec PayPal"}
            </button>
          </div>
        </div>

        <aside className="card h-fit">
          <h2 className="font-display text-xl font-black uppercase">Votre commande</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between">
                <span className="text-neutral-600">
                  {i.quantity}× {i.name} ({i.size}, {i.color})
                </span>
                <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Sous-total</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd className="font-semibold">{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
              <dt className="font-black">Total</dt>
              <dd className="font-black">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

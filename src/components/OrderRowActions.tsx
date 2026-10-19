"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderRowActions({
  orderId,
  status,
  shippingRef,
}: {
  orderId: string;
  status: string;
  shippingRef: string | null;
}) {
  const router = useRouter();
  const [ref, setRef] = useState(shippingRef || "");
  const [busy, setBusy] = useState(false);

  async function update(nextStatus: string) {
    setBusy(true);
    await fetch("/api/admin/orders/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: nextStatus }),
    });
    setBusy(false);
    router.refresh();
  }

  async function saveTracking() {
    setBusy(true);
    await fetch("/api/admin/orders/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, shippingRef: ref }),
    });
    setBusy(false);
    router.refresh();
  }

  const nextActions: Record<string, [string, string][]> = {
    PENDING: [["PAID", "Marquer payée"]],
    PAID: [["PREPARING", "Lancer la préparation"]],
    PREPARING: [["SHIPPED", "Marquer expédiée"]],
    SHIPPED: [["DELIVERED", "Marquer livrée"]],
    DELIVERED: [],
    CANCELLED: [],
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
      {(nextActions[status] || []).map(([next, label]) => (
        <button
          key={next}
          onClick={() => update(next)}
          disabled={busy}
          className="btn-primary !py-1.5 !text-xs"
        >
          {label}
        </button>
      ))}
      {status !== "CANCELLED" && status !== "PENDING" && (
        <button
          onClick={() => update("CANCELLED")}
          disabled={busy}
          className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          Annuler
        </button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <input
          className="input !w-48 !py-1.5 !text-xs"
          placeholder="N° de suivi colis"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
        <button onClick={saveTracking} disabled={busy} className="btn-outline !py-1.5 !text-xs">
          Enregistrer le suivi
        </button>
      </div>
    </div>
  );
}

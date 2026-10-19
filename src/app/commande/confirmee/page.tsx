import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const order = searchParams.ref
    ? await prisma.order.findUnique({
        where: { reference: searchParams.ref },
        include: { items: { include: { product: true } } },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase">Merci !</h1>
        {order ? (
          <>
            <p className="mt-2 text-neutral-500">
              Votre commande <span className="font-bold text-brand-black">{order.reference}</span> est confirmée.
            </p>
            <span className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-bold ${STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
            <ul className="mt-6 space-y-2 text-left text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.quantity}× {i.product.name} ({i.size}, {i.color})</span>
                  <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-lg font-black">Total : {formatPrice(order.total)}</p>
          </>
        ) : (
          <p className="mt-2 text-neutral-500">Commande introuvable.</p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/suivi" className="btn-primary">Suivre ma commande</Link>
          <Link href="/boutique" className="btn-outline">Continuer mes achats</Link>
        </div>
      </div>
    </div>
  );
}

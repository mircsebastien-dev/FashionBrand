import { prisma } from "@/lib/db";
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import OrderRowActions from "@/components/OrderRowActions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status;
  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 100,
  });

  const allStatuses = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/commandes"
          className={`rounded-full px-4 py-2 text-sm font-bold ${!statusFilter ? "bg-brand-black text-white" : "bg-white hover:bg-neutral-200"}`}
        >
          Toutes
        </a>
        {allStatuses.map((s) => (
          <a
            key={s}
            href={`/admin/commandes?status=${s}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === s ? "bg-brand-black text-white" : "bg-white hover:bg-neutral-200"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </a>
        ))}
      </div>

      <div className="card mt-6">
        <h2 className="font-display text-xl font-black uppercase">Commandes ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Aucune commande.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{order.reference}</p>
                    <p className="text-sm text-neutral-500">
                      {order.customerName} · {order.email} · {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.postalCode} {order.city}, {order.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{formatPrice(order.total)}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
                <ul className="mt-3 text-sm text-neutral-600">
                  {order.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.product.name} ({i.size}, {i.color}) — {formatPrice(i.unitPrice * i.quantity)}
                    </li>
                  ))}
                </ul>
                <OrderRowActions orderId={order.id} status={order.status} shippingRef={order.shippingRef} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

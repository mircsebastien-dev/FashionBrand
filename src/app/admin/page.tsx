import { prisma } from "@/lib/db";
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalOrders, paidOrders, totalCustomers, recentOrders, productCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { notIn: ["PENDING", "CANCELLED"] } }, _sum: { total: true } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.count(),
  ]);

  const revenue = paidOrders._sum.total || 0;
  const avgOrder = totalOrders > 0 ? revenue / Math.max(paidOrders._sum.total ? totalOrders : 1, 1) : 0;

  const cards = [
    ["Chiffre d'affaires", formatPrice(revenue), "€ encaissés"],
    ["Commandes", String(totalOrders), "toutes commandes"],
    ["Clients", String(totalCustomers), "comptes clients"],
    ["Produits actifs", String(productCount), "en catalogue"],
  ] as const;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="card">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
            <p className="text-xs text-neutral-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black uppercase">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm font-bold text-brand-accent hover:underline">
            Tout voir →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Aucune commande pour l&apos;instant.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-2">Référence</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100">
                  <td className="py-2 font-bold">{o.reference}</td>
                  <td className="py-2">{o.customerName}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2 font-semibold">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

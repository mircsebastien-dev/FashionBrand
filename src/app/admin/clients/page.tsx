import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import ClientSearch from "@/components/ClientSearch";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; segment?: string };
}) {
  const q = searchParams.q || "";
  const segment = searchParams.segment || "all";

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      ...(q
        ? {
            OR: [
              { email: { contains: q } },
              { name: { contains: q } },
            ],
          }
        : {}),
    },
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });

  const guests = q
    ? await prisma.order.groupBy({
        by: ["email", "customerName"],
        where: { userId: null, email: { contains: q } },
        _count: { _all: true },
        _sum: { total: true },
      })
    : [];

  function segmentOf(user: (typeof users)[number]): string {
    const now = Date.now();
    const lastOrder = user.orders
      .filter((o) => o.status !== "CANCELLED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (user.orders.length >= 3) return "Fidèle";
    if (!lastOrder) return "Inactif";
    if (now - lastOrder.createdAt.getTime() < thirtyDaysAgo.getTime() - (now - yearAgo.getTime()) * 0) return "Nouveau";
    return "Occasionnel";
  }

  const segmented = users.map((u) => ({ ...u, segment: segmentOf(u) }));
  const filtered =
    segment === "all" ? segmented : segmented.filter((u) => u.segment === segment);

  return (
    <div>
      <ClientSearch q={q} segment={segment} />

      <div className="card mt-6">
        <h2 className="font-display text-xl font-black uppercase">
          Clients ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Aucun client trouvé.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Commandes</th>
                <th className="pb-2">Total dépensé</th>
                <th className="pb-2">Segment</th>
                <th className="pb-2">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const spent = u.orders
                  .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING")
                  .reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={u.id} className="border-b border-neutral-100">
                    <td className="py-2 font-bold">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.orders.length}</td>
                    <td className="py-2 font-semibold">{formatPrice(spent)}</td>
                    <td className="py-2">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold">{u.segment}</span>
                    </td>
                    <td className="py-2 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {guests.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-display text-xl font-black uppercase">Clients invités (sans compte)</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Commandes</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.email} className="border-b border-neutral-100">
                  <td className="py-2 font-bold">{g.customerName}</td>
                  <td className="py-2">{g.email}</td>
                  <td className="py-2">{g._count._all}</td>
                  <td className="py-2 font-semibold">{formatPrice(g._sum.total || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

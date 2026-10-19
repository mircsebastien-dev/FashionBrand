import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTendancesPage() {
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { status: { notIn: ["PENDING", "CANCELLED"] } } },
    include: { product: true },
  });

  const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  const bySize = new Map<string, number>();
  const byColor = new Map<string, number>();

  for (const item of orderItems) {
    const p = byProduct.get(item.productId) || {
      name: item.product.name,
      qty: 0,
      revenue: 0,
    };
    p.qty += item.quantity;
    p.revenue += item.unitPrice * item.quantity;
    byProduct.set(item.productId, p);

    bySize.set(item.size, (bySize.get(item.size) || 0) + item.quantity);
    byColor.set(item.color, (byColor.get(item.color) || 0) + item.quantity);
  }

  const topProducts = [...byProduct.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
  const topSizes = [...bySize.entries()].sort((a, b) => b[1] - a[1]);
  const topColors = [...byColor.entries()].sort((a, b) => b[1] - a[1]);

  const maxQty = topProducts[0]?.qty || 1;

  return (
    <div>
      <div className="card">
        <h2 className="font-display text-xl font-black uppercase">Top ventes 🔥</h2>
        {topProducts.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Aucune vente enregistrée.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-black text-neutral-400">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-neutral-500">
                      {p.qty} vendus · {formatPrice(p.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-brand-accent"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-xl font-black uppercase">Tailles les plus vendues</h2>
          <div className="mt-4 space-y-2 text-sm">
            {topSizes.length === 0 && <p className="text-neutral-500">Aucune donnée.</p>}
            {topSizes.map(([size, qty]) => (
              <div key={size} className="flex justify-between">
                <span className="font-bold">Taille {size}</span>
                <span>{qty} vendus</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-black uppercase">Couleurs les plus vendues</h2>
          <div className="mt-4 space-y-2 text-sm">
            {topColors.length === 0 && <p className="text-neutral-500">Aucune donnée.</p>}
            {topColors.map(([color, qty]) => (
              <div key={color} className="flex justify-between">
                <span className="font-bold">{color}</span>
                <span>{qty} vendus</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

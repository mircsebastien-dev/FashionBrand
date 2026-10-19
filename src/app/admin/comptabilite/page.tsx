import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminComptaPage({
  searchParams,
}: {
  searchParams: { mois?: string };
}) {
  const year = searchParams.mois ? parseInt(searchParams.mois.slice(0, 4)) : new Date().getFullYear();
  const month = searchParams.mois ? parseInt(searchParams.mois.slice(5, 7)) : new Date().getMonth() + 1;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ["PENDING", "CANCELLED"] },
      createdAt: { gte: start, lt: end },
    },
    include: { items: { include: { product: true } } },
  });

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const cogs = orders.reduce(
    (s, o) => s + o.items.reduce((s2, i) => s2 + i.unitPrice * 0.4 * i.quantity, 0),
    0
  );
  const shippingCollected = orders.reduce((s, o) => s + o.shipping, 0);
  const grossMargin = revenue - cogs - shippingCollected * 0.6;
  const netMargin = revenue - cogs - shippingCollected - revenue * 0.025 - 0.3 * orders.length;
  const avgOrder = orders.length > 0 ? revenue / orders.length : 0;

  const monthLabel = start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const prevMonth = new Date(year, month - 2, 1);
  const nextMonth = new Date(year, month, 1);
  const fmtKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const cards = [
    ["Chiffre d'affaires", formatPrice(revenue), `${orders.length} commandes`],
    ["Coût des marchandises", formatPrice(cogs), "≈40% du prix de vente"],
    ["Marge brute", formatPrice(grossMargin), "CA − COGS − frais port"],
    ["Marge nette estimée", formatPrice(netMargin), "− frais Stripe/PayPal (~2,5%+0,30€)"],
    ["Panier moyen", formatPrice(avgOrder), "par commande"],
    ["Frais de livraison encaissés", formatPrice(shippingCollected), "versés aux transporteurs"],
  ] as const;

  function toCsv() {
    const header = "reference,date,client,email,total,statut";
    const rows = orders.map((o) =>
      [
        o.reference,
        new Date(o.createdAt).toISOString().slice(0, 10),
        `"${o.customerName}"`,
        o.email,
        o.total.toFixed(2),
        o.status,
      ].join(",")
    );
    return [header, ...rows].join("\n");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <a href={`/admin/comptabilite?mois=${fmtKey(prevMonth)}`} className="btn-outline !py-1.5 !text-xs">← Mois précédent</a>
        <p className="font-display text-xl font-black capitalize">{monthLabel}</p>
        <a href={`/admin/comptabilite?mois=${fmtKey(nextMonth)}`} className="btn-outline !py-1.5 !text-xs">Mois suivant →</a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="card">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
            <p className="text-xs text-neutral-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black uppercase">Détail des transactions</h2>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCsv())}`}
            download={`compta-${fmtKey(start)}.csv`}
            className="btn-outline !py-1.5 !text-xs"
          >
            Exporter CSV
          </a>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Aucune transaction ce mois-ci.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-2">Référence</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Paiement</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100">
                  <td className="py-2 font-bold">{o.reference}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{o.customerName}</td>
                  <td className="py-2">{o.paymentMethod === "PAYPAL" ? "PayPal" : "CB"}</td>
                  <td className="py-2 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

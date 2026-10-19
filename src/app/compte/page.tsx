import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role === "ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-black uppercase">Mon compte</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-neutral-500">Bonjour {user?.name} 👋</p>

      <h2 className="mt-10 font-display text-2xl font-black uppercase">Mes commandes</h2>
      {user && user.orders.length === 0 && (
        <p className="mt-4 text-neutral-500">
          Aucune commande pour l&apos;instant.{" "}
          <Link href="/boutique" className="font-bold text-brand-accent hover:underline">
            Découvrir la boutique →
          </Link>
        </p>
      )}
      <div className="mt-4 space-y-4">
        {user?.orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">{order.reference}</p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.items.length} article(s) · {formatPrice(order.total)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-4 py-1 text-sm font-bold ${STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <Link
                  href={`/suivi?ref=${order.reference}&email=${encodeURIComponent(order.email)}`}
                  className="text-sm font-bold text-brand-accent hover:underline"
                >
                  Suivre →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

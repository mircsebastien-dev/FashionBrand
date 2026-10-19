import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  const bestSellers = await prisma.product.findMany({
    where: { active: true },
    take: 4,
    include: { orderItems: { select: { quantity: true } } },
  });
  const trending = [...bestSellers]
    .sort((a, b) =>
      b.orderItems.reduce((s, i) => s + i.quantity, 0) -
      a.orderItems.reduce((s, i) => s + i.quantity, 0)
    )
    .slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-brand-accent">
            Nouvelle collection
          </p>
          <h1 className="hero-title max-w-3xl">
            Des T-shirts qui font de l&apos;effet.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Coton bio, coupes oversize ou ajustées, impressions qui claque. Rejoins la nouvelle génération.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/boutique" className="btn-primary !bg-brand-accent hover:!bg-white hover:!text-brand-black">
              Découvrir la boutique
            </Link>
            <Link href="/suivi" className="btn-outline !border-white hover:!bg-white hover:!text-brand-black">
              Suivre ma commande
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-accent/30 blur-3xl" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-black uppercase">Coups de cœur</h2>
          <Link href="/boutique" className="text-sm font-bold uppercase text-brand-accent hover:underline">
            Tout voir →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-8 font-display text-3xl font-black uppercase">Tendances 🔥</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-3">
        {[
          ["Livraison suivie", "Expédition en 24-48h, suivi en temps réel."],
          ["Paiement sécurisé", "CB via Stripe ou PayPal."],
          ["Retours 30 jours", "Pas satifaite· ? On rembourse."],
        ].map(([title, desc]) => (
          <div key={title} className="card text-center">
            <p className="font-bold uppercase tracking-wide">{title}</p>
            <p className="mt-1 text-sm text-neutral-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

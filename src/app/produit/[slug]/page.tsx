import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
      category: true,
    },
  });
  if (!product || !product.active) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-200">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          {product.category && (
            <p className="text-sm font-bold uppercase tracking-widest text-brand-accent">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-black uppercase">{product.name}</h1>
          {avgRating !== null && (
            <p className="mt-2 text-sm text-neutral-500">
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))} ({product.reviews.length} avis)
            </p>
          )}
          <p className="mt-4 text-3xl font-black">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-neutral-600">{product.description}</p>
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-black uppercase">Avis clients</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {product.reviews.slice(0, 6).map((r) => (
              <div key={r.id} className="card">
                <p className="font-bold">
                  {r.author} <span className="text-brand-accent">{"★".repeat(r.rating)}</span>
                </p>
                <p className="mt-1 text-sm text-neutral-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

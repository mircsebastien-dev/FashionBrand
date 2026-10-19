import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type SearchParams = { cat?: string; size?: string; sort?: string };

export default async function BoutiquePage({ searchParams }: { searchParams: SearchParams }) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(searchParams.cat ? { category: { slug: searchParams.cat } } : {}),
    },
    include: { category: true },
    orderBy:
      searchParams.sort === "prix-asc"
        ? { price: "asc" }
        : searchParams.sort === "prix-desc"
        ? { price: "desc" }
        : { createdAt: "desc" },
  });

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase">Boutique</h1>
      <p className="mt-2 text-neutral-500">{products.length} produits</p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href="/boutique"
          className={`rounded-full px-4 py-2 text-sm font-bold ${!searchParams.cat ? "bg-brand-black text-white" : "bg-white"}`}
        >
          Tout
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/boutique?cat=${c.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${searchParams.cat === c.slug ? "bg-brand-black text-white" : "bg-white"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-neutral-500">Trier :</span>
        {[
          ["nouveautes", "Nouveautés"],
          ["prix-asc", "Prix ↑"],
          ["prix-desc", "Prix ↓"],
        ].map(([value, label]) => {
          const params = new URLSearchParams();
          if (searchParams.cat) params.set("cat", searchParams.cat);
          params.set("sort", value);
          const active = (searchParams.sort || "nouveautes") === value;
          return (
            <Link
              key={value}
              href={`/boutique?${params.toString()}`}
              className={`rounded-full border px-3 py-1 font-semibold ${active ? "border-brand-black bg-brand-black text-white" : "border-neutral-300 bg-white"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

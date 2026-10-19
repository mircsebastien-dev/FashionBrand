"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colors: string;
  sizes: string;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const sizes = product.sizes.split(",");
  return (
    <div className="group">
      <Link href={`/produit/${product.slug}`} className="block overflow-hidden rounded-2xl">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link href={`/produit/${product.slug}`} className="font-bold hover:text-brand-accent">
            {product.name}
          </Link>
          <p className="text-sm text-neutral-500">{product.colors.split(",")[0]} · {sizes.length} tailles</p>
        </div>
        <p className="font-black">{formatPrice(product.price)}</p>
      </div>
      <button
        onClick={() =>
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            size: sizes[0],
            color: product.colors.split(",")[0],
            quantity: 1,
          })
        }
        className="btn-primary mt-3 w-full !py-2"
      >
        Ajout rapide
      </button>
    </div>
  );
}

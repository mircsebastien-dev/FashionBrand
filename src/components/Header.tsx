"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

type SessionInfo = { email: string; role: string } | null;

export default function Header({ session }: { session: SessionInfo }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-brand-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-black uppercase tracking-tight">
          Fashion<span className="text-brand-accent">Brand</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide md:flex">
          <Link href="/boutique" className="hover:text-brand-accent">Boutique</Link>
          <Link href="/suivi" className="hover:text-brand-accent">Suivi commande</Link>
          {session?.role === "ADMIN" && (
            <Link href="/admin" className="text-brand-accent">Admin</Link>
          )}
          <Link href={session ? "/compte" : "/connexion"} className="hover:text-brand-accent">
            {session ? "Mon compte" : "Connexion"}
          </Link>
        </nav>
        <Link href="/panier" className="relative rounded-full bg-brand-black px-4 py-2 text-sm font-bold text-white">
          Panier
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-xs">
            {count}
          </span>
        </Link>
      </div>
    </header>
  );
}

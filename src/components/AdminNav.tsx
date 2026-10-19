"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/clients", "Clients"],
  ["/admin/commandes", "Commandes & expéditions"],
  ["/admin/tendances", "Tendances"],
  ["/admin/comptabilite", "Comptabilité"],
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LINKS.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            pathname === href ? "bg-brand-black text-white" : "bg-white hover:bg-neutral-200"
          }`}
        >
          {label}
        </Link>
      ))}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        }}
        className="text-sm font-semibold text-neutral-500 hover:text-brand-accent"
      >
        Déconnexion
      </button>
    </div>
  );
}

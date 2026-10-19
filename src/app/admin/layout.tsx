import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/connexion");

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-black uppercase">
            Admin <span className="text-brand-accent">FashionBrand</span>
          </h1>
          <AdminNav />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

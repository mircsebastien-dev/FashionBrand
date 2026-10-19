import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-black text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-black uppercase">FashionBrand</p>
          <p className="mt-2 text-sm text-white/60">
            La nouvelle génération de T-shirts. Coton bio, coupes parfaites, prix justes.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-bold uppercase tracking-wide">Aide</p>
          <ul className="mt-2 space-y-1 text-white/60">
            <li><Link href="/suivi" className="hover:text-white">Suivre ma commande</Link></li>
            <li><Link href="/boutique" className="hover:text-white">Boutique</Link></li>
            <li><Link href="/connexion" className="hover:text-white">Mon compte</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-bold uppercase tracking-wide">Paiement</p>
          <p className="mt-2 text-white/60">Carte bancaire (Stripe) · PayPal</p>
          <p className="mt-1 text-white/60">Livraison suivie · Retours 30 jours</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} FashionBrand — Tous droits réservés
      </div>
    </footer>
  );
}

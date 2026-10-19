# FashionBrand 🛍️

E-commerce nouvelle génération pour une marque de T-shirts. Boutique attractive pour jeunes adultes + back-office admin complet.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + SQLite (dev) — prêt à basculer vers PostgreSQL
- **Tailwind CSS**
- **Stripe Checkout** (CB) + **PayPal** (sandbox)
- Auth par sessions JWT (httpOnly cookies)

## Démarrage

```bash
npm install
cp .env.example .env
npx prisma generate && npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

## Fonctionnalités

### Boutique
- Home avec coups de cœur et tendances
- Catalogue avec filtres par catégorie et tri
- Fiche produit : couleur, taille, quantité
- Panier persistant (localStorage)
- Checkout avec paiement CB (Stripe) ou PayPal (sandbox)
- Suivi de commande par référence + email (timeline visuelle)
- Compte client : historique et suivi des commandes

### Admin (`/admin`, rôle ADMIN)
- Dashboard : CA, commandes, clients, produits
- Pilotage clients : recherche, segmentation (Nouveau, Fidèle, Occasionnel, Inactif), invités
- Commandes & expéditions : changement de statuts, n° de suivi colis
- Tendances : top ventes, tailles et couleurs populaires
- Comptabilité : CA, marges, frais de paiement, export CSV mensuel

## Variables d'environnement

Voir `.env.example`. En mode test, Stripe et PayPal utilisent des clés sandbox. Sans clés, PayPal simule le paiement en local.

## Notes production

- Basculer `provider` sur `postgresql` dans `prisma/schema.prisma`
- Configurer `STRIPE_WEBHOOK_SECRET` pour la confirmation automatique des paiements
- Définir un `SESSION_SECRET` fort

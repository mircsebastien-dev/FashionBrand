import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Essentiels", slug: "essentiels" },
  { name: "Graphiques", slug: "graphiques" },
  { name: "Oversize", slug: "oversize" },
  { name: "Éditions limitées", slug: "editions-limitees" },
];

const products = [
  {
    slug: "tee-heart-vibes",
    name: "T-Shirt Heart Vibes",
    description: "Coton bio 100%, coupe droite, impression cœur rétro. Le tee qui envoie de la bonne humeur.",
    price: 29.9,
    image: "https://picsum.photos/seed/tee-heart/800/1000",
    colors: "Noir,Blanc,Rouge",
    sizes: "XS,S,M,L,XL",
    categorySlug: "graphiques",
    featured: true,
  },
  {
    slug: "tee-oversize-cloud",
    name: "T-Shirt Oversize Cloud",
    description: "Coupe oversize décontractée, tissu épais 240g. Confort ultime pour les journées chill.",
    price: 34.9,
    image: "https://picsum.photos/seed/tee-cloud/800/1000",
    colors: "Gris,Beige,Noir",
    sizes: "S,M,L,XL,XXL",
    categorySlug: "oversize",
    featured: true,
  },
  {
    slug: "tee-street-sunset",
    name: "T-Shirt Street Sunset",
    description: "Sérigraphie coucher de soleil inspirée de la street culture. Coupe unisexe.",
    price: 32.0,
    image: "https://picsum.photos/seed/tee-sunset/800/1000",
    colors: "Orange,Noir,Blanc",
    sizes: "XS,S,M,L,XL",
    categorySlug: "graphiques",
    featured: true,
  },
  {
    slug: "tee-basic-perfect",
    name: "T-Shirt Basic Perfect",
    description: "Le basique parfait : col renforcé, coton peigné premium, tombé impeccable.",
    price: 19.9,
    image: "https://picsum.photos/seed/tee-basic/800/1000",
    colors: "Blanc,Noir,Beige,Bleu marine",
    sizes: "XS,S,M,L,XL,XXL",
    categorySlug: "essentiels",
    featured: true,
  },
  {
    slug: "tee-limited-neon",
    name: "T-Shirt Limited Neon",
    description: "Édition limitée 300 exemplaires, impression néon réfléchissante. Numéroté à la main.",
    price: 44.9,
    image: "https://picsum.photos/seed/tee-neon/800/1000",
    colors: "Noir",
    sizes: "S,M,L,XL",
    categorySlug: "editions-limitees",
    featured: true,
  },
  {
    slug: "tee-retro-arcade",
    name: "T-Shirt Retro Arcade",
    description: "Cotton bio, impression arcade 80s, coupe droite classique.",
    price: 29.9,
    image: "https://picsum.photos/seed/tee-arcade/800/1000",
    colors: "Bleu,Noir",
    sizes: "S,M,L,XL",
    categorySlug: "graphiques",
    featured: false,
  },
  {
    slug: "tee-oversize-wave",
    name: "T-Shirt Oversize Wave",
    description: "Oversize avec impression vague japonaise. Coton lourd premium.",
    price: 36.9,
    image: "https://picsum.photos/seed/tee-wave/800/1000",
    colors: "Beige,Noir",
    sizes: "S,M,L,XL,XXL",
    categorySlug: "oversize",
    featured: false,
  },
  {
    slug: "tee-eco-planet",
    name: "T-Shirt Eco Planet",
    description: "100% coton bio recyclé, teinture végétale. Pour la planète.",
    price: 27.5,
    image: "https://picsum.photos/seed/tee-eco/800/1000",
    colors: "Vert,Beige",
    sizes: "XS,S,M,L,XL",
    categorySlug: "essentiels",
    featured: false,
  },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const bcrypt = (await import("bcryptjs")).default;
  const adminEmail = "admin@fashionbrand.fr";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash("admin123", 10),
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log("Admin créé : admin@fashionbrand.fr / admin123");
  }

  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        colors: p.colors,
        sizes: p.sizes,
        stock: 100,
        featured: p.featured,
        categoryId: cat!.id,
      },
    });
  }

  console.log("Seed terminé : %d catégories, %d produits", categories.length, products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

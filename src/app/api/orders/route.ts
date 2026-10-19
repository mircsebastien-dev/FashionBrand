import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeShipping, generateOrderReference } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, customerName, addressLine1, addressLine2, city, postalCode, country, paymentMethod, items } = body;

    if (!email || !customerName || !addressLine1 || !city || !postalCode || !country) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== new Set(productIds).size) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 400 });
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price]));
    const subtotal = items.reduce(
      (acc: number, i: { productId: string; quantity: number }) => acc + priceMap.get(i.productId)! * i.quantity,
      0
    );
    const shipping = computeShipping(subtotal);

    const session = await getSession();

    const order = await prisma.order.create({
      data: {
        reference: generateOrderReference(),
        userId: session?.userId ?? null,
        email,
        customerName,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        postalCode,
        country,
        status: "PENDING",
        paymentMethod,
        subtotal,
        shipping,
        total: subtotal + shipping,
        items: {
          create: items.map(
            (i: { productId: string; size: string; color: string; quantity: number }) => ({
              productId: i.productId,
              size: i.size,
              color: i.color,
              quantity: i.quantity,
              unitPrice: priceMap.get(i.productId)!,
            })
          ),
        },
      },
    });

    return NextResponse.json({ orderId: order.id, reference: order.reference });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

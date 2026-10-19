import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.unitPrice * 100),
          product_data: { name: `${item.size}/${item.color}` },
        },
      })),
      ...(order.shipping > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: Math.round(order.shipping * 100), currency: "eur" },
                  display_name: "Livraison standard",
                },
              },
            ],
          }
        : {}),
      metadata: { orderId: order.id },
      success_url: `${SITE_URL}/commande/confirmee?ref=${order.reference}`,
      cancel_url: `${SITE_URL}/checkout?annule=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: session.id },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

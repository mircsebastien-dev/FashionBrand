import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const paypalToken = url.searchParams.get("token");
  if (!orderId) return NextResponse.redirect(`${SITE_URL}/checkout?erreur=paypal`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.redirect(`${SITE_URL}/checkout?erreur=paypal`);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paymentRef: paypalToken || `paypal-${order.reference}` },
  });

  return NextResponse.redirect(`${SITE_URL}/commande/confirmee?ref=${order.reference}`);
}

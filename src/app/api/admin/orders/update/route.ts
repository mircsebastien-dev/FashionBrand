import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { orderId, status, shippingRef } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(status ? { status } : {}),
      ...(shippingRef !== undefined ? { shippingRef } : {}),
    },
  });

  return NextResponse.json({ ok: true, order });
}

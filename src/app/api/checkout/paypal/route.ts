import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function paypalConfig() {
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const base = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  return { base, clientId: process.env.PAYPAL_CLIENT_ID, secret: process.env.PAYPAL_CLIENT_SECRET };
}

async function getAccessToken(): Promise<string | null> {
  const { base, clientId, secret } = paypalConfig();
  if (!clientId || !secret || clientId === "test") return null;
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId) return NextResponse.redirect(`${SITE_URL}/checkout?erreur=paypal`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.redirect(`${SITE_URL}/checkout?erreur=paypal`);

  const token = await getAccessToken();
  if (!token) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentRef: `paypal-sandbox-${order.reference}` },
    });
    return NextResponse.redirect(`${SITE_URL}/commande/confirmee?ref=${order.reference}`);
  }

  const { base } = paypalConfig();
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.id,
          amount: { currency_code: "EUR", value: order.total.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "FashionBrand",
        user_action: "PAY_NOW",
        return_url: `${SITE_URL}/api/checkout/paypal/capture?orderId=${order.id}`,
        cancel_url: `${SITE_URL}/checkout?annule=1`,
      },
    }),
  });

  const data = await res.json();
  const approveLink = data.links?.find((l: { rel: string }) => l.rel === "approve");
  if (!approveLink) return NextResponse.redirect(`${SITE_URL}/checkout?erreur=paypal`);

  return NextResponse.redirect(approveLink.href);
}

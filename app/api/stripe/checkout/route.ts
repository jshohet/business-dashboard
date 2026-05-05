import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { storeId } = body as { storeId?: string };

  if (!storeId) {
    return Response.json({ error: "storeId required" }, { status: 400 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, users: { some: { id: session.user.id } } },
    select: { id: true, name: true, stripeCustomerId: true },
  });

  if (!store) {
    return Response.json({ error: "Store not found" }, { status: 404 });
  }

  const baseUrl = getSiteUrl().toString().replace(/\/$/, "");

  let customerId = store.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: store.name,
      metadata: { storeId: store.id },
    });
    customerId = customer.id;
    await prisma.store.update({
      where: { id: store.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { storeId: store.id },
  });

  return Response.json({ url: checkoutSession.url });
}

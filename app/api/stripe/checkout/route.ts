import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

const PRICE_MAP: Record<string, string | undefined> = {
  starter:    process.env.STRIPE_PRICE_STARTER,
  operator:   process.env.STRIPE_PRICE_OPERATOR,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

const schema = z.object({
  plan: z.enum(["starter", "operator", "enterprise"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { plan } = parsed.data;
  const priceId = PRICE_MAP[plan];
  if (!priceId || priceId.startsWith("price_") === false || priceId.includes("placeholder")) {
    return Response.json({ error: `Stripe price for ${plan} plan is not configured` }, { status: 500 });
  }

  const store = await prisma.store.findFirst({
    where: { id: session.user.storeId as string, users: { some: { id: session.user.id } } },
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
    subscription_data: {
      trial_period_days: 14,
      metadata: { storeId: store.id, plan },
    },
    success_url: `${baseUrl}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${baseUrl}/dashboard/settings/billing`,
    metadata: { storeId: store.id, plan },
  });

  return Response.json({ url: checkoutSession.url });
}

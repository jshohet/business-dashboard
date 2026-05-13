import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Maps Stripe price IDs to plan tiers. Returns null if unrecognized.
function planFromPriceId(priceId: string): string | null {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER ?? ""]:    "starter",
    [process.env.STRIPE_PRICE_OPERATOR ?? ""]:   "operator",
    [process.env.STRIPE_PRICE_ENTERPRISE ?? ""]: "enterprise",
  };
  return map[priceId] ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const storeId = session.metadata?.storeId;
      const plan = session.metadata?.plan;
      const subscriptionId = session.subscription as string | null;

      if (storeId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.store.update({
          where: { id: storeId },
          data: {
            stripeSubscriptionId: subscriptionId,
            // Store the raw Stripe status — don't map to active/inactive
            subscriptionStatus: subscription.status,
            subscriptionPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
            // Set plan from checkout metadata (most reliable source)
            ...(plan ? { plan } : {}),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const store = await prisma.store.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true },
      });
      if (store) {
        // Map price ID → plan for upgrades/downgrades via customer portal
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        await prisma.store.update({
          where: { id: store.id },
          data: {
            subscriptionStatus: subscription.status,
            subscriptionPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
            ...(plan ? { plan } : {}),
          },
        });
      }
      break;
    }

    // Only downgrade the account plan when the subscription is fully deleted
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const store = await prisma.store.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true },
      });
      if (store) {
        await prisma.store.update({
          where: { id: store.id },
          data: {
            subscriptionStatus: subscription.status,
            plan: "starter",
          },
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
}

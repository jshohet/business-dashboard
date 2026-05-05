import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

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
      const subscriptionId = session.subscription as string;
      if (storeId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.store.update({
          where: { id: storeId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status === "active" ? "active" : "inactive",
            subscriptionPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
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
        await prisma.store.update({
          where: { id: store.id },
          data: {
            subscriptionStatus: subscription.status === "active" ? "active" : "inactive",
            subscriptionPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const store = await prisma.store.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true },
      });
      if (store) {
        await prisma.store.update({
          where: { id: store.id },
          data: { subscriptionStatus: "inactive" },
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
}

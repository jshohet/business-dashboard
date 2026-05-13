import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export async function POST(request: NextRequest) {
  void request;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { stripeCustomerId: true },
  });

  if (!store?.stripeCustomerId) {
    return Response.json({ error: "No billing account found. Subscribe to a plan first." }, { status: 400 });
  }

  const baseUrl = getSiteUrl().toString().replace(/\/$/, "");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: store.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/settings/billing`,
  });

  return Response.json({ url: portalSession.url });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures } from "@/lib/plan-features";

const createSchema = z.object({
  name: z.string().min(1, "Location name is required").max(100),
  type: z.enum(["QSR", "franchise", "retail", "other"]).default("other"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.location.findMany({
    where: {
      storeId: session.user.storeId as string,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      _count: { select: { kpiEntries: true } },
      kpiEntries: {
        orderBy: { weekEnding: "desc" },
        take: 1,
        select: { weekEnding: true },
      },
    },
  });

  return Response.json({ locations });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Enforce plan location limit
  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });

  const features = getPlanFeatures(store?.plan ?? "starter");
  const currentCount = await prisma.location.count({
    where: { storeId: session.user.storeId as string, deletedAt: null },
  });

  if (currentCount >= features.maxLocations) {
    return Response.json(
      {
        error: "location_limit_reached",
        message: `Your plan allows up to ${features.maxLocations} location${features.maxLocations !== 1 ? "s" : ""}. Upgrade to add more.`,
        upgrade_url: "/dashboard/settings/billing",
      },
      { status: 403 },
    );
  }

  const location = await prisma.location.create({
    data: {
      storeId: session.user.storeId as string,
      name: parsed.data.name,
      type: parsed.data.type,
    },
    select: { id: true, name: true, type: true, createdAt: true },
  });

  return Response.json({ location }, { status: 201 });
}

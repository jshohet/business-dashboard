import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures } from "@/lib/plan-features";

const metricsSchema = z.record(z.string(), z.number());

const createSchema = z.object({
  locationId: z.string().min(1),
  weekEnding: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  metrics: metricsSchema,
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Verify ownership
  const location = await prisma.location.findFirst({
    where: {
      id: parsed.data.locationId,
      storeId: session.user.storeId as string,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (!location) return Response.json({ error: "Location not found" }, { status: 404 });

  const weekEnding = new Date(parsed.data.weekEnding);

  const entry = await prisma.kpiEntry.upsert({
    where: { locationId_weekEnding: { locationId: location.id, weekEnding } },
    create: {
      locationId: location.id,
      weekEnding,
      metrics: parsed.data.metrics,
      notes: parsed.data.notes ?? null,
    },
    update: {
      metrics: parsed.data.metrics,
      notes: parsed.data.notes ?? null,
    },
    select: { id: true, weekEnding: true, metrics: true },
  });

  // For Operator/Enterprise: trigger drift analysis and return the result inline.
  // This adds ~2-3s to the response but gives the user immediate AI feedback.
  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });
  const features = getPlanFeatures(store?.plan ?? "starter");

  if (features.aiDriftAnalysis) {
    try {
      const driftRes = await fetch(
        `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/ai/drift`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Forward the session cookie so the drift route can auth the request
            cookie: request.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({ locationId: location.id, entryId: entry.id }),
        },
      );
      if (driftRes.ok) {
        const { analysis, reportId } = await driftRes.json();
        return Response.json({ entry, driftAnalysis: analysis, reportId }, { status: 201 });
      }
    } catch {
      // Drift analysis failure should not block the KPI save
    }
  }

  return Response.json({ entry }, { status: 201 });
}

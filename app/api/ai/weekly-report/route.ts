// TODO: add Upstash rate limiting here before production (see /lib/prompts/README.md)

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures, paywallResponse } from "@/lib/plan-features";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { buildWeeklyOpsReportPrompt, type WeeklyOpsReportOutput, type LocationSnapshot } from "@/lib/prompts/weekly-ops-report";

const schema = z.object({
  locationId: z.string().optional(),
});

// Resolves storeId from either a real user session or a verified internal cron call.
// Returns null if neither is present/valid.
async function resolveStoreId(request: NextRequest): Promise<string | null> {
  const cronSecret = process.env.CRON_SECRET;
  const incomingSecret = request.headers.get("x-cron-secret");
  const cronStoreId = request.headers.get("x-cron-store-id");

  if (cronStoreId && cronSecret && incomingSecret === cronSecret) {
    return cronStoreId;
  }

  const session = await auth();
  return session?.user?.storeId as string | null ?? null;
}

export async function POST(request: NextRequest) {
  const storeId = await resolveStoreId(request);
  if (!storeId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { plan: true },
  });
  const features = getPlanFeatures(store?.plan ?? "starter");
  if (!features.aiWeeklyOpsReport) return paywallResponse("enterprise");

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const locationFilter = parsed.data.locationId
    ? { id: parsed.data.locationId, storeId, deletedAt: null as null }
    : { storeId, deletedAt: null as null };

  const locations = await prisma.location.findMany({
    where: locationFilter,
    select: { id: true, name: true, type: true },
  });

  if (locations.length === 0) {
    return Response.json({ error: "No locations found" }, { status: 404 });
  }

  const snapshots: LocationSnapshot[] = [];
  for (const loc of locations) {
    const entries = await prisma.kpiEntry.findMany({
      where: { locationId: loc.id },
      orderBy: { weekEnding: "desc" },
      take: 2,
      select: { weekEnding: true, metrics: true },
    });

    if (entries.length === 0) continue;

    snapshots.push({
      locationName: loc.name,
      locationType: loc.type,
      currentWeek: entries[0].metrics as Record<string, number>,
      previousWeek: entries[1] ? (entries[1].metrics as Record<string, number>) : null,
      weekEnding: entries[0].weekEnding.toISOString().slice(0, 10),
    });
  }

  if (snapshots.length === 0) {
    return Response.json({ error: "No KPI data found — enter at least one week of data first" }, { status: 400 });
  }

  const { system, user } = buildWeeklyOpsReportPrompt(snapshots);
  const inputSnapshot = JSON.parse(JSON.stringify({ snapshots }));

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: user }],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    return Response.json({ error: "Unexpected response from AI" }, { status: 500 });
  }

  let result: WeeklyOpsReportOutput;
  try {
    result = JSON.parse(rawContent.text) as WeeklyOpsReportOutput;
  } catch {
    return Response.json({ error: "AI returned malformed JSON" }, { status: 500 });
  }

  const savedReportIds: string[] = [];
  for (const snap of snapshots) {
    const loc = locations.find((l) => l.name === snap.locationName);
    if (!loc) continue;
    const r = await prisma.aiReport.create({
      data: {
        locationId: loc.id,
        reportType: "weekly_ops",
        content: JSON.stringify(result),
        inputSnapshot,
      },
      select: { id: true },
    });
    savedReportIds.push(r.id);
  }

  // TODO (Phase 3): send email via Resend once domain is configured
  // await sendWeeklyOpsReportEmail(ownerEmail, result);

  return Response.json({ result, reportIds: savedReportIds });
}

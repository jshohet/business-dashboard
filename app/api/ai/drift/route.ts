// TODO: add Upstash rate limiting here before production (see /lib/prompts/README.md)

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures, paywallResponse } from "@/lib/plan-features";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { buildDriftAnalysisPrompt, type DriftAnalysisOutput } from "@/lib/prompts/drift-analysis";

const schema = z.object({
  locationId: z.string().min(1),
  entryId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Plan gate — Operator and Enterprise only
  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });
  const features = getPlanFeatures(store?.plan ?? "starter");
  if (!features.aiDriftAnalysis) return paywallResponse("operator");

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Verify ownership
  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, storeId: session.user.storeId as string, deletedAt: null },
    select: { id: true, name: true, type: true },
  });
  if (!location) return Response.json({ error: "Location not found" }, { status: 404 });

  // Fetch the current entry
  const currentEntry = await prisma.kpiEntry.findFirst({
    where: { id: parsed.data.entryId, locationId: location.id },
    select: { weekEnding: true, metrics: true },
  });
  if (!currentEntry) return Response.json({ error: "Entry not found" }, { status: 404 });

  // Fetch the previous 4 weeks (entries before the current week, most recent first)
  const previousEntries = await prisma.kpiEntry.findMany({
    where: { locationId: location.id, weekEnding: { lt: currentEntry.weekEnding } },
    orderBy: { weekEnding: "desc" },
    take: 4,
    select: { metrics: true },
  });

  const currentMetrics = currentEntry.metrics as Record<string, number>;
  const previousMetrics = previousEntries.map((e) => e.metrics as Record<string, number>);

  // Build and send prompt to Claude
  const { system, user } = buildDriftAnalysisPrompt(
    location.name,
    location.type,
    currentMetrics,
    previousMetrics,
  );

  const inputSnapshot = { locationName: location.name, locationType: location.type, currentMetrics, previousMetrics };

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: user }],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    return Response.json({ error: "Unexpected response from AI" }, { status: 500 });
  }

  let analysis: DriftAnalysisOutput;
  try {
    analysis = JSON.parse(rawContent.text) as DriftAnalysisOutput;
  } catch {
    return Response.json({ error: "AI returned malformed JSON" }, { status: 500 });
  }

  // Save to AiReport for audit trail and in-app history
  const report = await prisma.aiReport.create({
    data: {
      locationId: location.id,
      reportType: "drift_analysis",
      content: JSON.stringify(analysis),
      inputSnapshot,
    },
    select: { id: true },
  });

  return Response.json({ analysis, reportId: report.id });
}

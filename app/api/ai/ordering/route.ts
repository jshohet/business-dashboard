// TODO: add Upstash rate limiting here before production (see /lib/prompts/README.md)

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures, paywallResponse } from "@/lib/plan-features";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { buildOrderingCadencePrompt, type OrderingCadenceOutput } from "@/lib/prompts/ordering-cadence";

const schema = z.object({
  locationId: z.string().min(1),
  products: z.array(z.string().min(1)).min(1).max(20),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });
  const features = getPlanFeatures(store?.plan ?? "starter");
  if (!features.aiOrdering) return paywallResponse("operator");

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, storeId: session.user.storeId as string, deletedAt: null },
    select: { id: true, name: true, type: true },
  });
  if (!location) return Response.json({ error: "Location not found" }, { status: 404 });

  // Last 8 weeks of KPI entries for waste context
  const recentEntries = await prisma.kpiEntry.findMany({
    where: { locationId: location.id },
    orderBy: { weekEnding: "desc" },
    take: 8,
    select: { weekEnding: true, metrics: true, notes: true },
  });

  const wasteHistory = recentEntries.map((e) => ({
    weekEnding: e.weekEnding.toISOString().slice(0, 10),
    waste_pct: (e.metrics as Record<string, number>).waste_pct,
    notes: e.notes ?? undefined,
  }));

  const { system, user } = buildOrderingCadencePrompt(
    location.name,
    location.type,
    parsed.data.products,
    wasteHistory,
  );

  const inputSnapshot = { locationName: location.name, products: parsed.data.products, wasteHistory };

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

  let result: OrderingCadenceOutput;
  try {
    result = JSON.parse(rawContent.text) as OrderingCadenceOutput;
  } catch {
    return Response.json({ error: "AI returned malformed JSON" }, { status: 500 });
  }

  const report = await prisma.aiReport.create({
    data: {
      locationId: location.id,
      reportType: "ordering",
      content: JSON.stringify(result),
      inputSnapshot,
    },
    select: { id: true },
  });

  return Response.json({ result, reportId: report.id });
}

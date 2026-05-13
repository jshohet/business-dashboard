// TODO: add Upstash rate limiting here before production (see /lib/prompts/README.md)

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures, paywallResponse } from "@/lib/plan-features";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { buildCoachingScriptPrompt, type CoachingScriptOutput } from "@/lib/prompts/coaching-script";

const schema = z.object({
  locationId: z.string().min(1),
  role: z.string().min(1).max(100),
  metric: z.string().min(1),
  metricLabel: z.string().min(1),
  currentValue: z.number(),
  targetValue: z.number(),
  weeksOffTarget: z.number().int().min(1),
  context: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });
  const features = getPlanFeatures(store?.plan ?? "starter");
  if (!features.aiCoachingScripts) return paywallResponse("enterprise");

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, storeId: session.user.storeId as string, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!location) return Response.json({ error: "Location not found" }, { status: 404 });

  const { system, user } = buildCoachingScriptPrompt(parsed.data);
  const inputSnapshot = { ...parsed.data, locationName: location.name };

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

  let result: CoachingScriptOutput;
  try {
    result = JSON.parse(rawContent.text) as CoachingScriptOutput;
  } catch {
    return Response.json({ error: "AI returned malformed JSON" }, { status: 500 });
  }

  const report = await prisma.aiReport.create({
    data: {
      locationId: location.id,
      reportType: "coaching_script",
      content: JSON.stringify(result),
      inputSnapshot,
    },
    select: { id: true },
  });

  return Response.json({ result, reportId: report.id });
}

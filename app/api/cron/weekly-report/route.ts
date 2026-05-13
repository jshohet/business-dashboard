import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Triggered every Monday at 6am UTC by Vercel cron (see vercel.json).
// Generates and emails a weekly ops report for every Enterprise store that has data.
// Protected by CRON_SECRET to prevent public triggering.

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enterpriseStores = await prisma.store.findMany({
    where: { plan: "enterprise" },
    select: { id: true, name: true, users: { select: { email: true }, take: 1 } },
  });

  const results: { storeId: string; status: string; error?: string }[] = [];

  for (const store of enterpriseStores) {
    try {
      // Delegate to the weekly-report API route with a service-level call
      const res = await fetch(
        `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/ai/weekly-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Service-level auth bypass — weekly-report verifies this secret + storeId
            "x-cron-store-id": store.id,
            "x-cron-secret": process.env.CRON_SECRET ?? "",
          },
          body: JSON.stringify({}),
        },
      );

      if (res.ok) {
        results.push({ storeId: store.id, status: "success" });
      } else {
        const err = await res.json().catch(() => ({}));
        results.push({ storeId: store.id, status: "error", error: err.error ?? res.statusText });
      }
    } catch (err) {
      results.push({ storeId: store.id, status: "error", error: String(err) });
    }
  }

  return Response.json({ processed: enterpriseStores.length, results });
}

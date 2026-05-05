import { subDays } from "date-fns";
import AnalyticsCharts from "./charts";
import { auth } from "@/auth";
import { buildAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;
  if (!storeId) return null;

  const fromDate = subDays(new Date(), 89);
  const salesEntries = await prisma.salesEntry.findMany({
    where: { storeId, date: { gte: fromDate } },
    select: { date: true, hour: true, revenue: true, transactions: true },
    orderBy: [{ date: "asc" }, { hour: "asc" }],
  });

  const analytics = buildAnalytics(
    salesEntries.map((e: (typeof salesEntries)[number]) => ({
      date: e.date, hour: e.hour, revenue: Number(e.revenue), transactions: e.transactions,
    })),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Module
        </p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)" }}>
          Sales Analytics
        </h1>
        <p style={{ marginTop: "0.4rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Daily &amp; weekly trends, peak-hour detection, momentum analysis over 90 days.
        </p>
      </section>
      <AnalyticsCharts data={analytics} />
    </div>
  );
}

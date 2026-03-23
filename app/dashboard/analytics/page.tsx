import { subDays } from "date-fns";
import AnalyticsCharts from "./charts";
import { auth } from "@/auth";
import { buildAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return null;
  }

  const fromDate = subDays(new Date(), 89);

  const salesEntries = await prisma.salesEntry.findMany({
    where: {
      storeId,
      date: {
        gte: fromDate,
      },
    },
    select: {
      date: true,
      hour: true,
      revenue: true,
      transactions: true,
    },
    orderBy: [{ date: "asc" }, { hour: "asc" }],
  });

  const analytics = buildAnalytics(
    salesEntries.map(
      (entry: (typeof salesEntries)[number]) => ({
        date: entry.date,
        hour: entry.hour,
        revenue: Number(entry.revenue),
        transactions: entry.transactions,
      }),
    ),
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">Sales Analytics</h1>
        <p className="mt-2 text-slate-700">
          Phase 2 active: daily and weekly trend visualization, peak-hour
          detection, and momentum analysis.
        </p>
      </section>

      <AnalyticsCharts data={analytics} />
    </div>
  );
}

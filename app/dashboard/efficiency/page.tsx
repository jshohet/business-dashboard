import { subDays } from "date-fns";
import EfficiencyUI from "./ui";
import { auth } from "@/auth";
import { buildEfficiencyInsights } from "@/lib/operations";
import { prisma } from "@/lib/prisma";

export default async function EfficiencyPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return null;
  }

  const since = subDays(new Date(), 120);

  const [inventoryRows, laborRows, salesRows] = await Promise.all([
    prisma.inventoryLog.findMany({
      where: {
        storeId,
        date: { gte: since },
      },
      select: {
        product: true,
        date: true,
        orderedQty: true,
        soldQty: true,
        wasteQty: true,
      },
    }),
    prisma.laborEntry.findMany({
      where: {
        storeId,
        date: { gte: since },
      },
      select: {
        date: true,
        laborCost: true,
      },
    }),
    prisma.salesEntry.findMany({
      where: {
        storeId,
        date: { gte: since },
      },
      select: {
        date: true,
        revenue: true,
      },
    }),
  ]);

  const insights = buildEfficiencyInsights(
    inventoryRows.map((row: (typeof inventoryRows)[number]) => ({
      product: row.product,
      date: row.date,
      orderedQty: row.orderedQty,
      soldQty: row.soldQty,
      wasteQty: row.wasteQty,
    })),
    laborRows.map((row: (typeof laborRows)[number]) => ({
      date: row.date,
      laborCost: Number(row.laborCost),
    })),
    salesRows.map((row: (typeof salesRows)[number]) => ({
      date: row.date,
      revenue: Number(row.revenue),
    })),
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">
          Waste & Efficiency Tracker
        </h1>
        <p className="mt-2 text-slate-700">
          Track waste percentage, labor cost versus revenue, and operational
          alerts to improve profitability.
        </p>
      </section>

      <EfficiencyUI insights={insights} />
    </div>
  );
}

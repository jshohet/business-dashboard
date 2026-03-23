import { subDays } from "date-fns";
import InventoryUI from "./ui";
import { auth } from "@/auth";
import { buildInventoryForecast } from "@/lib/operations";
import { prisma } from "@/lib/prisma";

export default async function InventoryPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return null;
  }

  const inventoryRows = await prisma.inventoryLog.findMany({
    where: {
      storeId,
      date: {
        gte: subDays(new Date(), 120),
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  const forecastRows = buildInventoryForecast(
    inventoryRows.map((row: (typeof inventoryRows)[number]) => ({
      product: row.product,
      date: row.date,
      orderedQty: row.orderedQty,
      soldQty: row.soldQty,
      wasteQty: row.wasteQty,
    })),
    7,
    new Date(),
  );

  const recentLogs = inventoryRows.slice(0, 25).map((row: (typeof inventoryRows)[number]) => ({
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    product: row.product,
    orderedQty: row.orderedQty,
    soldQty: row.soldQty,
    wasteQty: row.wasteQty,
  }));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">
          Inventory Forecasting
        </h1>
        <p className="mt-2 text-slate-700">
          Predict recommended product order quantities using sales history and
          day-of-week demand trends.
        </p>
      </section>

      <InventoryUI forecastRows={forecastRows} recentLogs={recentLogs} />
    </div>
  );
}

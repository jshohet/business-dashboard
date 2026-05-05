import { subDays } from "date-fns";
import InventoryUI from "./ui";
import { auth } from "@/auth";
import { buildInventoryForecast } from "@/lib/operations";
import { prisma } from "@/lib/prisma";

export default async function InventoryPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;
  if (!storeId) return null;

  const inventoryRows = await prisma.inventoryLog.findMany({
    where: { storeId, date: { gte: subDays(new Date(), 120) } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  const forecastRows = buildInventoryForecast(
    inventoryRows.map((r: (typeof inventoryRows)[number]) => ({
      product: r.product, date: r.date, orderedQty: r.orderedQty, soldQty: r.soldQty, wasteQty: r.wasteQty,
    })),
    7,
    new Date(),
  );

  const recentLogs = inventoryRows.slice(0, 25).map((r: (typeof inventoryRows)[number]) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    product: r.product,
    orderedQty: r.orderedQty,
    soldQty: r.soldQty,
    wasteQty: r.wasteQty,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>Module</p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)" }}>Inventory Forecasting</h1>
        <p style={{ marginTop: "0.4rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Predict recommended order quantities using sales history and day-of-week demand trends.
        </p>
      </section>
      <InventoryUI forecastRows={forecastRows} recentLogs={recentLogs} />
    </div>
  );
}

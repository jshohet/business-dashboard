import { subDays } from "date-fns";
import EfficiencyUI from "./ui";
import { auth } from "@/auth";
import { buildEfficiencyInsights } from "@/lib/operations";
import { prisma } from "@/lib/prisma";

export default async function EfficiencyPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;
  if (!storeId) return null;

  const since = subDays(new Date(), 120);

  const [inventoryRows, laborRows, salesRows] = await Promise.all([
    prisma.inventoryLog.findMany({ where: { storeId, date: { gte: since } }, select: { product: true, date: true, orderedQty: true, soldQty: true, wasteQty: true } }),
    prisma.laborEntry.findMany({ where: { storeId, date: { gte: since } }, select: { date: true, laborCost: true } }),
    prisma.salesEntry.findMany({ where: { storeId, date: { gte: since } }, select: { date: true, revenue: true } }),
  ]);

  const insights = buildEfficiencyInsights(
    inventoryRows.map((r: (typeof inventoryRows)[number]) => ({ product: r.product, date: r.date, orderedQty: r.orderedQty, soldQty: r.soldQty, wasteQty: r.wasteQty })),
    laborRows.map((r: (typeof laborRows)[number]) => ({ date: r.date, laborCost: Number(r.laborCost) })),
    salesRows.map((r: (typeof salesRows)[number]) => ({ date: r.date, revenue: Number(r.revenue) })),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>Module</p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)" }}>Waste &amp; Efficiency</h1>
        <p style={{ marginTop: "0.4rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Track waste percentage, labor-to-revenue ratios, and operational alerts.
        </p>
      </section>
      <EfficiencyUI insights={insights} />
    </div>
  );
}

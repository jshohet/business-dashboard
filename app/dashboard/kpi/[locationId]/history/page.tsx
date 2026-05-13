import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

const METRIC_LABELS: Record<string, string> = {
  labor_cost_pct: "Labor %",
  waste_pct: "Waste %",
  speed_of_service_avg: "SoS (sec)",
  customer_satisfaction: "CSAT",
  revenue_vs_target_pct: "Rev vs Target %",
  controllable_profit_pct: "Ctrl Profit %",
};

export default async function KpiHistoryPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { locationId } = await params;

  const location = await prisma.location.findFirst({
    where: { id: locationId, storeId: session.user.storeId as string, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!location) notFound();

  const entries = await prisma.kpiEntry.findMany({
    where: { locationId },
    orderBy: { weekEnding: "desc" },
    select: { id: true, weekEnding: true, metrics: true, notes: true, createdAt: true },
  });

  // Collect all metric keys across all entries for the table header
  const allKeys = Array.from(
    new Set(entries.flatMap((e) => Object.keys(e.metrics as Record<string, number>))),
  );

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <Link href={`/dashboard/locations/${locationId}`} style={{ fontSize: "0.78rem", color: "var(--text-3)", textDecoration: "none", display: "inline-block", marginBottom: "0.5rem" }}>
            ← {location.name}
          </Link>
          <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
            KPI history
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "0.25rem" }}>
            {entries.length} week{entries.length !== 1 ? "s" : ""} of data
          </p>
        </div>
        <Link href={`/dashboard/kpi/${locationId}/new`} className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem" }}>
          + Enter this week
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", marginBottom: "1.5rem" }}>No entries yet.</p>
          <Link href={`/dashboard/kpi/${locationId}/new`} className="btn-primary" style={{ textDecoration: "none" }}>
            Enter your first week →
          </Link>
        </div>
      ) : (
        <div className="card-static" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Week ending</th>
                {allKeys.map((k) => (
                  <th key={k}>{METRIC_LABELS[k] ?? k}</th>
                ))}
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const m = entry.metrics as Record<string, number>;
                return (
                  <tr key={entry.id}>
                    <td style={{ color: "var(--text-1)", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {format(new Date(entry.weekEnding), "MMM d, yyyy")}
                    </td>
                    {allKeys.map((k) => (
                      <td key={k} className="tabular">
                        {m[k] !== undefined ? m[k] : <span style={{ color: "var(--border)" }}>—</span>}
                      </td>
                    ))}
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.notes ?? <span style={{ color: "var(--border)" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

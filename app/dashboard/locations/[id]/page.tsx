import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const location = await prisma.location.findFirst({
    where: { id, storeId: session.user.storeId as string, deletedAt: null },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      kpiEntries: {
        orderBy: { weekEnding: "desc" },
        take: 5,
        select: { id: true, weekEnding: true, metrics: true, notes: true },
      },
      aiReports: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, reportType: true, createdAt: true },
      },
      _count: { select: { kpiEntries: true, aiReports: true } },
    },
  });

  if (!location) notFound();

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <Link href="/dashboard/locations" style={{ fontSize: "0.78rem", color: "var(--text-3)", textDecoration: "none", display: "inline-block", marginBottom: "0.5rem" }}>
            ← Locations
          </Link>
          <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
            {location.name}
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "0.25rem" }}>
            {location.type} · added {format(new Date(location.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <Link
          href={`/dashboard/kpi/${location.id}/new`}
          className="btn-primary"
          style={{ textDecoration: "none", fontSize: "0.85rem" }}>
          + Enter this week&apos;s KPIs
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* KPI history */}
        <div className="card-static" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)" }}>
              Recent KPI entries
            </h2>
            {location._count.kpiEntries > 0 && (
              <Link href={`/dashboard/kpi/${location.id}/history`} style={{ fontSize: "0.75rem", color: "var(--amber)", textDecoration: "none" }}>
                View all {location._count.kpiEntries} →
              </Link>
            )}
          </div>

          {location.kpiEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "1rem" }}>No entries yet</p>
              <Link href={`/dashboard/kpi/${location.id}/new`} style={{ fontSize: "0.82rem", color: "var(--amber)", textDecoration: "none" }}>
                Enter your first week →
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week ending</th>
                  <th>Metrics</th>
                </tr>
              </thead>
              <tbody>
                {location.kpiEntries.map((entry) => {
                  const metricCount = Object.keys(entry.metrics as Record<string, unknown>).length;
                  return (
                    <tr key={entry.id}>
                      <td style={{ color: "var(--text-1)", fontWeight: 500 }}>
                        {format(new Date(entry.weekEnding), "MMM d, yyyy")}
                      </td>
                      <td>{metricCount} metric{metricCount !== 1 ? "s" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* AI reports */}
        <div className="card-static" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)" }}>
              AI reports
            </h2>
            {location._count.aiReports > 0 && (
              <Link href="/dashboard/reports" style={{ fontSize: "0.75rem", color: "var(--amber)", textDecoration: "none" }}>
                View all →
              </Link>
            )}
          </div>

          {location.aiReports.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", padding: "1.5rem 0", textAlign: "center" }}>
              Reports appear here after you enter KPIs.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {location.aiReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.75rem",
                    background: "var(--bg)",
                    borderRadius: 8,
                    border: "1px solid var(--border-subtle)",
                  }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-2)", textTransform: "capitalize" }}>
                    {report.reportType.replace(/_/g, " ")}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                    {format(new Date(report.createdAt), "MMM d")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

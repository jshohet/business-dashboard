import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

const REPORT_TYPE_LABELS: Record<string, string> = {
  drift_analysis:  "Drift Analysis",
  ordering:        "Ordering Cadence",
  coaching_script: "Coaching Script",
  weekly_ops:      "Weekly Ops Report",
};

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locations = await prisma.location.findMany({
    where: { storeId: session.user.storeId as string, deletedAt: null },
    select: { id: true, name: true },
  });

  const locationIds = locations.map((l) => l.id);

  const reports = await prisma.aiReport.findMany({
    where: { locationId: { in: locationIds } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reportType: true,
      createdAt: true,
      locationId: true,
      content: true,
    },
  });

  const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          AI Reports
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Report history
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          Every AI analysis is saved here for reference.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)" }}>
            No reports yet. Enter your first week of KPIs to generate a drift analysis.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {reports.map((report) => {
            let summary = "";
            try {
              const parsed = JSON.parse(report.content) as Record<string, unknown>;
              summary = (parsed.summary ?? parsed.headline ?? "") as string;
            } catch {}

            return (
              <details
                key={report.id}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}>
                <summary
                  style={{
                    padding: "1rem 1.25rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    listStyle: "none",
                    userSelect: "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--amber)",
                        background: "var(--amber-glow)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}>
                      {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {locationMap[report.locationId] ?? "Unknown"}{summary ? ` — ${summary}` : ""}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)", flexShrink: 0 }}>
                    {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </span>
                </summary>
                <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <pre
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-2)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "var(--font-mono), monospace",
                    }}>
                    {JSON.stringify(JSON.parse(report.content), null, 2)}
                  </pre>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

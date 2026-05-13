import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function KpiIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locations = await prisma.location.findMany({
    where: { storeId: session.user.storeId as string, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, type: true },
  });

  // Single location — go straight to entry
  if (locations.length === 1) {
    redirect(`/dashboard/kpi/${locations[0].id}/new`);
  }

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          KPI Entry
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Which location?
        </h1>
      </div>

      {locations.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", marginBottom: "1.5rem" }}>
            Add a location first before entering KPIs.
          </p>
          <Link href="/dashboard/locations/new" className="btn-primary" style={{ textDecoration: "none" }}>
            Add your first location →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", maxWidth: 480 }}>
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/dashboard/kpi/${loc.id}/new`}
              className="card"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", textDecoration: "none" }}>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-1)" }}>{loc.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{loc.type}</p>
              </div>
              <span style={{ color: "var(--amber)", fontSize: "1rem" }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

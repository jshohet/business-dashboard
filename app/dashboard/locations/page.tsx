import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanFeatures, getPlanLabel } from "@/lib/plan-features";
import { format } from "date-fns";

export default async function LocationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { plan: true },
  });

  const features = getPlanFeatures(store?.plan ?? "starter");
  const planLabel = getPlanLabel(store?.plan ?? "starter");

  const locations = await prisma.location.findMany({
    where: { storeId: session.user.storeId as string, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      _count: { select: { kpiEntries: true } },
      kpiEntries: {
        orderBy: { weekEnding: "desc" },
        take: 1,
        select: { weekEnding: true },
      },
    },
  });

  const atLimit = locations.length >= features.maxLocations;

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
            Locations
          </p>
          <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
            Your stores
          </h1>
        </div>
        {atLimit ? (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "0.4rem" }}>
              {locations.length} / {features.maxLocations} on {planLabel}
            </p>
            <Link href="/dashboard/settings/billing" className="btn-ghost" style={{ fontSize: "0.82rem", textDecoration: "none" }}>
              Upgrade for more →
            </Link>
          </div>
        ) : (
          <Link href="/dashboard/locations/new" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem" }}>
            + Add location
          </Link>
        )}
      </div>

      {locations.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⊞</p>
          <h2 className="font-serif" style={{ fontSize: "1.3rem", color: "var(--text-1)", marginBottom: "0.5rem" }}>
            No locations yet
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", marginBottom: "1.5rem" }}>
            Add your first location to start entering KPIs.
          </p>
          <Link href="/dashboard/locations/new" className="btn-primary" style={{ textDecoration: "none" }}>
            Add your first location →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {locations.map((loc) => {
            const lastEntry = loc.kpiEntries[0];
            return (
              <Link
                key={loc.id}
                href={`/dashboard/locations/${loc.id}`}
                className="card"
                style={{ display: "block", padding: "1.25rem 1.5rem", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.2rem" }}>
                      {loc.name}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
                      {loc.type} · {loc._count.kpiEntries} week{loc._count.kpiEntries !== 1 ? "s" : ""} of data
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {lastEntry ? (
                      <>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "0.15rem" }}>Last entry</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", fontWeight: 500 }}>
                          {format(new Date(lastEntry.weekEnding), "MMM d, yyyy")}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: "0.78rem", color: "var(--amber)" }}>No entries yet</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderingIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locations = await prisma.location.findMany({
    where: { storeId: session.user.storeId as string, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, type: true },
  });

  // Single location — skip the picker and go straight in
  if (locations.length === 1) {
    redirect(`/dashboard/ordering/${locations[0].id}`);
  }

  return (
    <div className="anim-fade-up" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Ordering
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Which location?
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          Select a location to generate its ordering recommendations.
        </p>
      </div>

      {locations.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", marginBottom: "1rem" }}>
            No locations yet. Add one first.
          </p>
          <Link href="/dashboard/locations/new" className="btn-primary" style={{ textDecoration: "none" }}>
            Add a location →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/dashboard/ordering/${loc.id}`}
              className="card"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", textDecoration: "none" }}>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-1)" }}>{loc.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "0.1rem" }}>{loc.type}</p>
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

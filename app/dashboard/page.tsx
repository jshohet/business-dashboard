import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/currency";

const modules = [
  {
    href: "/dashboard/analytics",
    icon: "↗",
    label: "Analytics",
    desc: "Daily & weekly trends, peak-hour detection, momentum insights.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.08)",
  },
  {
    href: "/dashboard/scheduling",
    icon: "◷",
    label: "Scheduling",
    desc: "Generate next-week staffing plans from demand and availability.",
    color: "#14b8a6",
    glow: "rgba(20,184,166,0.08)",
  },
  {
    href: "/dashboard/inventory",
    icon: "▦",
    label: "Inventory",
    desc: "Forecast demand and recommended order quantities by product.",
    color: "#818cf8",
    glow: "rgba(129,140,248,0.08)",
  },
  {
    href: "/dashboard/efficiency",
    icon: "◎",
    label: "Efficiency",
    desc: "Track waste and labor-to-revenue performance with smart alerts.",
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.08)",
  },
  {
    href: "/dashboard/sales",
    icon: "+",
    label: "Sales Entry",
    desc: "Capture hourly sales to power analytics and scheduling.",
    color: "#9ca3af",
    glow: "rgba(156,163,175,0.06)",
  },
  {
    href: "/dashboard/employees",
    icon: "◯",
    label: "Team",
    desc: "Manage employees and availability for roster generation.",
    color: "#9ca3af",
    glow: "rgba(156,163,175,0.06)",
  },
] as const;

export default async function DashboardPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return null;

  const [salesCount, totalRevenueAgg, employeeCount] = await Promise.all([
    prisma.salesEntry.count({ where: { storeId } }),
    prisma.salesEntry.aggregate({ where: { storeId }, _sum: { revenue: true } }),
    prisma.employee.count({ where: { storeId } }),
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.revenue ?? 0);

  const metrics = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "var(--amber)" },
    { label: "Sales Entries",  value: String(salesCount),          color: "var(--text-1)" },
    { label: "Employees",      value: String(employeeCount),        color: "var(--text-1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* Heading */}
      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Dashboard
        </p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.1 }}>
          Overview
        </h1>
        <p style={{ marginTop: "0.5rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Your store at a glance. Use each module to track, optimize, and forecast.
        </p>
      </section>

      {/* Metric cards */}
      <section
        style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {metrics.map((m, i) => (
          <article
            key={m.label}
            className={`card-static anim-fade-up anim-delay-${i + 1}`}
            style={{ padding: "1.5rem" }}>
            <p className="metric-label">{m.label}</p>
            <p
              className="metric-value"
              style={{ marginTop: "0.6rem", color: m.color }}>
              {m.value}
            </p>
          </article>
        ))}
      </section>

      {/* Module grid */}
      <section>
        <p style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>
          Modules
        </p>
        <div style={{ display: "grid", gap: "0.875rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {modules.map((mod, i) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`card anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}
              style={{
                padding: "1.25rem 1.375rem",
                textDecoration: "none",
                display: "block",
                background: `linear-gradient(135deg, ${mod.glow} 0%, var(--bg-raised) 60%)`,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: 8,
                  background: `${mod.glow}`,
                  border: `1px solid ${mod.color}22`,
                  color: mod.color, fontSize: "0.9rem", fontWeight: 700,
                }}>
                  {mod.icon}
                </span>
                <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.9rem" }}>
                  {mod.label}
                </span>
              </div>
              <p style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.55 }}>
                {mod.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

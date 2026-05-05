import { startOfDay, subDays } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateWeeklySchedule } from "@/lib/scheduling";
import { formatCurrency } from "@/lib/currency";

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export default async function SchedulingPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;
  if (!storeId) return null;

  const today = startOfDay(new Date());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [employees, availabilityRows, salesRows] = await Promise.all([
    prisma.employee.findMany({ where: { storeId }, select: { id: true, name: true, role: true }, orderBy: { name: "asc" } }),
    prisma.employeeAvailability.findMany({
      where: { employee: { storeId }, date: { gte: today, lt: weekEnd } },
      select: { employeeId: true, date: true, startHour: true, endHour: true },
    }),
    prisma.salesEntry.findMany({
      where: { storeId, date: { gte: subDays(today, 90) } },
      select: { date: true, hour: true, revenue: true },
    }),
  ]);

  const schedule = generateWeeklySchedule(
    employees,
    availabilityRows,
    salesRows.map((r: (typeof salesRows)[number]) => ({ date: r.date, hour: r.hour, revenue: Number(r.revenue) })),
    today,
  );

  const summaryMetrics = [
    { label: "Required Staff-Hours",  value: String(schedule.summary.totalRequiredHours),            color: "var(--text-1)" },
    { label: "Assigned Staff-Hours",  value: String(schedule.summary.totalAssignedHours),             color: "var(--text-1)" },
    { label: "Coverage Rate",         value: `${schedule.summary.fillRate.toFixed(1)}%`,              color: "#14b8a6" },
    { label: "Uncovered Slots",       value: String(schedule.summary.uncoveredSlots),                 color: schedule.summary.uncoveredSlots > 0 ? "#f43f5e" : "#14b8a6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>Module</p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)" }}>Smart Scheduling</h1>
        <p style={{ marginTop: "0.4rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Demand-based shift suggestions for {schedule.planningWindow.startDate} → {schedule.planningWindow.endDate}
        </p>
      </section>

      {/* Summary metrics */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
        {summaryMetrics.map((m, i) => (
          <article key={m.label} className={`card-static anim-fade-up anim-delay-${i + 1}`} style={{ padding: "1.25rem" }}>
            <p className="metric-label">{m.label}</p>
            <p className="metric-value" style={{ marginTop: "0.5rem", color: m.color, fontSize: "1.65rem" }}>{m.value}</p>
          </article>
        ))}
      </section>

      {/* Suggested shifts */}
      <article className="card-static anim-fade-up anim-delay-3" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Suggested Weekly Shifts</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>
          Prioritise peak demand · respect availability · max 8h/day, 40h/week
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead><tr>
              {["Date","Employee","Role","Shift","Hours"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {schedule.suggestedShifts.map((s) => (
                <tr key={`${s.date}-${s.employeeId}-${s.startHour}`}>
                  <td className="font-mono" style={{ color: "var(--text-1)" }}>{s.date}</td>
                  <td>{s.employeeName}</td>
                  <td style={{ color: "var(--amber)" }}>{s.role}</td>
                  <td className="font-mono">{hourLabel(s.startHour)} – {hourLabel(s.endHour)}</td>
                  <td className="font-mono" style={{ color: "var(--text-1)" }}>{s.hours}</td>
                </tr>
              ))}
              {schedule.suggestedShifts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "1.25rem 0.75rem", color: "var(--text-3)" }}>
                  No suggestions yet — add employees and next-week availability first.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Gaps + Demand */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}>
        <article className="card-static anim-fade-up anim-delay-4" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Coverage Gaps</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Slots where required staffing exceeds assignment</p>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 280 }}>
              <thead><tr>{["Date","Hour","Missing"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {schedule.coverageGaps.slice(0, 25).map((g) => (
                  <tr key={`${g.date}-${g.hour}`}>
                    <td className="font-mono">{g.date} <span style={{ color: "var(--text-3)" }}>({g.weekday})</span></td>
                    <td className="font-mono">{hourLabel(g.hour)}</td>
                    <td className="font-mono" style={{ color: "#f43f5e" }}>{g.missingStaff}</td>
                  </tr>
                ))}
                {schedule.coverageGaps.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: "1rem 0.75rem", color: "#14b8a6" }}>No gaps detected.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-static anim-fade-up anim-delay-5" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Demand Snapshot</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Projected revenue &amp; staff per slot</p>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 360 }}>
              <thead><tr>{["Date","Hour","Revenue","Req","Asn"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {schedule.hourDemand.slice(0, 40).map((s) => (
                  <tr key={`${s.date}-${s.hour}`}>
                    <td className="font-mono">{s.date}</td>
                    <td className="font-mono">{hourLabel(s.hour)}</td>
                    <td className="font-mono">{formatCurrency(s.projectedRevenue)}</td>
                    <td className="font-mono" style={{ color: "var(--amber)" }}>{s.requiredStaff}</td>
                    <td className="font-mono" style={{ color: s.assignedStaff >= s.requiredStaff ? "#14b8a6" : "#f43f5e" }}>{s.assignedStaff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

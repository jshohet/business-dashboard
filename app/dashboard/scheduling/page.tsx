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

  if (!storeId) {
    return null;
  }

  const today = startOfDay(new Date());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [employees, availabilityRows, salesRows] = await Promise.all([
    prisma.employee.findMany({
      where: { storeId },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.employeeAvailability.findMany({
      where: {
        employee: { storeId },
        date: {
          gte: today,
          lt: weekEnd,
        },
      },
      select: {
        employeeId: true,
        date: true,
        startHour: true,
        endHour: true,
      },
    }),
    prisma.salesEntry.findMany({
      where: {
        storeId,
        date: {
          gte: subDays(today, 90),
        },
      },
      select: {
        date: true,
        hour: true,
        revenue: true,
      },
    }),
  ]);

  const schedule = generateWeeklySchedule(
    employees,
    availabilityRows,
    salesRows.map((row) => ({
      date: row.date,
      hour: row.hour,
      revenue: Number(row.revenue),
    })),
    today,
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">Smart Scheduling</h1>
        <p className="mt-2 text-slate-700">
          Phase 3 active: schedule suggestions are generated from demand and
          availability for the next 7 days.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Window: {schedule.planningWindow.startDate} to{" "}
          {schedule.planningWindow.endDate}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Required Staff-Hours</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {schedule.summary.totalRequiredHours}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Assigned Staff-Hours</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {schedule.summary.totalAssignedHours}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Coverage Rate</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">
            {schedule.summary.fillRate.toFixed(2)}%
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Uncovered Time Slots</p>
          <p className="mt-2 text-3xl font-black text-rose-700">
            {schedule.summary.uncoveredSlots}
          </p>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Suggested Weekly Shifts
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Rules used: prioritize peak demand, respect availability, max 8h/day
          and 40h/week per employee.
        </p>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-190 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 font-semibold">Date</th>
                <th className="py-2 font-semibold">Employee</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Shift</th>
                <th className="py-2 font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {schedule.suggestedShifts.map((shift) => (
                <tr
                  key={`${shift.date}-${shift.employeeId}-${shift.startHour}`}
                  className="border-b border-slate-100">
                  <td className="py-2">{shift.date}</td>
                  <td className="py-2">{shift.employeeName}</td>
                  <td className="py-2">{shift.role}</td>
                  <td className="py-2">
                    {hourLabel(shift.startHour)} - {hourLabel(shift.endHour)}
                  </td>
                  <td className="py-2">{shift.hours}</td>
                </tr>
              ))}
              {schedule.suggestedShifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-slate-500">
                    No schedule suggestions generated. Add employees and
                    next-week availability first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Coverage Gaps</h2>
          <p className="mt-1 text-sm text-slate-600">
            Slots where required staffing exceeds available assignment.
          </p>
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-130 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Hour</th>
                  <th className="py-2 font-semibold">Missing Staff</th>
                </tr>
              </thead>
              <tbody>
                {schedule.coverageGaps.slice(0, 25).map((gap) => (
                  <tr
                    key={`${gap.date}-${gap.hour}`}
                    className="border-b border-slate-100">
                    <td className="py-2">
                      {gap.date} ({gap.weekday})
                    </td>
                    <td className="py-2">{hourLabel(gap.hour)}</td>
                    <td className="py-2 text-rose-700">{gap.missingStaff}</td>
                  </tr>
                ))}
                {schedule.coverageGaps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-emerald-700">
                      No gaps detected for the next 7 days.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Demand Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">
            Projected demand and required staff per time slot.
          </p>
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-155 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Hour</th>
                  <th className="py-2 font-semibold">Projected Revenue</th>
                  <th className="py-2 font-semibold">Required</th>
                  <th className="py-2 font-semibold">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {schedule.hourDemand.slice(0, 40).map((slot) => (
                  <tr
                    key={`${slot.date}-${slot.hour}`}
                    className="border-b border-slate-100">
                    <td className="py-2">
                      {slot.date} ({slot.weekday})
                    </td>
                    <td className="py-2">{hourLabel(slot.hour)}</td>
                    <td className="py-2">
                      {formatCurrency(slot.projectedRevenue)}
                    </td>
                    <td className="py-2">{slot.requiredStaff}</td>
                    <td className="py-2">{slot.assignedStaff}</td>
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

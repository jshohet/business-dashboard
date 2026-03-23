import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/currency";

export default async function DashboardPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return null;
  }

  const [salesCount, totalRevenueAgg, employeeCount] = await Promise.all([
    prisma.salesEntry.count({ where: { storeId } }),
    prisma.salesEntry.aggregate({
      where: { storeId },
      _sum: { revenue: true },
    }),
    prisma.employee.count({ where: { storeId } }),
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.revenue ?? 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-slate-700">
          All core phases are implemented. Use each module to track sales,
          optimize staffing, forecast inventory, and monitor efficiency.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Total Revenue Logged</p>
          <p className="mt-2 text-3xl font-black">
            {formatCurrency(totalRevenue)}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Sales Entries</p>
          <p className="mt-2 text-3xl font-black">{salesCount}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Employees</p>
          <p className="mt-2 text-3xl font-black">{employeeCount}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/dashboard/analytics"
          className="rounded-2xl border border-orange-200 bg-orange-50 p-5 transition hover:bg-orange-100">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-700">
            Analytics
          </p>
          <p className="mt-2 text-slate-800">
            Daily and weekly trends, peak-hour detection, momentum insights.
          </p>
        </Link>
        <Link
          href="/dashboard/scheduling"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Scheduling
          </p>
          <p className="mt-2 text-slate-800">
            Generate next-week staffing plans from demand and availability.
          </p>
        </Link>
        <Link
          href="/dashboard/inventory"
          className="rounded-2xl border border-sky-200 bg-sky-50 p-5 transition hover:bg-sky-100">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
            Inventory
          </p>
          <p className="mt-2 text-slate-800">
            Forecast demand and recommended order quantities by product.
          </p>
        </Link>
        <Link
          href="/dashboard/efficiency"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 transition hover:bg-rose-100">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-700">
            Efficiency
          </p>
          <p className="mt-2 text-slate-800">
            Track waste and labor-to-revenue performance with alerts.
          </p>
        </Link>
        <Link
          href="/dashboard/sales"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
            Sales Input
          </p>
          <p className="mt-2 text-slate-800">
            Capture sales by day/hour to power analytics and scheduling.
          </p>
        </Link>
        <Link
          href="/dashboard/employees"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
            Team Input
          </p>
          <p className="mt-2 text-slate-800">
            Maintain employees and availability for roster generation.
          </p>
        </Link>
      </section>
    </div>
  );
}

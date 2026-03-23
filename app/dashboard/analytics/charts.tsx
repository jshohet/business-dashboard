"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { AnalyticsResult } from "@/lib/analytics";

type Props = {
  data: AnalyticsResult;
};

function currencyTooltip(value: unknown) {
  return formatCurrency(Number(value ?? 0));
}

export default function AnalyticsCharts({ data }: Props) {
  const trendTone =
    data.trend.direction === "up"
      ? "text-emerald-700"
      : data.trend.direction === "down"
        ? "text-rose-700"
        : "text-slate-700";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Last 7 Days Revenue</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(data.trend.currentPeriodRevenue)}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Previous 7 Days Revenue</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(data.trend.previousPeriodRevenue)}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Trend Delta</p>
          <p className={`mt-2 text-3xl font-black ${trendTone}`}>
            {data.trend.percentChange > 0 ? "+" : ""}
            {data.trend.percentChange.toFixed(2)}%
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Daily Revenue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Track day-by-day sales momentum.
          </p>
          <div className="mt-5 w-full" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.dailyRevenue}
                margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={currencyTooltip} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Weekly Revenue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Compare week-on-week business health.
          </p>
          <div className="mt-5 w-full" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.weeklyRevenue}
                margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={currencyTooltip} />
                <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Revenue by Hour</h2>
          <p className="mt-1 text-sm text-slate-600">
            Detect operating peaks across trading hours.
          </p>
          <div className="mt-5 w-full" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.hourlyRevenue}
                margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={currencyTooltip} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Peak Hour Insights
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Your top-performing windows based on logged sales.
          </p>
          <ul className="mt-5 space-y-3">
            {data.peakHours.map((peak, index) => (
              <li
                key={peak.hour}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Peak #{index + 1}
                </p>
                <p className="mt-1 text-xl font-black text-slate-900">
                  {peak.hour}:00 - {Math.min(peak.hour + 1, 24)}:00
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Revenue: {formatCurrency(peak.revenue)} | Avg per entry:{" "}
                  {formatCurrency(peak.averageRevenue)}
                </p>
              </li>
            ))}
            {data.peakHours.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                No sales data yet. Add entries in Sales to unlock insights.
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </div>
  );
}

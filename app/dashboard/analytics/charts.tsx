"use client";

import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { AnalyticsResult } from "@/lib/analytics";

type Props = { data: AnalyticsResult };

function currencyTooltip(value: unknown) {
  return formatCurrency(Number(value ?? 0));
}

const tooltipStyle = {
  backgroundColor: "#181b23",
  border: "1px solid #23262f",
  borderRadius: 10,
  color: "#f0ede8",
  fontSize: "0.78rem",
  padding: "0.5rem 0.875rem",
};

const tickStyle = { fill: "#5a5c66", fontSize: 10 };
const gridStroke = "#1a1d25";

export default function AnalyticsCharts({ data }: Props) {
  const trendColor =
    data.trend.direction === "up"
      ? "#14b8a6"
      : data.trend.direction === "down"
        ? "#f43f5e"
        : "#9295a0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Trend summary cards */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
        {[
          { label: "Last 7 Days", value: formatCurrency(data.trend.currentPeriodRevenue),  color: "var(--text-1)" },
          { label: "Prev 7 Days", value: formatCurrency(data.trend.previousPeriodRevenue), color: "var(--text-1)" },
          {
            label: "Trend",
            value: `${data.trend.percentChange > 0 ? "+" : ""}${data.trend.percentChange.toFixed(2)}%`,
            color: trendColor,
          },
        ].map((m, i) => (
          <article key={m.label} className={`card-static anim-fade-up anim-delay-${i + 1}`} style={{ padding: "1.25rem 1.375rem" }}>
            <p className="metric-label">{m.label}</p>
            <p className="metric-value" style={{ marginTop: "0.5rem", color: m.color, fontSize: "1.6rem" }}>{m.value}</p>
          </article>
        ))}
      </section>

      {/* Charts row 1 */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}>
        <article className="card-static anim-fade-up anim-delay-2" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Daily Revenue</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Day-by-day sales momentum</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyRevenue} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={tickStyle} minTickGap={28} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={currencyTooltip} contentStyle={tooltipStyle} cursor={{ stroke: "#23262f" }} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card-static anim-fade-up anim-delay-3" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Weekly Revenue</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Week-on-week comparison</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyRevenue} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={tickStyle} minTickGap={28} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={currencyTooltip} contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Charts row 2 */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}>
        <article className="card-static anim-fade-up anim-delay-4" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Revenue by Hour</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Peak trading hours</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyRevenue} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="hour" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={currencyTooltip} contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card-static anim-fade-up anim-delay-5" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Peak Hour Insights</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Top-performing windows</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {data.peakHours.map((peak, index) => (
              <div
                key={peak.hour}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "0.875rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                <span style={{
                  fontFamily: "var(--font-jb-mono)", fontSize: "0.65rem",
                  color: "var(--text-3)", minWidth: 48,
                }}>
                  Peak #{index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p className="font-mono" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--amber)" }}>
                    {peak.hour}:00 – {Math.min(peak.hour + 1, 24)}:00
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "0.15rem" }}>
                    {formatCurrency(peak.revenue)} total &nbsp;·&nbsp; avg {formatCurrency(peak.averageRevenue)}
                  </p>
                </div>
              </div>
            ))}
            {data.peakHours.length === 0 ? (
              <p style={{ color: "var(--text-3)", fontSize: "0.82rem", padding: "1rem 0" }}>
                No sales data yet — add entries to unlock insights.
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}

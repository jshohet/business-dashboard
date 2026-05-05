"use client";

import { useActionState } from "react";
import { createLaborEntryAction } from "../actions";
import { formatCurrency } from "@/lib/currency";
import type { EfficiencyInsights } from "@/lib/operations";

type Props = { insights: EfficiencyInsights };
const initialState: string | null = null;

const labelStyle = {
  display: "block" as const,
  marginBottom: "0.4rem",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  color: "var(--text-3)",
  fontWeight: 500,
};

export default function EfficiencyUI({ insights }: Props) {
  const [error, formAction, isPending] = useActionState(createLaborEntryAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Top metrics */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
        <article className="card-static anim-fade-up" style={{ padding: "1.25rem" }}>
          <p className="metric-label">Overall Waste Rate</p>
          <p className="metric-value" style={{ marginTop: "0.5rem", color: "#f43f5e", fontSize: "1.8rem" }}>
            {insights.waste.overallWasteRate.toFixed(2)}%
          </p>
        </article>
        <article className="card-static anim-fade-up anim-delay-1" style={{ padding: "1.25rem", gridColumn: "span 2" }}>
          <p className="metric-label" style={{ marginBottom: "0.75rem" }}>Alerts</p>
          {insights.alerts.length === 0 ? (
            <p style={{ color: "#14b8a6", fontSize: "0.82rem" }}>No active alerts — everything looks healthy.</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {insights.alerts.slice(0, 4).map((alert) => (
                <li key={alert} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.5rem",
                  fontSize: "0.82rem", color: "var(--text-2)",
                }}>
                  <span style={{ color: "#f59e0b", marginTop: "0.05rem" }}>▲</span>
                  {alert}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* Log labor form */}
      <article className="card-static anim-fade-up anim-delay-2" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Log Labor Cost</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>
          Compare staffing cost against daily revenue.
        </p>
        <form action={formAction} style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>DATE</span>
            <input type="date" name="date" required className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>LABOR COST ($)</span>
            <input type="number" name="laborCost" min={0} step="0.01" required className="inp" />
          </label>
          <label style={{ display: "block", gridColumn: "span 2" }}>
            <span style={labelStyle}>NOTES</span>
            <input type="text" name="notes" placeholder="Optional context" className="inp" />
          </label>

          {error ? <p className="alert-error" style={{ gridColumn: "span 2" }}>{error}</p> : null}

          <button type="submit" disabled={isPending} className="btn-primary" style={{ gridColumn: "span 2", width: "100%" }}>
            {isPending ? "Saving…" : "Save Labor Cost"}
          </button>
        </form>
      </article>

      {/* Tables */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}>
        <article className="card-static anim-fade-up anim-delay-3" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Waste by Product</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 280 }}>
              <thead><tr>{["Product","Sold","Waste","Waste %"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {insights.waste.byProduct.map((r) => (
                  <tr key={r.product}>
                    <td>{r.product}</td>
                    <td className="font-mono" style={{ color: "#14b8a6" }}>{r.soldQty}</td>
                    <td className="font-mono" style={{ color: r.wasteQty > 0 ? "#f43f5e" : "var(--text-2)" }}>{r.wasteQty}</td>
                    <td className="font-mono" style={{ color: r.wasteRate > 10 ? "#f43f5e" : "var(--text-2)" }}>
                      {r.wasteRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {insights.waste.byProduct.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "1rem 0.75rem", color: "var(--text-3)" }}>No inventory data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-static anim-fade-up anim-delay-4" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Labor vs Revenue</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 320 }}>
              <thead><tr>{["Date","Revenue","Labor","Labor %"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {insights.laborVsRevenue.slice(-30).map((r) => (
                  <tr key={r.date}>
                    <td className="font-mono">{r.date}</td>
                    <td className="font-mono" style={{ color: "#14b8a6" }}>{formatCurrency(r.revenue)}</td>
                    <td className="font-mono">{formatCurrency(r.laborCost)}</td>
                    <td className="font-mono" style={{ color: r.laborToRevenuePct > 35 ? "#f43f5e" : "var(--text-2)" }}>
                      {r.laborToRevenuePct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {insights.laborVsRevenue.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "1rem 0.75rem", color: "var(--text-3)" }}>No labor records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

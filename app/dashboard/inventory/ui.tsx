"use client";

import { useActionState } from "react";
import { createInventoryLogAction } from "../actions";
import type { ForecastRow } from "@/lib/operations";

type InventoryLogRow = { id: string; date: string; product: string; orderedQty: number; soldQty: number; wasteQty: number };
type Props = { forecastRows: ForecastRow[]; recentLogs: InventoryLogRow[] };

const initialState: string | null = null;

const labelStyle = {
  display: "block" as const,
  marginBottom: "0.4rem",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  color: "var(--text-3)",
  fontWeight: 500,
};

export default function InventoryUI({ forecastRows, recentLogs }: Props) {
  const [error, formAction, isPending] = useActionState(createInventoryLogAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Log form */}
      <article className="card-static anim-fade-up" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Log Product Movement</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>
          Track daily sold and waste quantities to power forecasts.
        </p>
        <form action={formAction} style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>DATE</span>
            <input type="date" name="date" required className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>PRODUCT</span>
            <input type="text" name="product" required placeholder="Milk / Croissant" className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>ORDERED QTY</span>
            <input type="number" name="orderedQty" min={0} required className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>SOLD QTY</span>
            <input type="number" name="soldQty" min={0} required className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>WASTE QTY</span>
            <input type="number" name="wasteQty" min={0} defaultValue={0} className="inp" />
          </label>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {error ? <p className="alert-error" style={{ marginBottom: "0.5rem" }}>{error}</p> : null}
            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: "100%" }}>
              {isPending ? "Saving…" : "Save Log"}
            </button>
          </div>
        </form>
      </article>

      {/* Forecast */}
      <article className="card-static anim-fade-up anim-delay-1" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>Recommended Orders — Next 7 Days</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1.25rem" }}>Based on day-of-week demand patterns</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 480 }}>
            <thead><tr>{["Date","Product","Predicted Demand","Recommended Order"].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {forecastRows.map((r) => (
                <tr key={`${r.date}-${r.product}`}>
                  <td className="font-mono">{r.date} <span style={{ color: "var(--text-3)" }}>({r.weekday})</span></td>
                  <td>{r.product}</td>
                  <td className="font-mono">{r.predictedDemand.toFixed(1)}</td>
                  <td className="font-mono" style={{ color: "var(--amber)", fontWeight: 600 }}>{r.recommendedOrderQty}</td>
                </tr>
              ))}
              {forecastRows.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "1rem 0.75rem", color: "var(--text-3)" }}>
                  No forecast yet — add inventory logs first.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Recent logs */}
      <article className="card-static anim-fade-up anim-delay-2" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Recent Inventory Logs</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 420 }}>
            <thead><tr>{["Date","Product","Ordered","Sold","Waste"].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {recentLogs.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono">{r.date}</td>
                  <td>{r.product}</td>
                  <td className="font-mono">{r.orderedQty}</td>
                  <td className="font-mono" style={{ color: "#14b8a6" }}>{r.soldQty}</td>
                  <td className="font-mono" style={{ color: r.wasteQty > 0 ? "#f43f5e" : "var(--text-2)" }}>{r.wasteQty}</td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "1rem 0.75rem", color: "var(--text-3)" }}>No logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

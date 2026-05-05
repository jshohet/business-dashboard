"use client";

import { useActionState } from "react";
import { createSalesEntryAction } from "../actions";

const initialState: string | null = null;

const labelStyle = {
  display: "block" as const,
  marginBottom: "0.4rem",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  color: "var(--text-3)",
  fontWeight: 500,
};

export default function SalesPage() {
  const [error, formAction, isPending] = useActionState(createSalesEntryAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>Module</p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)" }}>Sales Entry</h1>
        <p style={{ marginTop: "0.4rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Log hourly sales manually to power analytics and scheduling.
        </p>
      </section>

      <article className="card-static anim-fade-up anim-delay-1" style={{ padding: "1.75rem", maxWidth: 600 }}>
        <form action={formAction} style={{ display: "grid", gap: "1.125rem", gridTemplateColumns: "1fr 1fr" }}>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>DATE</span>
            <input type="date" name="date" required className="inp" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>HOUR (0–23)</span>
            <input type="number" name="hour" min={0} max={23} required className="inp" placeholder="14" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>REVENUE ($)</span>
            <input type="number" name="revenue" min={0} step="0.01" required className="inp" placeholder="0.00" />
          </label>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>TRANSACTIONS</span>
            <input type="number" name="transactions" min={0} defaultValue={0} className="inp" />
          </label>

          {error ? <p className="alert-error" style={{ gridColumn: "span 2" }}>{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
            style={{ gridColumn: "span 2", width: "100%", padding: "0.875rem" }}>
            {isPending ? "Saving…" : "Save Sales Entry"}
          </button>
        </form>
      </article>
    </div>
  );
}

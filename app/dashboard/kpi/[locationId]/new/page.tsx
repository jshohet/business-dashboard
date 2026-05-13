"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { format, previousSunday, isSunday } from "date-fns";
import { DriftAnalysisCard } from "@/app/dashboard/components/DriftAnalysisCard";
import type { DriftAnalysisOutput } from "@/lib/prompts/drift-analysis";
import Link from "next/link";

const DEFAULT_METRICS = [
  {
    key: "labor_cost_pct",
    label: "Labor cost % of sales",
    unit: "%",
    placeholder: "28.5",
    tooltip: "Total labor dollars ÷ total sales revenue × 100. Find this in your P&L or labor management system.",
  },
  {
    key: "waste_pct",
    label: "Food/product waste % of sales",
    unit: "%",
    placeholder: "4.1",
    tooltip: "Total waste value ÷ total sales revenue × 100. Pull from your waste log or inventory system.",
  },
  {
    key: "speed_of_service_avg",
    label: "Speed of service (avg seconds)",
    unit: "sec",
    placeholder: "142",
    tooltip: "Average transaction time in seconds from order to handoff. Check your POS or timer system.",
  },
  {
    key: "customer_satisfaction",
    label: "Customer satisfaction score",
    unit: "/10",
    placeholder: "8.4",
    tooltip: "Your CSAT or NPS score for the week. Use whatever scale your system provides — just be consistent.",
  },
  {
    key: "revenue_vs_target_pct",
    label: "Revenue vs target",
    unit: "%",
    placeholder: "+3.2",
    tooltip: "Actual revenue as % above or below your weekly target. Positive = above target.",
  },
  {
    key: "controllable_profit_pct",
    label: "Controllable profit margin %",
    unit: "%",
    placeholder: "18.0",
    tooltip: "Revenue minus controllable costs (labor, waste, supplies) ÷ revenue × 100.",
  },
];

function getMostRecentSunday(): string {
  const today = new Date();
  const sunday = isSunday(today) ? today : previousSunday(today);
  return format(sunday, "yyyy-MM-dd");
}

interface CustomMetric { label: string; value: string; }

export default function NewKpiEntryPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = use(params);
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [weekEnding, setWeekEnding] = useState(getMostRecentSunday);
  const [notes, setNotes] = useState("");
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftAnalysisOutput | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function addCustomMetric() {
    if (customMetrics.length >= 3) return;
    setCustomMetrics((prev) => [...prev, { label: "", value: "" }]);
  }

  function updateCustomMetric(index: number, field: "label" | "value", val: string) {
    setCustomMetrics((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)));
  }

  function removeCustomMetric(index: number) {
    setCustomMetrics((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const metrics: Record<string, number> = {};
    for (const metric of DEFAULT_METRICS) {
      const raw = values[metric.key];
      if (raw !== undefined && raw !== "") {
        const num = parseFloat(raw);
        if (isNaN(num)) { setError(`"${metric.label}" must be a number`); return; }
        metrics[metric.key] = num;
      }
    }
    for (const cm of customMetrics) {
      if (!cm.label.trim()) continue;
      const num = parseFloat(cm.value);
      if (isNaN(num)) { setError(`Custom metric "${cm.label}" must be a number`); return; }
      metrics[cm.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")] = num;
    }
    if (Object.keys(metrics).length === 0) { setError("Enter at least one metric"); return; }

    setIsPending(true);
    const res = await fetch("/api/kpi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, weekEnding, metrics, notes: notes || undefined }),
    });

    const data = await res.json();
    setIsPending(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }

    setSavedEntryId(data.entry.id);

    if (data.driftAnalysis) {
      setDriftResult(data.driftAnalysis);
    } else {
      router.push(`/dashboard/locations/${locationId}`);
    }
  }

  // Show drift analysis result after save
  if (driftResult) {
    return (
      <div className="anim-fade-up" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
            KPIs saved ✓
          </p>
          <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
            Here&apos;s your analysis
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
            Week ending {format(new Date(weekEnding), "MMMM d, yyyy")}
          </p>
        </div>

        <DriftAnalysisCard analysis={driftResult} />

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Link
            href={`/dashboard/kpi/${locationId}/history`}
            className="btn-ghost"
            style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>
            View history
          </Link>
          <Link
            href={`/dashboard/locations/${locationId}`}
            className="btn-primary"
            style={{ flex: 2, textDecoration: "none", textAlign: "center" }}>
            Back to location →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade-up" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          KPI Entry
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          This week&apos;s numbers
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          Leave any metric blank if you don&apos;t track it yet.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Week ending */}
        <div className="card-static" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-1)" }}>Week ending</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "0.15rem" }}>Should be a Sunday</p>
            </div>
            <input
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              className="inp"
              style={{ width: "auto", maxWidth: 180 }}
            />
          </label>
        </div>

        {/* Default metrics */}
        <div className="card-static" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1.25rem" }}>
            Core metrics
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {DEFAULT_METRICS.map((metric) => (
              <div key={metric.key} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center" }}>
                <div>
                  <label htmlFor={metric.key} style={{ display: "block", fontSize: "0.85rem", color: "var(--text-1)", marginBottom: "0.2rem", fontWeight: 500 }}>
                    {metric.label}
                  </label>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{metric.tooltip}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <input
                    id={metric.key}
                    type="number"
                    step="any"
                    value={values[metric.key] ?? ""}
                    onChange={(e) => setValue(metric.key, e.target.value)}
                    className="inp"
                    placeholder={metric.placeholder}
                    style={{ width: 100, textAlign: "right" }}
                  />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-3)", width: 32 }}>{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom metrics */}
        <div className="card-static" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
              Custom metrics
            </p>
            {customMetrics.length < 3 && (
              <button type="button" onClick={addCustomMetric} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>
                + Add field
              </button>
            )}
          </div>
          {customMetrics.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
              Up to 3 freeform metrics — anything you track that isn&apos;t in the list above.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {customMetrics.map((cm, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.5rem", alignItems: "center" }}>
                  <input type="text" value={cm.label} onChange={(e) => updateCustomMetric(i, "label", e.target.value)} className="inp" placeholder="Metric name" />
                  <input type="number" step="any" value={cm.value} onChange={(e) => updateCustomMetric(i, "value", e.target.value)} className="inp" placeholder="0.0" style={{ width: 100, textAlign: "right" }} />
                  <button type="button" onClick={() => removeCustomMetric(i)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card-static" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <label>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
              Notes (optional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="inp"
              rows={3}
              placeholder="Anything unusual this week — staffing issues, events, weather, equipment…"
              style={{ resize: "vertical" }}
            />
          </label>
        </div>

        {error && <p className="alert-error" style={{ marginBottom: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="btn-ghost" onClick={() => router.back()} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 2 }}>
            {isPending ? "Saving & analyzing…" : "Save KPIs →"}
          </button>
        </div>
      </form>
    </div>
  );
}

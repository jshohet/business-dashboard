import type { DriftAnalysisOutput, DriftStatus } from "@/lib/prompts/drift-analysis";

const STATUS_CONFIG: Record<DriftStatus, { label: string; color: string; bg: string; border: string }> = {
  on_track:        { label: "On track",       color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)" },
  needs_attention: { label: "Needs attention", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)" },
  critical:        { label: "Critical",        color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.25)" },
};

const URGENCY_COLOR: Record<string, string> = {
  high:   "#f43f5e",
  medium: "#f59e0b",
  low:    "#9295a0",
};

const METRIC_LABELS: Record<string, string> = {
  labor_cost_pct:          "Labor cost %",
  waste_pct:               "Waste %",
  speed_of_service_avg:    "Speed of service",
  customer_satisfaction:   "CSAT",
  revenue_vs_target_pct:   "Revenue vs target",
  controllable_profit_pct: "Controllable profit %",
};

interface Props {
  analysis: DriftAnalysisOutput;
}

export function DriftAnalysisCard({ analysis }: Props) {
  const status = STATUS_CONFIG[analysis.overall_status] ?? STATUS_CONFIG.needs_attention;

  return (
    <div
      style={{
        background: status.bg,
        border: `1px solid ${status.border}`,
        borderRadius: "var(--radius-card)",
        padding: "1.5rem",
      }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: status.color,
            background: `${status.color}18`,
            border: `1px solid ${status.border}`,
            padding: "0.2rem 0.6rem",
            borderRadius: 99,
          }}>
          {status.label}
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>AI drift analysis</span>
      </div>

      <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-1)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
        {analysis.summary}
      </p>

      {/* Flagged metrics */}
      {analysis.flagged_metrics.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
            What moved
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {analysis.flagged_metrics.map((fm, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: 10,
                  padding: "0.875rem 1rem",
                  borderLeft: `3px solid ${URGENCY_COLOR[fm.urgency] ?? "var(--border)"}`,
                }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-1)" }}>
                    {METRIC_LABELS[fm.metric] ?? fm.metric}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {fm.four_week_avg !== null && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        avg {fm.four_week_avg.toFixed(1)} → now {fm.current.toFixed(1)}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: URGENCY_COLOR[fm.urgency],
                      }}>
                      {fm.urgency}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.55 }}>
                  {fm.diagnosis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {analysis.what_to_do_this_week.length > 0 && (
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
            This week
          </p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {analysis.what_to_do_this_week.map((action, i) => (
              <li key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--amber)",
                    marginTop: 2,
                  }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.55 }}>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

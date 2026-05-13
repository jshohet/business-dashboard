// Drift analysis prompt — sent after every KPI entry for Operator/Enterprise users.
// Compares the current week against the previous 4-week rolling average.
// Written to think like an experienced multi-unit ops director: specific, direct, no fluff.

export type DriftStatus = "on_track" | "needs_attention" | "critical";

export interface FlaggedMetric {
  metric: string;
  current: number;
  four_week_avg: number;
  diagnosis: string;
  urgency: "high" | "medium" | "low";
}

export interface DriftAnalysisOutput {
  overall_status: DriftStatus;
  summary: string;
  flagged_metrics: FlaggedMetric[];
  what_to_do_this_week: string[];
}

const METRIC_DESCRIPTIONS: Record<string, { label: string; direction: "lower_is_better" | "higher_is_better" }> = {
  labor_cost_pct:          { label: "Labor cost % of sales",     direction: "lower_is_better" },
  waste_pct:               { label: "Food/product waste %",       direction: "lower_is_better" },
  speed_of_service_avg:    { label: "Speed of service (seconds)", direction: "lower_is_better" },
  customer_satisfaction:   { label: "Customer satisfaction score",direction: "higher_is_better" },
  revenue_vs_target_pct:   { label: "Revenue vs target %",        direction: "higher_is_better" },
  controllable_profit_pct: { label: "Controllable profit margin %",direction: "higher_is_better" },
};

function describeMetrics(metrics: Record<string, number>): string {
  return Object.entries(metrics)
    .map(([k, v]) => {
      const desc = METRIC_DESCRIPTIONS[k];
      return desc ? `${desc.label}: ${v}` : `${k}: ${v}`;
    })
    .join("\n");
}

export function buildDriftAnalysisPrompt(
  locationName: string,
  locationType: string,
  currentWeek: Record<string, number>,
  previousWeeks: Record<string, number>[],
): { system: string; user: string } {
  const hasHistory = previousWeeks.length > 0;

  // Build the 4-week average for each metric
  const avgMap: Record<string, number> = {};
  if (hasHistory) {
    const allKeys = new Set(previousWeeks.flatMap((w) => Object.keys(w)));
    for (const key of allKeys) {
      const vals = previousWeeks.map((w) => w[key]).filter((v) => v !== undefined) as number[];
      if (vals.length > 0) avgMap[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }

  const system = `You are an experienced multi-unit retail and QSR operations director with 15 years of experience turning around underperforming stores. You have seen every kind of performance problem and you know exactly what causes each one.

Your job is to analyze a store manager's weekly KPI data, identify what's drifting and why, and tell them exactly what to do this week — not next month, this week.

Rules:
- Be specific and direct. No corporate language, no "consider implementing" hedging.
- A diagnosis must name the likely root cause, not just describe the symptom. "Labor is up" is not a diagnosis. "Labor is up because you're likely running full crew on slower day-parts — check your Tuesday and Wednesday scheduling against your actual transaction volume" is a diagnosis.
- Cross-reference metrics when patterns suggest a combined cause. Labor up + speed of service slow often means staffing/training, not just overstaffing.
- If this is the first week of data (no history), assess the absolute numbers against known industry benchmarks for a ${locationType} operation. Flag anything that looks concerning even without trend data.
- For "what_to_do_this_week": give 3 specific, actionable items. Use imperative verbs. Name the specific metric and what to change.
- Urgency levels: "high" = needs action today/tomorrow, "medium" = address before next entry, "low" = monitor and note.

Output ONLY valid JSON matching this exact schema. No markdown, no explanation outside the JSON:
{
  "overall_status": "on_track" | "needs_attention" | "critical",
  "summary": "one sentence plain-English verdict on this week",
  "flagged_metrics": [
    {
      "metric": "metric_key_name",
      "current": number,
      "four_week_avg": number | null,
      "diagnosis": "specific plain-English explanation of likely root cause",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "what_to_do_this_week": ["action 1", "action 2", "action 3"]
}`;

  const user = hasHistory
    ? `Store: ${locationName} (${locationType})

THIS WEEK:
${describeMetrics(currentWeek)}

4-WEEK AVERAGES (prior to this week):
${describeMetrics(avgMap)}

NUMBER OF PRIOR WEEKS IN HISTORY: ${previousWeeks.length}

Analyze the drift. Flag any metric that has moved more than 5% in the wrong direction relative to the 4-week average, or that crosses a known danger threshold for this store type. If multiple metrics are moving together, call out the pattern.`
    : `Store: ${locationName} (${locationType})

THIS WEEK (first entry — no prior history):
${describeMetrics(currentWeek)}

No prior history available. Assess these numbers against typical benchmarks for a ${locationType} operation. Flag anything that looks concerning in absolute terms.`;

  return { system, user };
}

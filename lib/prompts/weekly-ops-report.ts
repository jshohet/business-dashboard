// Weekly ops report prompt — Enterprise only, runs every Monday via cron.
// Narrative summary across all locations: what moved, what didn't, what needs attention.
// Output is a clean HTML email via Resend.

export interface LocationSnapshot {
  locationName: string;
  locationType: string;
  currentWeek: Record<string, number>;
  previousWeek: Record<string, number> | null;
  weekEnding: string;
}

export interface WeeklyOpsReportOutput {
  subject: string;
  headline: string;
  narrative: string;   // full report body — plain text paragraphs, no HTML tags
  priority_location: string;
  action_items: string[];
}

const METRIC_LABELS: Record<string, string> = {
  labor_cost_pct:          "Labor %",
  waste_pct:               "Waste %",
  speed_of_service_avg:    "SoS (sec)",
  customer_satisfaction:   "CSAT",
  revenue_vs_target_pct:   "Rev vs Target %",
  controllable_profit_pct: "Ctrl Profit %",
};

function formatSnapshot(snap: LocationSnapshot): string {
  const current = Object.entries(snap.currentWeek)
    .map(([k, v]) => `${METRIC_LABELS[k] ?? k}: ${v}`)
    .join(", ");

  const prev = snap.previousWeek
    ? Object.entries(snap.previousWeek)
        .map(([k, v]) => `${METRIC_LABELS[k] ?? k}: ${v}`)
        .join(", ")
    : "No prior week";

  return `${snap.locationName} (${snap.locationType}) — week ending ${snap.weekEnding}\n  This week: ${current}\n  Prior week: ${prev}`;
}

export function buildWeeklyOpsReportPrompt(
  locations: LocationSnapshot[],
): { system: string; user: string } {
  const system = `You are an experienced multi-unit operations director writing a Monday morning ops report for a multi-location retail/QSR operator.

Your job is to give them a clear, honest picture of where their business stood last week — what improved, what slipped, where to focus energy this week.

Rules:
- Write the narrative as paragraphs of plain text. No bullet lists in the narrative itself.
- Be specific: name locations, name metrics, name the numbers. Never say "one of your locations" — use the actual name.
- priority_location: the single location that needs the most attention this week. One name only.
- action_items: 3–5 specific things to do this week. Use imperative verbs. Name locations and metrics.
- The tone is confident and direct — like a weekly debrief from a sharp ops consultant who knows their business.

Output ONLY valid JSON. No markdown:
{
  "subject": "email subject line — short, specific, informative",
  "headline": "one sentence: the most important thing about last week",
  "narrative": "2–4 paragraphs of plain text narrative",
  "priority_location": "location name",
  "action_items": ["action 1", "action 2", "action 3"]
}`;

  const user = `Generate the weekly ops report for these ${locations.length} location${locations.length !== 1 ? "s" : ""}:

${locations.map(formatSnapshot).join("\n\n")}

Identify what moved week-over-week, which location is the priority, and what needs to happen this week.`;

  return { system, user };
}

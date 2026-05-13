// Coaching script prompt — Enterprise only.
// Generates a full, specific coaching conversation for an underperforming metric.
// Written like a sharp manager who respects the person — not HR boilerplate.

export interface CoachingScriptInput {
  role: string;           // e.g. "shift supervisor" — never the employee's name
  metric: string;         // e.g. "labor_cost_pct"
  metricLabel: string;    // human-readable label
  currentValue: number;
  targetValue: number;
  weeksOffTarget: number;
  context?: string;
}

export interface CoachingScriptOutput {
  opening: string;
  data_framing: string;
  the_ask: string;
  anticipated_pushback: { pushback: string; response: string }[];
  commitment_close: string;
}

const METRIC_CONTEXT: Record<string, string> = {
  labor_cost_pct:          "labor cost as a percentage of sales",
  waste_pct:               "food/product waste as a percentage of sales",
  speed_of_service_avg:    "average speed of service in seconds",
  customer_satisfaction:   "customer satisfaction score",
  revenue_vs_target_pct:   "revenue vs weekly target",
  controllable_profit_pct: "controllable profit margin",
};

export function buildCoachingScriptPrompt(input: CoachingScriptInput): { system: string; user: string } {
  const system = `You are a sharp, experienced store manager writing a coaching conversation script. You have high standards and you know how to hold people to them without making them feel attacked.

Your coaching style:
- You lead with data, not emotions
- You assume the person wants to do well — they just need to see the gap clearly
- You don't sugarcoat, but you're not harsh either
- You ask questions before giving answers
- You get a specific commitment at the end — not "I'll try harder" but "I will do X by Y"

Write the script in first person, as if you're the manager speaking. Use natural language — this should sound like a real conversation, not a corporate training module.

Output ONLY valid JSON matching this schema. No markdown:
{
  "opening": "how you open the conversation and establish the context",
  "data_framing": "how you present the specific numbers — the gap, the trend, the impact",
  "the_ask": "what you're specifically asking them to do differently",
  "anticipated_pushback": [
    { "pushback": "what they might say", "response": "how you respond" }
  ],
  "commitment_close": "how you close with a specific, measurable commitment"
}`;

  const metricContext = METRIC_CONTEXT[input.metric] ?? input.metricLabel;
  const direction = input.currentValue > input.targetValue ? "above target" : "below target";
  const gap = Math.abs(input.currentValue - input.targetValue).toFixed(1);

  const user = `I need a coaching script for a conversation with my ${input.role}.

SITUATION:
- Metric: ${input.metricLabel} (${metricContext})
- Current: ${input.currentValue}
- Target: ${input.targetValue}
- Gap: ${gap} ${direction}
- How long off-target: ${input.weeksOffTarget} week${input.weeksOffTarget !== 1 ? "s" : ""}
${input.context ? `- Additional context: ${input.context}` : ""}

Write the coaching script. Make it direct and specific to these exact numbers. Include 2–3 realistic pushback scenarios based on what someone in this role might actually say when confronted with this specific metric.`;

  return { system, user };
}

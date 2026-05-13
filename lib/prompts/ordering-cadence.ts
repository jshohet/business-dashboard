// Ordering cadence prompt — generates per-product ordering recommendations
// based on the last 8 weeks of KPI/waste data and the manager's product list.
// Driven by real sell-through patterns, not gut feel.

export interface OrderingRecommendation {
  product: string;
  current_issue: string;
  recommended_action: string;
  reasoning: string;
}

export interface OrderingCadenceOutput {
  recommendations: OrderingRecommendation[];
  ordering_principles: string[];
}

export function buildOrderingCadencePrompt(
  locationName: string,
  locationType: string,
  products: string[],
  wasteHistory: { weekEnding: string; waste_pct?: number; notes?: string }[],
): { system: string; user: string } {
  const system = `You are an experienced retail and QSR operations director who has driven waste reduction in dozens of stores through precise ordering discipline.

Your job is to analyze a store's product list and waste history, then give specific, actionable ordering recommendations for each product.

Rules:
- Be specific. "Reduce your Tuesday whole milk order by 15–20%" is good. "Consider ordering less" is not.
- Reference patterns in the waste data when they exist. If waste % is consistently high on certain weeks, say so.
- If the waste history is thin (fewer than 4 weeks), say so and give conservative recommendations.
- ordering_principles: 3–5 high-level rules that apply to this specific store type and what you see in their data.
- Every recommendation must have a concrete recommended_action with a specific change (qty, day, frequency).

Output ONLY valid JSON matching this schema. No markdown:
{
  "recommendations": [
    {
      "product": "product name",
      "current_issue": "what problem you're solving",
      "recommended_action": "specific change to make",
      "reasoning": "why, based on their data"
    }
  ],
  "ordering_principles": ["principle 1", "principle 2", "principle 3"]
}`;

  const wasteContext = wasteHistory.length > 0
    ? `WASTE HISTORY (${wasteHistory.length} weeks):\n` +
      wasteHistory.map((w) =>
        `Week of ${w.weekEnding}: waste ${w.waste_pct !== undefined ? w.waste_pct + "%" : "not recorded"}${w.notes ? ` — Notes: ${w.notes}` : ""}`,
      ).join("\n")
    : "WASTE HISTORY: No data yet.";

  const user = `Store: ${locationName} (${locationType})

PRODUCTS TO ANALYZE:
${products.map((p, i) => `${i + 1}. ${p}`).join("\n")}

${wasteContext}

Generate ordering recommendations for each product. Use the waste trend to identify which products are being over-ordered and on which days/frequencies. Where data is thin, flag it and give a conservative starting recommendation.`;

  return { system, user };
}

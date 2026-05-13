export type Plan = "starter" | "operator" | "enterprise";

export interface PlanFeatures {
  maxLocations: number;
  aiDriftAnalysis: boolean;
  aiOrdering: boolean;
  aiCoachingScripts: boolean;
  aiWeeklyOpsReport: boolean;
  multiLocationView: boolean;
  slackAlerts: boolean;
  csvIntegrations: boolean;
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  starter: {
    maxLocations: 1,
    aiDriftAnalysis: false,
    aiOrdering: false,
    aiCoachingScripts: false,
    aiWeeklyOpsReport: false,
    multiLocationView: false,
    slackAlerts: false,
    csvIntegrations: false,
  },
  operator: {
    maxLocations: 5,
    aiDriftAnalysis: true,
    aiOrdering: true,
    aiCoachingScripts: false,
    aiWeeklyOpsReport: false,
    multiLocationView: true,
    slackAlerts: true,
    csvIntegrations: false,
  },
  enterprise: {
    maxLocations: 50,
    aiDriftAnalysis: true,
    aiOrdering: true,
    aiCoachingScripts: true,
    aiWeeklyOpsReport: true,
    multiLocationView: true,
    slackAlerts: true,
    csvIntegrations: true,
  },
};

export function getPlanFeatures(plan: string): PlanFeatures {
  const normalized = plan.toLowerCase() as Plan;
  return PLAN_FEATURES[normalized] ?? PLAN_FEATURES.starter;
}

export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    starter: "Starter",
    operator: "Operator",
    enterprise: "Enterprise",
  };
  return labels[plan.toLowerCase()] ?? "Starter";
}

// Structured paywall response — returned by AI routes when plan gate fails.
// The frontend receives this and renders <UpgradePrompt /> instead of an error.
export function paywallResponse(requiredPlan: Plan) {
  return Response.json(
    {
      error: "upgrade_required",
      required_plan: requiredPlan,
      upgrade_url: "/dashboard/settings/billing",
    },
    { status: 403 }
  );
}

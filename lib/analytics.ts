import { startOfWeek, subDays } from "date-fns";

type SalesPoint = {
  date: Date;
  hour: number;
  revenue: number;
  transactions: number;
};

export type RevenuePoint = {
  label: string;
  revenue: number;
};

export type HourlyPoint = {
  hour: number;
  revenue: number;
  averageRevenue: number;
};

export type TrendSummary = {
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  percentChange: number;
  direction: "up" | "down" | "flat";
};

export type AnalyticsResult = {
  dailyRevenue: RevenuePoint[];
  weeklyRevenue: RevenuePoint[];
  hourlyRevenue: HourlyPoint[];
  peakHours: HourlyPoint[];
  trend: TrendSummary;
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekKey(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return start.toISOString().slice(0, 10);
}

export function buildAnalytics(entries: SalesPoint[]): AnalyticsResult {
  const dailyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const hourlyTotals = new Map<number, { revenue: number; count: number }>();

  for (let hour = 0; hour < 24; hour += 1) {
    hourlyTotals.set(hour, { revenue: 0, count: 0 });
  }

  for (const entry of entries) {
    const dKey = dayKey(entry.date);
    const wKey = weekKey(entry.date);

    dailyMap.set(dKey, (dailyMap.get(dKey) ?? 0) + entry.revenue);
    weeklyMap.set(wKey, (weeklyMap.get(wKey) ?? 0) + entry.revenue);

    const hourly = hourlyTotals.get(entry.hour) ?? { revenue: 0, count: 0 };
    hourly.revenue += entry.revenue;
    hourly.count += 1;
    hourlyTotals.set(entry.hour, hourly);
  }

  const dailyRevenue = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, revenue]) => ({
      label,
      revenue: Number(revenue.toFixed(2)),
    }));

  const weeklyRevenue = [...weeklyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, revenue]) => ({
      label,
      revenue: Number(revenue.toFixed(2)),
    }));

  const hourlyRevenue = [...hourlyTotals.entries()].map(([hour, totals]) => ({
    hour,
    revenue: Number(totals.revenue.toFixed(2)),
    averageRevenue: Number(
      (totals.count > 0 ? totals.revenue / totals.count : 0).toFixed(2),
    ),
  }));

  const peakHours = [...hourlyRevenue]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)
    .sort((a, b) => a.hour - b.hour);

  const today = new Date();
  const currentWindowStart = dayKey(subDays(today, 6));
  const previousWindowStart = dayKey(subDays(today, 13));

  const currentPeriodRevenue = dailyRevenue
    .filter((row) => row.label >= currentWindowStart)
    .reduce((sum, row) => sum + row.revenue, 0);

  const previousPeriodRevenue = dailyRevenue
    .filter(
      (row) =>
        row.label >= previousWindowStart && row.label < currentWindowStart,
    )
    .reduce((sum, row) => sum + row.revenue, 0);

  const percentChange =
    previousPeriodRevenue === 0
      ? currentPeriodRevenue > 0
        ? 100
        : 0
      : ((currentPeriodRevenue - previousPeriodRevenue) /
          previousPeriodRevenue) *
        100;

  const direction: TrendSummary["direction"] =
    Math.abs(percentChange) < 0.01 ? "flat" : percentChange > 0 ? "up" : "down";

  return {
    dailyRevenue,
    weeklyRevenue,
    hourlyRevenue,
    peakHours,
    trend: {
      currentPeriodRevenue: Number(currentPeriodRevenue.toFixed(2)),
      previousPeriodRevenue: Number(previousPeriodRevenue.toFixed(2)),
      percentChange: Number(percentChange.toFixed(2)),
      direction,
    },
  };
}

import { addDays, format, getDay, startOfDay } from "date-fns";

type InventoryPoint = {
  product: string;
  date: Date;
  orderedQty: number;
  soldQty: number;
  wasteQty: number;
};

type LaborPoint = {
  date: Date;
  laborCost: number;
};

type SalesPoint = {
  date: Date;
  revenue: number;
};

export type ForecastRow = {
  date: string;
  weekday: string;
  product: string;
  predictedDemand: number;
  recommendedOrderQty: number;
};

export type WasteSummary = {
  overallWasteRate: number;
  byProduct: Array<{
    product: string;
    soldQty: number;
    wasteQty: number;
    wasteRate: number;
  }>;
};

export type LaborRevenueRow = {
  date: string;
  revenue: number;
  laborCost: number;
  laborToRevenuePct: number;
};

export type EfficiencyInsights = {
  waste: WasteSummary;
  laborVsRevenue: LaborRevenueRow[];
  alerts: string[];
};

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function weekday(day: number): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[day] ?? "Day";
}

export function buildInventoryForecast(
  inventoryRows: InventoryPoint[],
  horizonDays: number,
  fromDateInput?: Date,
): ForecastRow[] {
  if (inventoryRows.length === 0) {
    return [];
  }

  const fromDate = startOfDay(fromDateInput ?? new Date());
  const byProduct = new Map<string, InventoryPoint[]>();

  for (const row of inventoryRows) {
    const list = byProduct.get(row.product) ?? [];
    list.push(row);
    byProduct.set(row.product, list);
  }

  const rows: ForecastRow[] = [];

  for (const [product, series] of byProduct.entries()) {
    const overallAvgSold =
      series.length > 0
        ? series.reduce((sum, row) => sum + row.soldQty, 0) / series.length
        : 0;
    const wasteRateOverall =
      series.reduce((sum, row) => sum + row.wasteQty, 0) /
      Math.max(
        1,
        series.reduce((sum, row) => sum + row.soldQty + row.wasteQty, 0),
      );

    for (let offset = 0; offset < horizonDays; offset += 1) {
      const targetDate = addDays(fromDate, offset);
      const dayIndex = getDay(targetDate);

      const sameDaySeries = series.filter(
        (point) => getDay(point.date) === dayIndex,
      );
      const dayAvg =
        sameDaySeries.length > 0
          ? sameDaySeries.reduce((sum, point) => sum + point.soldQty, 0) /
            sameDaySeries.length
          : overallAvgSold;

      const predictedDemand = 0.7 * dayAvg + 0.3 * overallAvgSold;
      const buffer = wasteRateOverall > 0.15 ? 1.03 : 1.12;
      const recommendedOrderQty = Math.max(
        0,
        Math.ceil(predictedDemand * buffer),
      );

      rows.push({
        date: dateKey(targetDate),
        weekday: weekday(dayIndex),
        product,
        predictedDemand: Number(predictedDemand.toFixed(2)),
        recommendedOrderQty,
      });
    }
  }

  return rows.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.product.localeCompare(b.product);
  });
}

export function buildEfficiencyInsights(
  inventoryRows: InventoryPoint[],
  laborRows: LaborPoint[],
  salesRows: SalesPoint[],
): EfficiencyInsights {
  const soldTotal = inventoryRows.reduce((sum, row) => sum + row.soldQty, 0);
  const wasteTotal = inventoryRows.reduce((sum, row) => sum + row.wasteQty, 0);
  const overallWasteRate =
    soldTotal + wasteTotal === 0
      ? 0
      : (wasteTotal / (soldTotal + wasteTotal)) * 100;

  const productMap = new Map<string, { sold: number; waste: number }>();
  for (const row of inventoryRows) {
    const curr = productMap.get(row.product) ?? { sold: 0, waste: 0 };
    curr.sold += row.soldQty;
    curr.waste += row.wasteQty;
    productMap.set(row.product, curr);
  }

  const byProduct = [...productMap.entries()]
    .map(([product, val]) => ({
      product,
      soldQty: val.sold,
      wasteQty: val.waste,
      wasteRate:
        val.sold + val.waste === 0
          ? 0
          : (val.waste / (val.sold + val.waste)) * 100,
    }))
    .sort((a, b) => b.wasteRate - a.wasteRate);

  const salesByDate = new Map<string, number>();
  for (const row of salesRows) {
    const key = dateKey(row.date);
    salesByDate.set(key, (salesByDate.get(key) ?? 0) + row.revenue);
  }

  const laborByDate = new Map<string, number>();
  for (const row of laborRows) {
    const key = dateKey(row.date);
    laborByDate.set(key, (laborByDate.get(key) ?? 0) + row.laborCost);
  }

  const allDates = [
    ...new Set([...salesByDate.keys(), ...laborByDate.keys()]),
  ].sort();
  const laborVsRevenue: LaborRevenueRow[] = allDates.map((date) => {
    const revenue = salesByDate.get(date) ?? 0;
    const laborCost = laborByDate.get(date) ?? 0;
    const laborToRevenuePct =
      revenue > 0 ? (laborCost / revenue) * 100 : laborCost > 0 ? 100 : 0;
    return {
      date,
      revenue: Number(revenue.toFixed(2)),
      laborCost: Number(laborCost.toFixed(2)),
      laborToRevenuePct: Number(laborToRevenuePct.toFixed(2)),
    };
  });

  const alerts: string[] = [];
  const highLaborDays = laborVsRevenue.filter(
    (row) => row.revenue > 0 && row.laborToRevenuePct > 35,
  );
  const groupedByWeekday = new Map<number, number[]>();

  for (const row of highLaborDays) {
    const day = getDay(new Date(`${row.date}T00:00:00`));
    const list = groupedByWeekday.get(day) ?? [];
    list.push(row.laborToRevenuePct);
    groupedByWeekday.set(day, list);
  }

  for (const [day, values] of groupedByWeekday.entries()) {
    if (values.length >= 2) {
      const avg = values.reduce((sum, item) => sum + item, 0) / values.length;
      alerts.push(
        `You are likely overstaffed on ${weekday(day)} (labor/revenue avg ${avg.toFixed(1)}%).`,
      );
    }
  }

  const topWaste = byProduct[0];
  if (topWaste && topWaste.wasteRate > 10) {
    alerts.push(
      `${topWaste.product} waste exceeds target at ${topWaste.wasteRate.toFixed(1)}%.`,
    );
  }

  if (overallWasteRate > 8) {
    alerts.push(
      `Overall waste is ${overallWasteRate.toFixed(1)}%, above the 8% benchmark.`,
    );
  }

  if (alerts.length === 0) {
    alerts.push("No critical efficiency alerts detected this period.");
  }

  return {
    waste: {
      overallWasteRate: Number(overallWasteRate.toFixed(2)),
      byProduct,
    },
    laborVsRevenue,
    alerts,
  };
}

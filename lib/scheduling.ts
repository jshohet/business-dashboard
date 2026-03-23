import { addDays, format, getDay } from "date-fns";

type Employee = {
  id: string;
  name: string;
  role: string;
};

type Availability = {
  employeeId: string;
  date: Date;
  startHour: number;
  endHour: number;
};

type SalesEntry = {
  date: Date;
  hour: number;
  revenue: number;
};

export type HourDemand = {
  date: string;
  weekday: string;
  hour: number;
  projectedRevenue: number;
  requiredStaff: number;
  assignedStaff: number;
};

export type ShiftSuggestion = {
  employeeId: string;
  employeeName: string;
  role: string;
  date: string;
  startHour: number;
  endHour: number;
  hours: number;
};

export type CoverageGap = {
  date: string;
  weekday: string;
  hour: number;
  missingStaff: number;
};

export type ScheduleSummary = {
  totalRequiredHours: number;
  totalAssignedHours: number;
  fillRate: number;
  uncoveredSlots: number;
};

export type SchedulingResult = {
  hourDemand: HourDemand[];
  suggestedShifts: ShiftSuggestion[];
  coverageGaps: CoverageGap[];
  summary: ScheduleSummary;
  planningWindow: {
    startDate: string;
    endDate: string;
  };
};

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function weekdayName(dayIndex: number): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[dayIndex] ?? "Day";
}

function staffNeededFromRevenue(revenue: number): number {
  if (revenue >= 2000) return 4;
  if (revenue >= 1200) return 3;
  if (revenue >= 600) return 2;
  return 1;
}

function buildDemandProfile(sales: SalesEntry[]) {
  const byDayHour = new Map<string, { total: number; count: number }>();
  const byHour = new Map<number, { total: number; count: number }>();

  for (let hour = 0; hour < 24; hour += 1) {
    byHour.set(hour, { total: 0, count: 0 });
  }

  for (const row of sales) {
    const day = getDay(row.date);
    const key = `${day}-${row.hour}`;
    const current = byDayHour.get(key) ?? { total: 0, count: 0 };
    current.total += row.revenue;
    current.count += 1;
    byDayHour.set(key, current);

    const byHourCurrent = byHour.get(row.hour) ?? { total: 0, count: 0 };
    byHourCurrent.total += row.revenue;
    byHourCurrent.count += 1;
    byHour.set(row.hour, byHourCurrent);
  }

  const minHour = sales.length > 0 ? Math.min(...sales.map((s) => s.hour)) : 8;
  const maxHour = sales.length > 0 ? Math.max(...sales.map((s) => s.hour)) : 20;
  const startHour = Math.max(6, minHour - 1);
  const endHour = Math.min(24, maxHour + 2);

  return { byDayHour, byHour, startHour, endHour };
}

export function generateWeeklySchedule(
  employees: Employee[],
  availabilityRows: Availability[],
  salesRows: SalesEntry[],
  startDate: Date,
): SchedulingResult {
  const profile = buildDemandProfile(salesRows);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const availabilityMap = new Map<string, Set<string>>();
  for (const row of availabilityRows) {
    const dayKey = dateKey(row.date);
    for (let hour = row.startHour; hour < row.endHour; hour += 1) {
      const key = `${dayKey}:${hour}`;
      const slot = availabilityMap.get(key) ?? new Set<string>();
      slot.add(row.employeeId);
      availabilityMap.set(key, slot);
    }
  }

  const hourDemand: HourDemand[] = [];
  const assignedBySlot = new Map<string, string[]>();
  const hoursByEmployeeDay = new Map<string, number>();
  const hoursByEmployeeWeek = new Map<string, number>();

  for (const employee of employees) {
    hoursByEmployeeWeek.set(employee.id, 0);
  }

  for (const dayDate of weekDates) {
    const dayKey = dateKey(dayDate);
    const weekdayIndex = getDay(dayDate);
    const weekday = weekdayName(weekdayIndex);

    for (let hour = profile.startHour; hour < profile.endHour; hour += 1) {
      const profileKey = `${weekdayIndex}-${hour}`;
      const profilePoint = profile.byDayHour.get(profileKey);
      const hourFallback = profile.byHour.get(hour);
      const projectedRevenue = profilePoint
        ? profilePoint.total
        : (hourFallback?.total ?? 0);

      const requiredStaff = staffNeededFromRevenue(projectedRevenue);
      const slotKey = `${dayKey}:${hour}`;
      const availableIds = [
        ...(availabilityMap.get(slotKey) ?? new Set<string>()),
      ];

      const assigned: string[] = [];
      while (assigned.length < requiredStaff) {
        const candidates = availableIds
          .filter((employeeId) => !assigned.includes(employeeId))
          .filter((employeeId) => {
            const dayHours =
              hoursByEmployeeDay.get(`${dayKey}:${employeeId}`) ?? 0;
            const weekHours = hoursByEmployeeWeek.get(employeeId) ?? 0;
            return dayHours < 8 && weekHours < 40;
          })
          .map((employeeId) => {
            const dayHours =
              hoursByEmployeeDay.get(`${dayKey}:${employeeId}`) ?? 0;
            const weekHours = hoursByEmployeeWeek.get(employeeId) ?? 0;
            const previousAssigned =
              assignedBySlot.get(`${dayKey}:${hour - 1}`) ?? [];
            const continuityBonus = previousAssigned.includes(employeeId)
              ? 4
              : 0;
            const score = continuityBonus - dayHours * 0.6 - weekHours * 0.1;
            return { employeeId, score };
          })
          .sort((a, b) => b.score - a.score);

        const next = candidates[0];
        if (!next) {
          break;
        }

        assigned.push(next.employeeId);
        const dayHoursKey = `${dayKey}:${next.employeeId}`;
        hoursByEmployeeDay.set(
          dayHoursKey,
          (hoursByEmployeeDay.get(dayHoursKey) ?? 0) + 1,
        );
        hoursByEmployeeWeek.set(
          next.employeeId,
          (hoursByEmployeeWeek.get(next.employeeId) ?? 0) + 1,
        );
      }

      assignedBySlot.set(slotKey, assigned);

      hourDemand.push({
        date: dayKey,
        weekday,
        hour,
        projectedRevenue: Number(projectedRevenue.toFixed(2)),
        requiredStaff,
        assignedStaff: assigned.length,
      });
    }
  }

  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const assignedHoursByEmployeeDate = new Map<string, number[]>();

  for (const row of hourDemand) {
    const assigned = assignedBySlot.get(`${row.date}:${row.hour}`) ?? [];
    for (const employeeId of assigned) {
      const key = `${row.date}:${employeeId}`;
      const list = assignedHoursByEmployeeDate.get(key) ?? [];
      list.push(row.hour);
      assignedHoursByEmployeeDate.set(key, list);
    }
  }

  const suggestedShifts: ShiftSuggestion[] = [];
  for (const [key, hours] of assignedHoursByEmployeeDate.entries()) {
    const [shiftDate, employeeId] = key.split(":");
    const employee = employeeMap.get(employeeId);
    if (!employee || hours.length === 0) {
      continue;
    }

    const sortedHours = [...hours].sort((a, b) => a - b);
    let blockStart = sortedHours[0];
    let previous = sortedHours[0];

    for (let i = 1; i <= sortedHours.length; i += 1) {
      const current = sortedHours[i];
      if (current === previous + 1) {
        previous = current;
        continue;
      }

      const endHour = previous + 1;
      suggestedShifts.push({
        employeeId,
        employeeName: employee.name,
        role: employee.role,
        date: shiftDate,
        startHour: blockStart,
        endHour,
        hours: endHour - blockStart,
      });

      blockStart = current;
      previous = current;
    }
  }

  const coverageGaps = hourDemand
    .filter((row) => row.assignedStaff < row.requiredStaff)
    .map((row) => ({
      date: row.date,
      weekday: row.weekday,
      hour: row.hour,
      missingStaff: row.requiredStaff - row.assignedStaff,
    }));

  const totalRequiredHours = hourDemand.reduce(
    (sum, row) => sum + row.requiredStaff,
    0,
  );
  const totalAssignedHours = hourDemand.reduce(
    (sum, row) => sum + row.assignedStaff,
    0,
  );
  const fillRate =
    totalRequiredHours === 0
      ? 100
      : (totalAssignedHours / totalRequiredHours) * 100;

  return {
    hourDemand,
    suggestedShifts: suggestedShifts.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      if (a.employeeName !== b.employeeName)
        return a.employeeName.localeCompare(b.employeeName);
      return a.startHour - b.startHour;
    }),
    coverageGaps,
    summary: {
      totalRequiredHours,
      totalAssignedHours,
      fillRate: Number(fillRate.toFixed(2)),
      uncoveredSlots: coverageGaps.length,
    },
    planningWindow: {
      startDate: dateKey(weekDates[0]),
      endDate: dateKey(weekDates[weekDates.length - 1]),
    },
  };
}

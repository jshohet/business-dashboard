import { subDays, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

function seededRevenue(dayOffset: number, hour: number) {
  const dayWave = 1 + Math.sin(dayOffset / 3) * 0.18;
  const hourWave =
    hour >= 7 && hour <= 9
      ? 1.6
      : hour >= 11 && hour <= 14
        ? 1.8
        : hour >= 16 && hour <= 18
          ? 1.4
          : 0.75;
  return Math.max(25, Math.round(52 * dayWave * hourWave));
}

export async function seedDemoData(storeId: string) {
  const employees = await prisma.$transaction([
    prisma.employee.create({ data: { storeId, name: "Ava Brooks", role: "Shift Lead", hourlyRate: 24.5 } }),
    prisma.employee.create({ data: { storeId, name: "Noah Kim", role: "Barista", hourlyRate: 19.25 } }),
    prisma.employee.create({ data: { storeId, name: "Mia Patel", role: "Cashier", hourlyRate: 18.5 } }),
    prisma.employee.create({ data: { storeId, name: "Liam Chen", role: "Barista", hourlyRate: 19.0 } }),
  ]);

  const salesCreates = [];
  for (let d = 35; d >= 0; d--) {
    const date = subDays(new Date(), d);
    for (let hour = 7; hour <= 20; hour++) {
      const revenue = seededRevenue(d, hour);
      salesCreates.push({ storeId, date, hour, revenue, transactions: Math.max(2, Math.round(revenue / 8)) });
    }
  }

  const products = ["Milk", "Espresso Beans", "Croissant", "Blueberry Muffin"];
  const inventoryCreates = [];
  for (let d = 45; d >= 0; d--) {
    const date = subDays(new Date(), d);
    for (const product of products) {
      const base = product === "Milk" ? 120 : product === "Espresso Beans" ? 45 : 70;
      const soldQty = Math.max(5, base + ((d % 7) - 3) * 2);
      const wasteQty = product === "Milk"
        ? Math.max(3, Math.round(soldQty * 0.12))
        : Math.max(1, Math.round(soldQty * 0.06));
      inventoryCreates.push({ storeId, product, date, orderedQty: soldQty + wasteQty + 4, soldQty, wasteQty });
    }
  }

  const laborCreates = [];
  for (let d = 35; d >= 0; d--) {
    const date = subDays(new Date(), d);
    const weekday = date.getDay();
    laborCreates.push({
      storeId,
      date,
      laborCost: weekday === 2 ? 640 : weekday === 5 || weekday === 6 ? 720 : 570,
      notes: weekday === 2 ? "Potential overstaffing day" : null,
    });
  }

  const availabilityCreates = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    availabilityCreates.push(
      { employeeId: employees[0].id, date, startHour: 7, endHour: 15 },
      { employeeId: employees[1].id, date, startHour: 8, endHour: 16 },
      { employeeId: employees[2].id, date, startHour: 10, endHour: 18 },
      { employeeId: employees[3].id, date, startHour: 12, endHour: 20 },
    );
  }

  await Promise.all([
    prisma.salesEntry.createMany({ data: salesCreates }),
    prisma.inventoryLog.createMany({ data: inventoryCreates }),
    prisma.laborEntry.createMany({ data: laborCreates }),
    prisma.employeeAvailability.createMany({ data: availabilityCreates }),
  ]);
}

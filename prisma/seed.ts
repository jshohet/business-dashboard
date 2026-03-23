import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  const demoEmail = "demo@storepilot.app";
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existing) {
    console.log("Demo data already exists. Skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("DemoPass123!", 10);

  const store = await prisma.store.create({
    data: {
      name: "Downtown Store",
      timezone: "America/New_York",
    },
  });

  await prisma.user.create({
    data: {
      email: demoEmail,
      name: "Demo Owner",
      passwordHash,
      storeId: store.id,
    },
  });

  const employees = await prisma.$transaction([
    prisma.employee.create({
      data: {
        storeId: store.id,
        name: "Ava Brooks",
        role: "Shift Lead",
        hourlyRate: 24.5,
      },
    }),
    prisma.employee.create({
      data: {
        storeId: store.id,
        name: "Noah Kim",
        role: "Barista",
        hourlyRate: 19.25,
      },
    }),
    prisma.employee.create({
      data: {
        storeId: store.id,
        name: "Mia Patel",
        role: "Cashier",
        hourlyRate: 18.5,
      },
    }),
    prisma.employee.create({
      data: {
        storeId: store.id,
        name: "Liam Chen",
        role: "Barista",
        hourlyRate: 19.0,
      },
    }),
  ]);

  const salesCreates = [];
  for (let dayOffset = 35; dayOffset >= 0; dayOffset -= 1) {
    const date = subDays(new Date(), dayOffset);
    for (let hour = 7; hour <= 20; hour += 1) {
      const revenue = seededRevenue(dayOffset, hour);
      const transactions = Math.max(2, Math.round(revenue / 8));
      salesCreates.push(
        prisma.salesEntry.create({
          data: {
            storeId: store.id,
            date,
            hour,
            revenue,
            transactions,
          },
        }),
      );
    }
  }

  const products = ["Milk", "Espresso Beans", "Croissant", "Blueberry Muffin"];
  const inventoryCreates = [];
  for (let dayOffset = 45; dayOffset >= 0; dayOffset -= 1) {
    const date = subDays(new Date(), dayOffset);
    for (const product of products) {
      const base =
        product === "Milk" ? 120 : product === "Espresso Beans" ? 45 : 70;
      const variance = (dayOffset % 7) - 3;
      const soldQty = Math.max(5, base + variance * 2);
      const wasteQty =
        product === "Milk"
          ? Math.max(3, Math.round(soldQty * 0.12))
          : Math.max(1, Math.round(soldQty * 0.06));
      const orderedQty = soldQty + wasteQty + 4;

      inventoryCreates.push(
        prisma.inventoryLog.create({
          data: {
            storeId: store.id,
            product,
            date,
            orderedQty,
            soldQty,
            wasteQty,
          },
        }),
      );
    }
  }

  const laborCreates = [];
  for (let dayOffset = 35; dayOffset >= 0; dayOffset -= 1) {
    const date = subDays(new Date(), dayOffset);
    const weekday = date.getDay();
    const laborCost =
      weekday === 2 ? 640 : weekday === 5 || weekday === 6 ? 720 : 570;
    laborCreates.push(
      prisma.laborEntry.create({
        data: {
          storeId: store.id,
          date,
          laborCost,
          notes: weekday === 2 ? "Potential overstaffing day" : null,
        },
      }),
    );
  }

  const availabilityCreates = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(new Date(), i);
    availabilityCreates.push(
      prisma.employeeAvailability.create({
        data: {
          employeeId: employees[0].id,
          date,
          startHour: 7,
          endHour: 15,
        },
      }),
      prisma.employeeAvailability.create({
        data: {
          employeeId: employees[1].id,
          date,
          startHour: 8,
          endHour: 16,
        },
      }),
      prisma.employeeAvailability.create({
        data: {
          employeeId: employees[2].id,
          date,
          startHour: 10,
          endHour: 18,
        },
      }),
      prisma.employeeAvailability.create({
        data: {
          employeeId: employees[3].id,
          date,
          startHour: 12,
          endHour: 20,
        },
      }),
    );
  }

  await prisma.$transaction([
    ...salesCreates,
    ...inventoryCreates,
    ...laborCreates,
    ...availabilityCreates,
  ]);

  console.log("Seed complete.");
  console.log("Demo login: demo@storepilot.app / DemoPass123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

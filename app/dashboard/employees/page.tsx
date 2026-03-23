import EmployeeForms from "./ui";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return null;
  }

  const [employees, availability] = await Promise.all([
    prisma.employee.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.employeeAvailability.findMany({
      where: {
        employee: { storeId },
      },
      include: {
        employee: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const employeeOptions = employees.map((employee: (typeof employees)[number]) => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    hourlyRate: Number(employee.hourlyRate),
  }));

  const availabilityRows = availability.map((item: (typeof availability)[number]) => ({
    id: item.id,
    employeeName: item.employee.name,
    date: item.date.toISOString().slice(0, 10),
    startHour: item.startHour,
    endHour: item.endHour,
  }));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">
          Employees & Availability
        </h1>
        <p className="mt-2 text-slate-700">
          Manage staffing inputs used directly by the Scheduling engine for
          next-week shift suggestions.
        </p>
      </section>

      <EmployeeForms
        employeeOptions={employeeOptions}
        availabilityRows={availabilityRows}
      />
    </div>
  );
}

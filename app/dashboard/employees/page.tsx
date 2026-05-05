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

  const employeeOptions = employees.map(
    (employee: (typeof employees)[number]) => ({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      hourlyRate: Number(employee.hourlyRate),
    }),
  );

  const availabilityRows = availability.map(
    (item: (typeof availability)[number]) => ({
      id: item.id,
      employeeName: item.employee.name,
      date: item.date.toISOString().slice(0, 10),
      startHour: item.startHour,
      endHour: item.endHour,
    }),
  );

  return (
    <div className="space-y-6">
      <section className="anim-fade-up">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Team
        </p>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.1 }}>
          Employees & Availability
        </h1>
        <p style={{ marginTop: "0.5rem", color: "var(--text-2)", fontSize: "0.88rem" }}>
          Add your staff and set their hours. Scheduling pulls from this when building next week&apos;s shifts.
        </p>
      </section>

      <EmployeeForms
        employeeOptions={employeeOptions}
        availabilityRows={availabilityRows}
      />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const salesSchema = z.object({
  date: z.string().min(1),
  hour: z.coerce.number().int().min(0).max(23),
  revenue: z.coerce.number().positive(),
  transactions: z.coerce.number().int().min(0),
});

const employeeSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  hourlyRate: z.coerce.number().positive(),
});

const availabilitySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().min(1),
  startHour: z.coerce.number().int().min(0).max(23),
  endHour: z.coerce.number().int().min(1).max(24),
});

const inventoryLogSchema = z.object({
  date: z.string().min(1),
  product: z.string().min(2),
  orderedQty: z.coerce.number().int().min(0),
  soldQty: z.coerce.number().int().min(0),
  wasteQty: z.coerce.number().int().min(0),
});

const laborEntrySchema = z.object({
  date: z.string().min(1),
  laborCost: z.coerce.number().nonnegative(),
  notes: z.string().max(200).optional(),
});

async function requireStoreId() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    throw new Error("Unauthorized");
  }

  return storeId;
}

export async function createSalesEntryAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = salesSchema.safeParse({
    date: formData.get("date"),
    hour: formData.get("hour"),
    revenue: formData.get("revenue"),
    transactions: formData.get("transactions") || 0,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid sales entry";
  }

  const storeId = await requireStoreId();
  await prisma.salesEntry.create({
    data: {
      storeId,
      date: new Date(`${parsed.data.date}T00:00:00`),
      hour: parsed.data.hour,
      revenue: parsed.data.revenue,
      transactions: parsed.data.transactions,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/scheduling");
  revalidatePath("/dashboard/sales");
  return null;
}

export async function createEmployeeAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    hourlyRate: formData.get("hourlyRate"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid employee details";
  }

  const storeId = await requireStoreId();
  await prisma.employee.create({
    data: {
      storeId,
      name: parsed.data.name,
      role: parsed.data.role,
      hourlyRate: parsed.data.hourlyRate,
    },
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard/scheduling");
  return null;
}

export async function createAvailabilityAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = availabilitySchema.safeParse({
    employeeId: formData.get("employeeId"),
    date: formData.get("date"),
    startHour: formData.get("startHour"),
    endHour: formData.get("endHour"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid availability details";
  }

  if (parsed.data.endHour <= parsed.data.startHour) {
    return "End hour must be greater than start hour.";
  }

  const storeId = await requireStoreId();
  const employee = await prisma.employee.findFirst({
    where: {
      id: parsed.data.employeeId,
      storeId,
    },
    select: { id: true },
  });

  if (!employee) {
    return "Employee not found for your store.";
  }

  await prisma.employeeAvailability.create({
    data: {
      employeeId: parsed.data.employeeId,
      date: new Date(`${parsed.data.date}T00:00:00`),
      startHour: parsed.data.startHour,
      endHour: parsed.data.endHour,
    },
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard/scheduling");
  return null;
}

export async function createInventoryLogAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = inventoryLogSchema.safeParse({
    date: formData.get("date"),
    product: formData.get("product"),
    orderedQty: formData.get("orderedQty"),
    soldQty: formData.get("soldQty"),
    wasteQty: formData.get("wasteQty") || 0,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid inventory log";
  }

  const totalUsed = parsed.data.soldQty + parsed.data.wasteQty;
  if (totalUsed > parsed.data.orderedQty) {
    return "Sold + waste cannot exceed ordered quantity.";
  }

  const storeId = await requireStoreId();

  await prisma.inventoryLog.create({
    data: {
      storeId,
      product: parsed.data.product,
      date: new Date(`${parsed.data.date}T00:00:00`),
      orderedQty: parsed.data.orderedQty,
      soldQty: parsed.data.soldQty,
      wasteQty: parsed.data.wasteQty,
    },
  });

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/efficiency");
  return null;
}

export async function createLaborEntryAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = laborEntrySchema.safeParse({
    date: formData.get("date"),
    laborCost: formData.get("laborCost"),
    notes: formData.get("notes")?.toString().trim() || undefined,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid labor entry";
  }

  const storeId = await requireStoreId();

  await prisma.laborEntry.create({
    data: {
      storeId,
      date: new Date(`${parsed.data.date}T00:00:00`),
      laborCost: parsed.data.laborCost,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/dashboard/efficiency");
  return null;
}

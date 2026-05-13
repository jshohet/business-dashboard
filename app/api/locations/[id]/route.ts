import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["QSR", "franchise", "retail", "other"]).optional(),
});

async function getOwnedLocation(locationId: string, storeId: string) {
  return prisma.location.findFirst({
    where: { id: locationId, storeId, deletedAt: null },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const location = await getOwnedLocation(id, session.user.storeId as string);
  if (!location) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ location });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedLocation(id, session.user.storeId as string);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const location = await prisma.location.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, type: true, updatedAt: true },
  });

  return Response.json({ location });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedLocation(id, session.user.storeId as string);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  // Soft delete — KPI history and AI reports are preserved
  await prisma.location.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return Response.json({ success: true });
}

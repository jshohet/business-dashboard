import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWaitlistConfirmationEmail, sendWaitlistOwnerNotification } from "@/lib/email";

const schema = z.object({
  email:      z.string().email(),
  firstName:  z.string().min(1).max(100).optional(),
  role:       z.string().max(100).optional(),
  storeCount: z.string().max(50).optional(),
  painPoint:  z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { email, firstName, role, storeCount, painPoint } = parsed.data;

  try {
    await prisma.waitlist.upsert({
      where: { email },
      update: { firstName, role, storeCount, painPoint },
      create: { email, firstName, role, storeCount, painPoint },
    });
  } catch {
    return Response.json({ error: "Could not save your submission" }, { status: 500 });
  }

  // Fire-and-forget — email failures don't block the response
  void sendWaitlistConfirmationEmail(email, firstName ?? "there").catch(() => {});
  void sendWaitlistOwnerNotification({ email, firstName, role, storeCount, painPoint }).catch(() => {});

  return Response.json({ success: true });
}

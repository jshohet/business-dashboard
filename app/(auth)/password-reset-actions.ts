"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must include at least one special character"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function requestPasswordResetAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | "sent"> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid email";
  }

  const { email } = parsed.data;

  // Always delete any existing token for this email before creating a new one
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  // Don't reveal whether the email exists — always return "sent"
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

    const baseUrl = getSiteUrl().toString().replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Fire-and-forget — don't let email failure block the response
    sendPasswordResetEmail(email, resetUrl).catch(() => {});
  }

  return "sent";
}

export async function resetPasswordAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | "success"> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input";
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    return "This reset link has expired or is invalid. Please request a new one.";
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash },
  });

  // Single-use — delete the token immediately after use
  await prisma.passwordResetToken.delete({ where: { token } });

  return "success";
}

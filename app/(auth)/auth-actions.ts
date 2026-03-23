"use server";

import bcrypt from "bcryptjs";
import AuthError from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeName: z.string().min(2, "Store name is required"),
});

const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    storeName: formData.get("storeName"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input";
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return "An account with this email already exists.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.store.create({
    data: {
      name: parsed.data.storeName,
      users: {
        create: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
        },
      },
    },
  });

  redirect("/login?created=1");
}

export async function loginAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid credentials";
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }

  return null;
}

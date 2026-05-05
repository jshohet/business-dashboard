"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.union([z.string().email(), z.literal("")]).optional(),
  message: z.string().min(10, "Please write at least 10 characters"),
});

export async function suggestFeatureAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | "success"> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input";
  }

  await prisma.featureSuggestion.create({
    data: {
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });

  return "success";
}

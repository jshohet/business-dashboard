import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  redirect("/dashboard/settings/billing");
}

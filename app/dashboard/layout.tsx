import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-orange-50/40 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              Business Dashboard
            </p>
            <p className="text-sm text-slate-700">{session.user.email}</p>
          </div>
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-sm font-semibold">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Overview
            </Link>
            <Link
              href="/dashboard/analytics"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Analytics
            </Link>
            <Link
              href="/dashboard/scheduling"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Scheduling
            </Link>
            <Link
              href="/dashboard/inventory"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Inventory
            </Link>
            <Link
              href="/dashboard/efficiency"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Efficiency
            </Link>
            <Link
              href="/dashboard/sales"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Sales
            </Link>
            <Link
              href="/dashboard/employees"
              className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Employees
            </Link>
            <form action={signOutAction}>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-700">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "../auth-actions";

const initialState: string | null = null;

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-100 px-6 py-14 text-slate-900">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-orange-200/70 bg-white/80 p-8 shadow-xl backdrop-blur md:grid md:grid-cols-2 md:gap-10 md:p-10">
        <section className="mb-10 md:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Retail Intelligence Platform
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900">
            Run your store with data-backed decisions.
          </h1>
          <p className="mt-4 text-slate-700">
            Sign in to track sales, staff schedules, and operational efficiency
            for your store.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
                placeholder="you@store.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
                placeholder="At least 8 characters"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-700">
            New store?{" "}
            <Link
              href="/signup"
              className="font-semibold text-orange-700 hover:text-orange-900">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

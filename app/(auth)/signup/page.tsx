"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "../auth-actions";

const initialState: string | null = null;

export default function SignupPage() {
  const [error, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-100 px-6 py-14 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-orange-200/70 bg-white/90 p-8 shadow-xl backdrop-blur md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Get Started
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Create your store account
        </h1>
        <p className="mt-2 text-slate-700">
          This sets up your own isolated store workspace with private data.
        </p>

        <form action={formAction} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Your Name
            </span>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Store Name
            </span>
            <input
              name="storeName"
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
              placeholder="Downtown Coffee"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
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
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-700">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-700 hover:text-orange-900">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { createSalesEntryAction } from "../actions";

const initialState: string | null = null;

export default function SalesPage() {
  const [error, formAction, isPending] = useActionState(
    createSalesEntryAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-slate-900">Sales Entry</h1>
        <p className="mt-2 text-slate-700">
          Add daily or hourly sales manually for initial trend tracking.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Date
            </span>
            <input
              type="date"
              name="date"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Hour (0-23)
            </span>
            <input
              type="number"
              name="hour"
              min={0}
              max={23}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Revenue
            </span>
            <input
              type="number"
              name="revenue"
              min={0}
              step="0.01"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Transactions
            </span>
            <input
              type="number"
              name="transactions"
              min={0}
              defaultValue={0}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          {error ? (
            <p className="md:col-span-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isPending ? "Saving..." : "Save sales entry"}
          </button>
        </form>
      </section>
    </div>
  );
}

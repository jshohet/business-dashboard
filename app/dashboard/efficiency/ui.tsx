"use client";

import { useActionState } from "react";
import { createLaborEntryAction } from "../actions";
import { formatCurrency } from "@/lib/currency";
import type { EfficiencyInsights } from "@/lib/operations";

type Props = {
  insights: EfficiencyInsights;
};

const initialState: string | null = null;

export default function EfficiencyUI({ insights }: Props) {
  const [error, formAction, isPending] = useActionState(
    createLaborEntryAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Overall Waste Rate</p>
          <p className="mt-2 text-3xl font-black text-rose-700">
            {insights.waste.overallWasteRate.toFixed(2)}%
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-2">
          <p className="text-sm text-slate-600">Top Insight Alerts</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-800">
            {insights.alerts.slice(0, 3).map((alert) => (
              <li key={alert}>• {alert}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Log Labor Cost</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track labor spend to compare staffing cost against daily revenue.
        </p>
        <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-2">
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
              Labor Cost
            </span>
            <input
              type="number"
              name="laborCost"
              min={0}
              step="0.01"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Notes
            </span>
            <input
              type="text"
              name="notes"
              placeholder="Optional context"
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
            {isPending ? "Saving labor cost..." : "Save labor cost"}
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Waste by Product</h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-130 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 font-semibold">Product</th>
                  <th className="py-2 font-semibold">Sold</th>
                  <th className="py-2 font-semibold">Waste</th>
                  <th className="py-2 font-semibold">Waste %</th>
                </tr>
              </thead>
              <tbody>
                {insights.waste.byProduct.map((row) => (
                  <tr key={row.product} className="border-b border-slate-100">
                    <td className="py-2">{row.product}</td>
                    <td className="py-2">{row.soldQty}</td>
                    <td className="py-2">{row.wasteQty}</td>
                    <td className="py-2">{row.wasteRate.toFixed(2)}%</td>
                  </tr>
                ))}
                {insights.waste.byProduct.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-500">
                      No inventory data available yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Labor Cost vs Revenue
          </h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-155 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Revenue</th>
                  <th className="py-2 font-semibold">Labor Cost</th>
                  <th className="py-2 font-semibold">Labor %</th>
                </tr>
              </thead>
              <tbody>
                {insights.laborVsRevenue.slice(-30).map((row) => (
                  <tr key={row.date} className="border-b border-slate-100">
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{formatCurrency(row.revenue)}</td>
                    <td className="py-2">{formatCurrency(row.laborCost)}</td>
                    <td className="py-2">
                      {row.laborToRevenuePct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {insights.laborVsRevenue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-500">
                      No labor/revenue records yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

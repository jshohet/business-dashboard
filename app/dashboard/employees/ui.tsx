"use client";

import { useActionState } from "react";
import { createAvailabilityAction, createEmployeeAction } from "../actions";

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
};

type AvailabilityRow = {
  id: string;
  employeeName: string;
  date: string;
  startHour: number;
  endHour: number;
};

type Props = {
  employeeOptions: EmployeeOption[];
  availabilityRows: AvailabilityRow[];
};

const initialState: string | null = null;

export default function EmployeeForms({
  employeeOptions,
  availabilityRows,
}: Props) {
  const [employeeError, employeeAction, employeePending] = useActionState(
    createEmployeeAction,
    initialState,
  );
  const [availabilityError, availabilityAction, availabilityPending] =
    useActionState(createAvailabilityAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold">Add Employee</h2>
        <form action={employeeAction} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </span>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </span>
            <input
              type="text"
              name="role"
              required
              placeholder="Barista / Cashier / Shift Lead"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Hourly Rate
            </span>
            <input
              type="number"
              name="hourlyRate"
              min={0}
              step="0.01"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
            />
          </label>

          {employeeError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {employeeError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={employeePending}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
            {employeePending ? "Saving employee..." : "Save employee"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold">Add Availability</h2>
        <form action={availabilityAction} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Employee
            </span>
            <select
              name="employeeId"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400">
              <option value="">Select employee</option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.role})
                </option>
              ))}
            </select>
          </label>

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

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Start Hour
              </span>
              <input
                type="number"
                name="startHour"
                min={0}
                max={23}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                End Hour
              </span>
              <input
                type="number"
                name="endHour"
                min={1}
                max={24}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400"
              />
            </label>
          </div>

          {availabilityError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {availabilityError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={availabilityPending}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
            {availabilityPending
              ? "Saving availability..."
              : "Save availability"}
          </button>
        </form>
      </section>

      <section className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold">Recent Availability</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-130 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 font-semibold">Employee</th>
                <th className="py-2 font-semibold">Date</th>
                <th className="py-2 font-semibold">Start</th>
                <th className="py-2 font-semibold">End</th>
              </tr>
            </thead>
            <tbody>
              {availabilityRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-2">{row.employeeName}</td>
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">{row.startHour}:00</td>
                  <td className="py-2">{row.endHour}:00</td>
                </tr>
              ))}
              {availabilityRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-slate-500">
                    No availability records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

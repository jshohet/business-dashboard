"use client";

import { useActionState } from "react";
import { createAvailabilityAction, createEmployeeAction } from "../actions";

type EmployeeOption = { id: string; name: string; role: string; hourlyRate: number };
type AvailabilityRow = { id: string; employeeName: string; date: string; startHour: number; endHour: number };
type Props = { employeeOptions: EmployeeOption[]; availabilityRows: AvailabilityRow[] };

const initialState: string | null = null;

const labelStyle = {
  display: "block" as const,
  marginBottom: "0.4rem",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  color: "var(--text-3)",
  fontWeight: 500,
};

export default function EmployeeForms({ employeeOptions, availabilityRows }: Props) {
  const [employeeError, employeeAction, employeePending] = useActionState(createEmployeeAction, initialState);
  const [availabilityError, availabilityAction, availabilityPending] = useActionState(createAvailabilityAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Forms row */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))" }}>
        <article className="card-static anim-fade-up" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Add Employee</h2>
          <form action={employeeAction} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>NAME</span>
              <input type="text" name="name" required className="inp" />
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>ROLE</span>
              <input type="text" name="role" required placeholder="Barista / Cashier" className="inp" />
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>HOURLY RATE ($)</span>
              <input type="number" name="hourlyRate" min={0} step="0.01" required className="inp" />
            </label>
            {employeeError ? <p className="alert-error">{employeeError}</p> : null}
            <button type="submit" disabled={employeePending} className="btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
              {employeePending ? "Saving…" : "Save Employee"}
            </button>
          </form>
        </article>

        <article className="card-static anim-fade-up anim-delay-1" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Add Availability</h2>
          <form action={availabilityAction} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>EMPLOYEE</span>
              <select name="employeeId" required className="inp">
                <option value="">Select employee</option>
                {employeeOptions.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>DATE</span>
              <input type="date" name="date" required className="inp" />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "block" }}>
                <span style={labelStyle}>START HOUR</span>
                <input type="number" name="startHour" min={0} max={23} required className="inp" />
              </label>
              <label style={{ display: "block" }}>
                <span style={labelStyle}>END HOUR</span>
                <input type="number" name="endHour" min={1} max={24} required className="inp" />
              </label>
            </div>
            {availabilityError ? <p className="alert-error">{availabilityError}</p> : null}
            <button type="submit" disabled={availabilityPending} className="btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
              {availabilityPending ? "Saving…" : "Save Availability"}
            </button>
          </form>
        </article>
      </section>

      {/* Recent availability table */}
      <article className="card-static anim-fade-up anim-delay-2" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "1.25rem" }}>Recent Availability</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 360 }}>
            <thead><tr>{["Employee","Date","Start","End"].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {availabilityRows.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text-1)" }}>{r.employeeName}</td>
                  <td className="font-mono">{r.date}</td>
                  <td className="font-mono">{r.startHour}:00</td>
                  <td className="font-mono">{r.endHour}:00</td>
                </tr>
              ))}
              {availabilityRows.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "1rem 0.75rem", color: "var(--text-3)" }}>No availability records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

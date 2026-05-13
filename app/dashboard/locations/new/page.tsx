"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLocationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        type: form.get("type"),
      }),
    });

    const data = await res.json();
    setIsPending(false);

    if (!res.ok) {
      if (data.error === "location_limit_reached") {
        router.push("/dashboard/settings/billing");
        return;
      }
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/dashboard/locations/${data.location.id}`);
  }

  return (
    <div className="anim-fade-up" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Locations
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Add a location
        </h1>
      </div>

      <div className="card-static" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
              Location name
            </span>
            <input
              name="name"
              type="text"
              required
              className="inp"
              placeholder="Downtown — Main St"
              autoFocus
            />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
              Store type
            </span>
            <select name="type" className="inp" defaultValue="other">
              <option value="QSR">QSR (Quick Service Restaurant)</option>
              <option value="franchise">Franchise</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </label>

          {error && <p className="alert-error">{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.back()}
              style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
              style={{ flex: 2 }}>
              {isPending ? "Adding…" : "Add location →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

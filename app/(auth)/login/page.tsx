"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "../auth-actions";

const initialState: string | null = null;

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main
      style={{ minHeight: "100svh", background: "var(--bg)", display: "grid" }}
      className="md:grid-cols-[1fr_480px]">

      {/* ── Left decorative panel ── */}
      <div
        className="hidden md:flex flex-col justify-between p-12"
        style={{
          background: "linear-gradient(145deg, #0f1117 0%, #0b0c0f 100%)",
          borderRight: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}>

        {/* Background geometry */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
        }}>
          {/* Amber glow orb */}
          <div style={{
            position: "absolute", top: "30%", left: "-10%",
            width: 420, height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          }} />
          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}>
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Brand */}
        <div className="relative anim-fade-up">
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 44, height: 44, borderRadius: 12,
            background: "var(--amber)", marginBottom: "1.25rem",
          }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#000" }}>S</span>
          </div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>
            StorePilot
          </p>
          <h1 className="font-serif" style={{ fontSize: "2.6rem", lineHeight: 1.1, fontWeight: 600, color: "var(--text-1)", maxWidth: 340 }}>
            Retail intelligence,<br />
            <span style={{ color: "var(--amber)" }}>data-backed.</span>
          </h1>
          <p style={{ marginTop: "1.25rem", color: "var(--text-2)", fontSize: "0.9rem", maxWidth: 320, lineHeight: 1.65 }}>
            Track sales, optimize staffing, forecast inventory, and monitor efficiency — all in one dark, fast dashboard.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative anim-fade-up anim-delay-2">
          {[
            ["↗", "Sales trend analytics"],
            ["◷", "AI-powered scheduling"],
            ["▦", "Inventory forecasting"],
            ["◎", "Waste & efficiency alerts"],
          ].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "var(--amber)", fontSize: "0.9rem", width: 20, textAlign: "center" }}>{icon}</span>
              <span style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          background: "var(--bg-raised)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem 2.5rem",
        }}
        className="anim-fade-up">

        <div style={{ maxWidth: 360, width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "2.25rem" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>
              Welcome back
            </p>
            <h2 className="font-serif" style={{ fontSize: "1.9rem", fontWeight: 600, color: "var(--text-1)" }}>
              Sign in
            </h2>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.75rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
                EMAIL
              </span>
              <input
                name="email"
                type="email"
                required
                className="inp"
                placeholder="you@store.com"
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.75rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
                PASSWORD
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="inp"
                placeholder="At least 8 characters"
              />
            </label>

            {error ? <p className="alert-error">{error}</p> : null}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{ marginTop: "0.25rem", width: "100%", padding: "0.85rem" }}>
              {isPending ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--text-3)", textAlign: "center" }}>
            New store?{" "}
            <Link href="/signup" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

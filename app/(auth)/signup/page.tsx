"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "../auth-actions";

const initialState: string | null = null;

export default function SignupPage() {
  const [error, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <main
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}>

      {/* Background glow */}
      <div aria-hidden style={{
        position: "absolute", top: "-15%", right: "5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 480,
          position: "relative",
        }}
        className="anim-fade-up">

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-3)", fontSize: "0.78rem", textDecoration: "none", marginBottom: "1.5rem" }}>
            ← Back to sign in
          </Link>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "var(--amber)",
            marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#000" }}>S</span>
          </div>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
            Get started
          </p>
          <h1 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)" }}>
            Create your store
          </h1>
          <p style={{ marginTop: "0.4rem", color: "var(--text-3)", fontSize: "0.82rem" }}>
            Your own isolated workspace — private data, full control.
          </p>
        </div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
                YOUR NAME
              </span>
              <input
                name="name"
                type="text"
                required
                className="inp"
                placeholder="Alex"
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
                STORE NAME
              </span>
              <input
                name="storeName"
                type="text"
                required
                className="inp"
                placeholder="Downtown Café"
              />
            </label>
          </div>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
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
            <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
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
            {isPending ? "Creating account…" : "Create account →"}
          </button>
        </form>

        <p style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "var(--text-3)", textAlign: "center" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

        <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "var(--text-3)", textAlign: "center", lineHeight: 1.5 }}>
          After signup, subscribe for $5/month to unlock all features.
        </p>
      </div>
    </main>
  );
}

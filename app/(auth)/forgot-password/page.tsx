"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "../password-reset-actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, null);

  if (state === "sent") {
    return (
      <main
        style={{
          minHeight: "100svh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1rem",
        }}>
        <div
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "2.5rem",
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
          }}
          className="anim-fade-up">
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.2)",
            margin: "0 auto 1.5rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem",
          }}>
            ✉
          </div>
          <h1 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.75rem" }}>
            Check your email
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "1.75rem" }}>
            If an account with that email exists, we&apos;ve sent a reset link. It expires in 1 hour.
          </p>
          <Link href="/login" style={{ fontSize: "0.82rem", color: "var(--text-3)", textDecoration: "none" }}>
            ← Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
      }}>
      <div
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 420,
        }}
        className="anim-fade-up">

        <div style={{ marginBottom: "2rem" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-3)", fontSize: "0.78rem", textDecoration: "none", marginBottom: "1.5rem" }}>
            ← Back to sign in
          </Link>
          <h1 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.4rem" }}>
            Forgot password?
          </h1>
          <p style={{ fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.6 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
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
              autoComplete="email"
              className="inp"
              placeholder="you@store.com"
            />
          </label>

          {state && state !== "sent" ? <p className="alert-error">{state}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
            style={{ marginTop: "0.25rem", width: "100%", padding: "0.85rem" }}>
            {isPending ? "Sending…" : "Send reset link →"}
          </button>
        </form>
      </div>
    </main>
  );
}

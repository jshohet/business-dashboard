"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetPasswordAction } from "../password-reset-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function checkMatch() {
    if (confirmRef.current && passwordRef.current) {
      confirmRef.current.setCustomValidity(
        confirmRef.current.value && confirmRef.current.value !== passwordRef.current.value
          ? "Passwords don't match"
          : ""
      );
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--text-2)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          This reset link is invalid or has already been used.
        </p>
        <Link href="/forgot-password" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none", fontSize: "0.88rem" }}>
          Request a new one →
        </Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "rgba(20,184,166,0.1)",
          border: "1px solid rgba(20,184,166,0.25)",
          margin: "0 auto 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
        }}>
          ✓
        </div>
        <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.6rem" }}>
          Password updated
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-primary" style={{ display: "inline-block", padding: "0.75rem 1.75rem" }}>
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.4rem" }}>
          Set a new password
        </h1>
        <p style={{ fontSize: "0.84rem", color: "var(--text-2)" }}>
          Choose something strong you haven&apos;t used before.
        </p>
      </div>

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="hidden" name="token" value={token} />

        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
            NEW PASSWORD
          </span>
          <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.71rem", color: "var(--text-3)" }}>
            Min 12 characters · 1 number · 1 symbol
          </span>
          <input
            ref={passwordRef}
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="inp"
            onChange={checkMatch}
          />
        </label>

        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 500 }}>
            CONFIRM PASSWORD
          </span>
          <input
            ref={confirmRef}
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="inp"
            onChange={checkMatch}
          />
        </label>

        {state && state !== "success" ? <p className="alert-error">{state}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{ marginTop: "0.25rem", width: "100%", padding: "0.85rem" }}>
          {isPending ? "Updating…" : "Update password →"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";

export default function CheckoutButton({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      {error ? (
        <p style={{
          marginBottom: "0.875rem",
          padding: "0.5rem 0.875rem",
          background: "rgba(244,63,94,0.08)",
          border: "1px solid rgba(244,63,94,0.25)",
          borderRadius: 8,
          fontSize: "0.8rem",
          color: "#fda4af",
        }}>
          {error}
        </p>
      ) : null}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary"
        style={{ width: "100%", padding: "0.95rem", fontSize: "0.95rem" }}>
        {loading ? "Redirecting…" : "Subscribe for $5 / month →"}
      </button>
    </>
  );
}

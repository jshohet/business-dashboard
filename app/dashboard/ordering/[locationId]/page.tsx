"use client";

import { useState, use } from "react";
import { UpgradePrompt } from "@/app/dashboard/components/UpgradePrompt";
import type { OrderingCadenceOutput } from "@/lib/prompts/ordering-cadence";
import Link from "next/link";

export default function OrderingPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = use(params);
  const [products, setProducts] = useState("");
  const [result, setResult] = useState<OrderingCadenceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeRequired, setIsUpgradeRequired] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const productList = products
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    if (productList.length === 0) {
      setError("Enter at least one product");
      return;
    }

    setIsPending(true);
    const res = await fetch("/api/ai/ordering", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, products: productList }),
    });

    const data = await res.json();
    setIsPending(false);

    if (res.status === 403 && data.error === "upgrade_required") {
      setIsUpgradeRequired(true);
      return;
    }
    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }

    setResult(data.result);
  }

  if (isUpgradeRequired) {
    return (
      <div style={{ paddingTop: "3rem" }}>
        <UpgradePrompt
          requiredPlan="operator"
          featureName="AI Ordering Cadence"
          featureDescription="Enter your product list and StoreOps analyzes your waste history to generate specific, data-driven ordering recommendations — reducing waste without cutting corners."
        />
      </div>
    );
  }

  return (
    <div className="anim-fade-up" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Ordering
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          AI ordering cadence
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          Paste your product list. StoreOps will use your waste history to tell you exactly what to order and when.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleGenerate}>
          <div className="card-static" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
            <label>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
                Products (one per line, up to 20)
              </p>
              <textarea
                value={products}
                onChange={(e) => setProducts(e.target.value)}
                className="inp"
                rows={10}
                placeholder={"Whole milk\n2% milk\nOat milk\nCream cheese\nBagels\nCroissants\n..."}
                style={{ resize: "vertical", fontFamily: "var(--font-mono), monospace", fontSize: "0.85rem" }}
              />
            </label>
          </div>

          {error && <p className="alert-error" style={{ marginBottom: "1rem" }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: "100%" }}>
            {isPending ? "Analyzing your waste data…" : "Generate ordering recommendations →"}
          </button>
        </form>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} className="card-static" style={{ padding: "1.25rem 1.5rem" }}>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.25rem" }}>{rec.product}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--amber)", marginBottom: "0.75rem" }}>{rec.current_issue}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-1)", fontWeight: 500, marginBottom: "0.4rem" }}>{rec.recommended_action}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6 }}>{rec.reasoning}</p>
              </div>
            ))}
          </div>

          {result.ordering_principles.length > 0 && (
            <div className="card-static" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
                Principles for this store
              </p>
              <ol style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {result.ordering_principles.map((p, i) => (
                  <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.55 }}>{p}</li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setResult(null)} className="btn-ghost" style={{ flex: 1 }}>
              ← Regenerate
            </button>
            <Link href={`/dashboard/locations/${locationId}`} className="btn-primary" style={{ flex: 2, textDecoration: "none", textAlign: "center" }}>
              Back to location →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

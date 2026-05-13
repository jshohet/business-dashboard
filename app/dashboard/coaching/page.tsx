"use client";

import { useState, useEffect } from "react";
import { UpgradePrompt } from "@/app/dashboard/components/UpgradePrompt";
import type { CoachingScriptOutput } from "@/lib/prompts/coaching-script";

const METRIC_OPTIONS = [
  { value: "labor_cost_pct",          label: "Labor cost %" },
  { value: "waste_pct",               label: "Waste %" },
  { value: "speed_of_service_avg",    label: "Speed of service" },
  { value: "customer_satisfaction",   label: "Customer satisfaction" },
  { value: "revenue_vs_target_pct",   label: "Revenue vs target" },
  { value: "controllable_profit_pct", label: "Controllable profit %" },
];

interface Location { id: string; name: string; }

export default function CoachingPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");
  const [role, setRole] = useState("");
  const [metric, setMetric] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [weeksOffTarget, setWeeksOffTarget] = useState("1");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<CoachingScriptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeRequired, setIsUpgradeRequired] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data: { locations?: Location[] }) => {
        const locs = data.locations ?? [];
        setLocations(locs);
        if (locs.length === 1) setLocationId(locs[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    setIsPending(true);
    const res = await fetch("/api/ai/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        role,
        metric,
        metricLabel: METRIC_OPTIONS.find((m) => m.value === metric)?.label ?? metric,
        currentValue: parseFloat(currentValue),
        targetValue: parseFloat(targetValue),
        weeksOffTarget: parseInt(weeksOffTarget),
        context: context || undefined,
      }),
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

  function copyScript() {
    if (!result) return;
    const text = [
      "OPENING\n" + result.opening,
      "\nDATA FRAMING\n" + result.data_framing,
      "\nTHE ASK\n" + result.the_ask,
      "\nANTICIPATED PUSHBACK\n" + result.anticipated_pushback.map((p) => `Q: ${p.pushback}\nA: ${p.response}`).join("\n\n"),
      "\nCOMMITMENT CLOSE\n" + result.commitment_close,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isUpgradeRequired) {
    return (
      <div style={{ paddingTop: "3rem" }}>
        <UpgradePrompt
          requiredPlan="enterprise"
          featureName="AI Coaching Scripts"
          featureDescription="Generate specific, data-backed coaching conversation scripts for any team member and any metric — opening, data framing, the ask, anticipated pushback, and commitment close."
        />
      </div>
    );
  }

  return (
    <div className="anim-fade-up" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Coaching
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          AI coaching script
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          Enter the situation. Get a full conversation script built around your actual numbers.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleGenerate}>
          <div className="card-static" style={{ padding: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                Location
              </span>
              {locations.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Loading…</p>
              ) : (
                <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required className="inp">
                  <option value="" disabled>Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              )}
            </label>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                Their role (not their name)
              </span>
              <input value={role} onChange={(e) => setRole(e.target.value)} required className="inp" placeholder="e.g. shift supervisor, assistant manager" />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Metric
                </span>
                <select value={metric} onChange={(e) => setMetric(e.target.value)} required className="inp">
                  <option value="" disabled>Select metric</option>
                  {METRIC_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Weeks off-target
                </span>
                <input type="number" min="1" value={weeksOffTarget} onChange={(e) => setWeeksOffTarget(e.target.value)} required className="inp" />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Current value
                </span>
                <input type="number" step="any" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required className="inp" placeholder="31.2" />
              </label>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Target value
                </span>
                <input type="number" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required className="inp" placeholder="28.0" />
              </label>
            </div>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                Context (optional)
              </span>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} className="inp" rows={2} placeholder="Anything the AI should know — new hire, recent feedback, seasonal factors…" style={{ resize: "vertical" }} />
            </label>
          </div>

          {error && <p className="alert-error" style={{ marginBottom: "1rem" }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: "100%" }}>
            {isPending ? "Writing your script…" : "Generate coaching script →"}
          </button>
        </form>
      ) : (
        <div>
          {(["opening", "data_framing", "the_ask", "commitment_close"] as const).map((key) => (
            <div key={key} className="card-static" style={{ padding: "1.25rem 1.5rem", marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>
                {key.replace(/_/g, " ")}
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-1)", lineHeight: 1.65 }}>{result[key]}</p>
            </div>
          ))}

          {result.anticipated_pushback.length > 0 && (
            <div className="card-static" style={{ padding: "1.25rem 1.5rem", marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
                Anticipated pushback
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {result.anticipated_pushback.map((pb, i) => (
                  <div key={i}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-3)", fontStyle: "italic", marginBottom: "0.25rem" }}>"{pb.pushback}"</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-1)", lineHeight: 1.6 }}>{pb.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button onClick={() => setResult(null)} className="btn-ghost" style={{ flex: 1 }}>← New script</button>
            <button onClick={copyScript} className="btn-primary" style={{ flex: 2 }}>
              {copied ? "Copied ✓" : "Copy full script"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

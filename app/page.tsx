import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FeatureSuggestionForm from "./feature-suggestion-form";

const features = [
  { icon: "↗", label: "Sales Analytics", desc: "Daily & weekly trends, peak-hour detection, and revenue momentum at a glance.", color: "#f59e0b", glow: "rgba(245,158,11,0.08)" },
  { icon: "◷", label: "Smart Scheduling", desc: "Generate next-week staffing plans from real demand patterns and availability.", color: "#14b8a6", glow: "rgba(20,184,166,0.08)" },
  { icon: "▦", label: "Inventory Forecasting", desc: "Forecast demand and recommended order quantities by product, week over week.", color: "#818cf8", glow: "rgba(129,140,248,0.08)" },
  { icon: "◎", label: "Efficiency Tracking", desc: "Track waste and labor-to-revenue ratio with alerts when things go off-track.", color: "#f43f5e", glow: "rgba(244,63,94,0.08)" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{ background: "var(--bg)", minHeight: "100svh" }}>

      {/* ── Nav ── */}
      <nav style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,12,15,0.9)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--amber)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#000", fontWeight: 800, fontSize: "0.85rem" }}>S</span>
            </div>
            <span className="font-serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-1)" }}>
              StoreOps
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/login" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}>
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "6rem 1.5rem 5rem" }}>
        {/* Ambient glow */}
        <div aria-hidden style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Grid lines */}
        <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025, pointerEvents: "none" }}>
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div className="mx-auto max-w-3xl text-center anim-fade-up" style={{ position: "relative" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "1.25rem", fontWeight: 500 }}>
            Retail Operations Dashboard
          </p>
          <h1 className="font-serif" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.08, marginBottom: "1.5rem" }}>
            Your store&apos;s data,<br />
            <span style={{ color: "var(--amber)" }}>finally making sense.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 2.5rem" }}>
            Know when you&apos;re busiest, who to schedule, what to reorder, and where you&apos;re losing money. Built for independent stores.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <Link href="/signup" className="btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "0.95rem" }}>
              Create free account →
            </Link>
            <Link href="/login" style={{
              padding: "0.875rem 2rem",
              fontSize: "0.95rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              textDecoration: "none",
              background: "var(--bg-raised)",
            }}>
              Sign in
            </Link>
          </div>

          <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
            Sign up free to explore with sample data.{" "}
            <span style={{ color: "var(--text-2)" }}>$5/month to connect your actual store.</span>
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-5xl">
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textAlign: "center", marginBottom: "0.5rem" }}>
            What&apos;s included
          </p>
          <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--text-1)", textAlign: "center", marginBottom: "2.5rem" }}>
            What&apos;s in here
          </h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {features.map((f, i) => (
              <div
                key={f.label}
                className={`card-static anim-fade-up anim-delay-${i + 1}`}
                style={{
                  padding: "1.5rem",
                  background: `linear-gradient(135deg, ${f.glow} 0%, var(--bg-raised) 60%)`,
                }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 9,
                  background: f.glow,
                  border: `1px solid ${f.color}22`,
                  color: f.color, fontSize: "0.95rem", fontWeight: 700,
                  marginBottom: "0.875rem",
                }}>
                  {f.icon}
                </div>
                <p style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  {f.label}
                </p>
                <p style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing callout ── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-xl text-center anim-fade-up">
          <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.75rem" }}>
            Simple pricing
          </h2>
          <div style={{
            background: "var(--bg-raised)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "2rem",
            marginTop: "1.5rem",
          }}>
            <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.5rem" }}>
              Pro
            </p>
            <p className="font-serif" style={{ fontSize: "2.8rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>
              $5<span style={{ fontSize: "1rem", color: "var(--text-3)", fontFamily: "var(--font-dm-sans)" }}>/month</span>
            </p>
            <p style={{ color: "var(--text-2)", fontSize: "0.85rem", margin: "1rem 0 1.5rem" }}>
              Connect your store, enter your real numbers, and cancel any time.
            </p>
            <Link href="/signup" className="btn-primary" style={{ display: "inline-block", padding: "0.8rem 2rem" }}>
              Get started →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature suggestion ── */}
      <section style={{ padding: "4rem 1.5rem 5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-lg anim-fade-up">
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem", textAlign: "center" }}>
            Shape the roadmap
          </p>
          <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", textAlign: "center", marginBottom: "0.5rem" }}>
            Suggest a feature
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", textAlign: "center", marginBottom: "1.75rem" }}>
            Have an idea? We look at everything that comes in.
          </p>
          <FeatureSuggestionForm />
        </div>
      </section>

    </main>
  );
}

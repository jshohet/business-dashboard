import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FeatureSuggestionForm from "./feature-suggestion-form";

const features = [
  { icon: "↗", label: "Sales Analytics", desc: "See daily and weekly trends, when you're busiest, and whether this week beat last.", color: "#38bdf8", glow: "rgba(56,189,248,0.08)" },
  { icon: "◷", label: "Scheduling", desc: "Plan next week's shifts from your actual sales data — no guessing at who to call in.", color: "#14b8a6", glow: "rgba(20,184,166,0.08)" },
  { icon: "▦", label: "Inventory Forecasting", desc: "See what to reorder and how much, based on what sold and what went to waste.", color: "#818cf8", glow: "rgba(129,140,248,0.08)" },
  { icon: "◎", label: "Efficiency Tracking", desc: "Track waste rates and labor costs with alerts when the numbers start to slip.", color: "#f43f5e", glow: "rgba(244,63,94,0.08)" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{ background: "var(--bg)", minHeight: "100svh" }}>

      {/* ── Nav ── */}
      <nav aria-label="Main navigation" style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(13,15,18,0.92)",
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
              Try free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "6rem 1.5rem 5rem" }}>
        <div aria-hidden style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.02, pointerEvents: "none" }}>
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div className="mx-auto max-w-3xl text-center anim-fade-up" style={{ position: "relative" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "1.25rem", fontWeight: 500 }}>
            Built by a store manager, for store managers
          </p>
          <h1 className="font-serif" style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.75rem)", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.08, marginBottom: "1.5rem" }}>
            The system that took a store<br />
            <span style={{ color: "var(--amber)" }}>from unranked to #19 in the Northeast.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 2.5rem" }}>
            I ran it as acting manager in 30 days. StoreOps is that system — automated.
            KPI tracking, AI drift detection, ordering cadences, and coaching scripts, so any manager can run the same playbook.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link href="/signup" className="btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "0.95rem" }}>
              Start free →
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
            Explore free with sample data — no card required. Plans start at $49/mo when you&apos;re ready.
          </p>
        </div>
      </section>

      {/* ── Founder story ── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="anim-fade-up grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16" style={{ alignItems: "center" }}>
            {/* Left: the stat */}
            <div>
              <div style={{
                display: "inline-block",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "2.5rem",
                marginBottom: "1.5rem",
                width: "100%",
              }}>
                <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.75rem", fontWeight: 600 }}>
                  The result
                </p>
                <p className="font-serif" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 600, color: "var(--text-1)", lineHeight: 1, marginBottom: "0.5rem" }}>
                  #19
                </p>
                <p style={{ fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                  in the entire Northeast<br />
                  on every KPI tracked
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "1.25rem", paddingTop: "1.25rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                    Starbucks · Acting Manager · 30 days
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                {[
                  { value: "30", label: "days to top 20" },
                  { value: "↓", label: "waste & labor costs" },
                  { value: "↑", label: "speed of service" },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    flex: 1,
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "1rem",
                    textAlign: "center",
                  }}>
                    <p className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--amber)", marginBottom: "0.25rem" }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-3)", lineHeight: 1.3 }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: the story */}
            <div>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1.25rem", fontWeight: 600 }}>
                Why I built this
              </p>
              <p className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.3, marginBottom: "1.25rem" }}>
                Most stores are flying blind. I was given one with bad numbers and 30 days to fix them.
              </p>
              <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1rem" }}>
                When I took over as acting manager, the store wasn&apos;t ranking. I had no data system, no dashboard, just a team and a belief that if you can measure it, you can manage it.
              </p>
              <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1rem" }}>
                I built a manual tracking system in spreadsheets — ordering cadences based on actual sales, weekly KPI scorecards visible to the whole team, waste tracking tied to scheduling. Within 30 days the store hit #19 in the Northeast on every metric they measured.
              </p>
              <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1.75rem" }}>
                That system works. Most managers don&apos;t have time to rebuild it from scratch. So I built the software.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--amber) 0%, rgba(56,189,248,0.6) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "1rem", color: "#000", flexShrink: 0,
                }}>
                  J
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>Joe Shohet</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Founder, StoreOps · Ex-Starbucks acting manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-5xl">
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textAlign: "center", marginBottom: "0.5rem" }}>
            The playbook, automated
          </p>
          <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--text-1)", textAlign: "center", marginBottom: "2.5rem" }}>
            Everything in one place
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

      {/* ── Pricing ── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-xl text-center anim-fade-up">
          <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.5rem" }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "2rem" }}>
            Start free with sample data. Add your own numbers when you&apos;re ready.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ textAlign: "left" }}>
            {[
              { label: "Starter", price: "$49/mo", detail: "1 location · KPI dashboard" },
              { label: "Operator", price: "$99/mo", detail: "5 locations · AI drift analysis" },
              { label: "Enterprise", price: "$299/mo", detail: "50 locations · Full AI suite" },
            ].map((tier) => (
              <div key={tier.label} style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1.25rem",
              }}>
                <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>{tier.label}</p>
                <p className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1, marginBottom: "0.4rem" }}>{tier.price}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{tier.detail}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn-primary" style={{ display: "inline-block", padding: "0.8rem 2rem", marginTop: "1.5rem" }}>
            Start free — no card required →
          </Link>
        </div>
      </section>

      {/* ── Feature suggestion ── */}
      <section style={{ padding: "4rem 1.5rem 5rem", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-lg anim-fade-up">
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem", textAlign: "center" }}>
            What should we build next?
          </p>
          <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-1)", textAlign: "center", marginBottom: "0.5rem" }}>
            Suggest a feature
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", textAlign: "center", marginBottom: "1.75rem" }}>
            Have an idea? We read everything that comes in.
          </p>
          <FeatureSuggestionForm />
        </div>
      </section>

    </main>
  );
}

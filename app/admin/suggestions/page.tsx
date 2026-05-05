import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (!key || key !== process.env.AUTH_SECRET) {
    redirect("/");
  }

  const suggestions = await prisma.featureSuggestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
        Admin
      </p>
      <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.5rem" }}>
        Feature Suggestions
      </h1>
      <p style={{ color: "var(--text-2)", fontSize: "0.88rem", marginBottom: "2rem" }}>
        {suggestions.length} submission{suggestions.length !== 1 ? "s" : ""}
      </p>

      {suggestions.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.88rem" }}>Nothing yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="card-static"
              style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--amber)", fontWeight: 500 }}>
                  {s.email ?? "anonymous"}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                  {s.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p style={{ color: "var(--text-1)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                {s.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

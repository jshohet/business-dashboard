import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function WaitlistAdminPage() {
  const session = await auth();

  const superuserEmails = (process.env.SUPERUSER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!session?.user || !superuserEmails.includes((session.user.email ?? "").toLowerCase())) {
    redirect("/dashboard");
  }

  const entries = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Admin
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Waitlist
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "0.4rem" }}>
          {entries.length} signup{entries.length !== 1 ? "s" : ""}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="card-static" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)" }}>No signups yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Name", "Email", "Role", "Stores", "Pain point"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    {format(new Date(e.createdAt), "MMM d, yyyy")}
                  </td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-2)" }}>{e.firstName ?? "—"}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-1)", fontWeight: 500 }}>{e.email}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-2)" }}>{e.role ?? "—"}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-2)", textAlign: "center" }}>{e.storeCount ?? "—"}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-2)", maxWidth: 280 }}>{e.painPoint ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

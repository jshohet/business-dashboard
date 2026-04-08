import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/app/legal-page-shell";
import { legalContactEmail } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description:
    "Information about cookies and similar technologies used by Business Dashboard.",
};

export default function CookieNoticePage() {
  return (
    <LegalPageShell
      title="Cookie Notice"
      description="Business Dashboard uses cookies and similar storage technologies needed for sign-in, session management, security, and basic application operation.">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Essential cookies</h2>
        <p>
          Essential cookies support authentication, store-scoped sessions, and
          security protections. Without them, sign-in and protected dashboard
          features may not function correctly.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Operational storage
        </h2>
        <p>
          The application may also use browser storage or equivalent mechanisms
          to remember temporary interface state where necessary to support forms
          and dashboard workflows.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Managing cookies</h2>
        <p>
          Most browsers allow you to review, block, or delete cookies.
          Restricting cookies may affect sign-in and other core parts of the
          service.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Questions or requests
        </h2>
        <p>
          If you have questions about authentication cookies or want to make a
          privacy-related request, use the{" "}
          <Link
            href="/contact-data-requests"
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            Contact & Data Requests
          </Link>{" "}
          page or email{" "}
          <a
            href={`mailto:${legalContactEmail}`}
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            {legalContactEmail}
          </a>
          .
        </p>
      </div>
    </LegalPageShell>
  );
}

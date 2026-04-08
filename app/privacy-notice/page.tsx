import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/app/legal-page-shell";
import {
  legalContactEmail,
  legalJurisdiction,
  legalOperatorName,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Business Dashboard collects, uses, and stores personal and store-related information.",
};

export default function PrivacyNoticePage() {
  return (
    <LegalPageShell
      title="Privacy Notice"
      description="Business Dashboard stores the information needed to authenticate users, separate store data, and provide analytics, staffing, inventory, and operations tools.">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Operator</h2>
        <p>Business Dashboard is operated by {legalOperatorName}.</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Information collected
        </h2>
        <p>
          The application may store account information such as name, email
          address, encrypted credentials, store details, employee records,
          sales entries, scheduling inputs, inventory records, and technical
          data needed for authentication, fraud prevention, and service
          security.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          How information is used
        </h2>
        <p>
          Data is used to sign users in, scope records to the correct store,
          generate analytics, support scheduling and inventory workflows, and
          keep the service reliable and secure.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Sharing</h2>
        <p>
          Business Dashboard does not sell personal information. Data may be
          processed by infrastructure and service providers involved in hosting,
          database storage, authentication, monitoring, and security where that
          processing is necessary to operate the application.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Retention</h2>
        <p>
          Account and store data is retained for as long as needed to operate
          the service, maintain business records, preserve security logs, and
          comply with legal obligations unless deletion is requested and legally
          permitted.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Data requests</h2>
        <p>
          If you need access to, correction of, or deletion of account or
          store-related data, use the {" "}
          <Link
            href="/contact-data-requests"
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            Contact & Data Requests
          </Link>{" "}
          page or email {" "}
          <a
            href={`mailto:${legalContactEmail}`}
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            {legalContactEmail}
          </a>
          . Requests are reviewed manually before action is taken.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Jurisdiction</h2>
        <p>
          This notice is intended to be read consistently with the laws of the
          {" "}{legalJurisdiction}, subject to any mandatory privacy or
          consumer-protection law that applies to a particular user.
        </p>
      </div>
    </LegalPageShell>
  );
}
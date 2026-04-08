import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/app/legal-page-shell";
import {
  legalContactEmail,
  legalJurisdiction,
  legalOperatorName,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Basic terms governing access to and use of Business Dashboard.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPageShell
      title="Terms of Use"
      description="By accessing or using Business Dashboard, you agree to use the application lawfully and in a way that does not interfere with other users, stores, or the operation of the service.">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Operator</h2>
        <p>
          These terms apply to the use of Business Dashboard, operated by
          {" "}{legalOperatorName}.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Acceptable use</h2>
        <p>
          You agree not to misuse the service, attempt unauthorized access,
          interfere with store isolation, upload unlawful or harmful material,
          or disrupt the application or its supporting infrastructure.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Business data</h2>
        <p>
          You remain responsible for the accuracy, legality, and ownership of
          the business information you submit, including sales, employee,
          scheduling, and inventory data. You grant the application the rights
          needed to host, process, display, and manage that data within the
          service.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Availability</h2>
        <p>
          The service may change, be suspended, or be removed at any time.
          Access is provided on an as-available basis without guarantees of
          uninterrupted service or perfect availability.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Liability</h2>
        <p>
          To the maximum extent permitted by law, Business Dashboard is not
          liable for indirect, incidental, special, or consequential loss
          arising from the use of the application, submitted data, or temporary
          unavailability.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Privacy and deletion requests
        </h2>
        <p>
          Requests relating to personal data, account access, correction, or
          deletion should be submitted through the {" "}
          <Link
            href="/contact-data-requests"
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            Contact & Data Requests
          </Link>{" "}
          page or by email to {" "}
          <a
            href={`mailto:${legalContactEmail}`}
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            {legalContactEmail}
          </a>
          .
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Governing law</h2>
        <p>
          These terms are governed by the laws of the {legalJurisdiction},
          without regard to conflict-of-law principles, except where mandatory
          law requires otherwise.
        </p>
      </div>
    </LegalPageShell>
  );
}
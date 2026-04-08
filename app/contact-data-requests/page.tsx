import type { Metadata } from "next";
import { LegalPageShell } from "@/app/legal-page-shell";
import {
  legalContactEmail,
  legalJurisdiction,
  legalOperatorName,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact and Data Requests",
  description:
    "How to send contact, privacy, access, correction, and deletion requests for Business Dashboard.",
};

export default function ContactDataRequestsPage() {
  return (
    <LegalPageShell
      title="Contact and Data Requests"
      description="This page explains how users can request access to their data, corrections, or deletion of account-related and store-related information from Business Dashboard.">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Site operator</h2>
        <p>Business Dashboard is operated by {legalOperatorName}.</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          How to make a request
        </h2>
        <p>
          Send legal, privacy, access, correction, or deletion requests to{" "}
          <a
            href={`mailto:${legalContactEmail}`}
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900">
            {legalContactEmail}
          </a>
          . Include enough detail to identify the relevant account, store, or
          data set and describe the action you want taken.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Contact email</h2>
        <p>{legalContactEmail}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          What users can request
        </h2>
        <p>
          Users may request confirmation of whether account or store data is
          held, access to that data, correction of inaccurate information, or
          deletion of account-related data and business records where
          applicable.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Verification</h2>
        <p>
          Requests should include enough information to verify the identity of
          the requester and identify the relevant account, store, or content
          before any action is taken.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Deletion handling</h2>
        <p>
          Valid deletion requests are reviewed manually. Some data may be
          retained where necessary for security, fraud prevention, record-
          keeping, backups, or compliance with applicable law.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Jurisdiction status
        </h2>
        <p>
          Requests and related site policies are handled with reference to the
          laws of the {legalJurisdiction}, except where mandatory law requires a
          different standard to apply.
        </p>
      </div>
    </LegalPageShell>
  );
}

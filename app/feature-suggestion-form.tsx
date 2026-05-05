"use client";

import { useActionState } from "react";
import { suggestFeatureAction } from "./feature-suggestion-action";

export default function FeatureSuggestionForm() {
  const [state, formAction, isPending] = useActionState(suggestFeatureAction, null);

  if (state === "success") {
    return (
      <p style={{ color: "var(--amber)", fontSize: "0.9rem", textAlign: "center", padding: "1rem 0" }}>
        Thanks — we&apos;ll take a look.
      </p>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <input
        name="email"
        type="email"
        placeholder="your@email.com (optional)"
        className="inp"
      />
      <textarea
        name="message"
        required
        minLength={10}
        placeholder="What would make this more useful for your store?"
        className="inp"
        style={{ minHeight: 96, resize: "vertical" }}
      />
      {state ? <p style={{ color: "var(--rose)", fontSize: "0.82rem" }}>{state}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
        style={{ alignSelf: "flex-end", padding: "0.7rem 1.5rem" }}>
        {isPending ? "Sending…" : "Send suggestion →"}
      </button>
    </form>
  );
}

import { Resend } from "resend";

// TODO: replace with your verified Resend sending domain before enabling emails
const FROM_ADDRESS = "StoreOps <hello@storeops.tech>";
const OWNER_EMAIL = process.env.SUPERUSER_EMAILS?.split(",")[0]?.trim() ?? "";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_...") return null; // stub until domain is configured
  return new Resend(key);
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const resend = getResend();
  if (!resend) return; // no-op until RESEND_API_KEY is set

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to StoreOps",
    text: [
      `Hey ${firstName},`,
      "",
      "You're in. StoreOps is set up and ready for your first week of numbers.",
      "",
      "Here's what to do first:",
      "1. Add your location details in the dashboard",
      "2. Enter this week's KPIs",
      "3. Let the system flag what needs your attention",
      "",
      "Reply to this email any time — I read every one.",
      "",
      "— Joe",
    ].join("\n"),
  });
}

export async function sendWaitlistConfirmationEmail(
  to: string,
  firstName: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "You're on the StoreOps waitlist",
    text: [
      `Hey ${firstName || "there"},`,
      "",
      "You're on the list.",
      "",
      "StoreOps is built by someone who took a store from unranked to #19 in the Northeast on every KPI in 30 days. The system that did it — data-driven ordering, visible scoreboard coaching — is what this tool automates.",
      "",
      "I'll reach out personally when we're ready to onboard the first cohort.",
      "",
      "— Joe",
    ].join("\n"),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your StoreOps password",
    text: [
      "You requested a password reset for your StoreOps account.",
      "",
      "Click the link below to set a new password. This link expires in 1 hour.",
      "",
      resetUrl,
      "",
      "If you didn't request this, you can ignore this email — your password won't change.",
    ].join("\n"),
  });
}

export async function sendFeatureSuggestionNotification(
  submission: { email?: string | null; message: string }
): Promise<void> {
  const resend = getResend();
  if (!resend || !OWNER_EMAIL) return;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject: "New feature suggestion",
    text: [
      "New feature suggestion",
      "",
      `From:    ${submission.email ?? "anonymous"}`,
      `Message: ${submission.message}`,
    ].join("\n"),
  });
}

export async function sendWaitlistOwnerNotification(
  submission: {
    email: string;
    firstName?: string;
    role?: string;
    storeCount?: string;
    painPoint?: string;
  }
): Promise<void> {
  const resend = getResend();
  if (!resend || !OWNER_EMAIL) return;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject: `New waitlist signup: ${submission.email}`,
    text: [
      `New waitlist submission`,
      "",
      `Email:       ${submission.email}`,
      `Name:        ${submission.firstName ?? "—"}`,
      `Role:        ${submission.role ?? "—"}`,
      `Store count: ${submission.storeCount ?? "—"}`,
      `Pain point:  ${submission.painPoint ?? "—"}`,
    ].join("\n"),
  });
}

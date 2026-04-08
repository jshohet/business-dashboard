const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteOrigin() {
  const rawSiteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    FALLBACK_SITE_URL;

  try {
    return new URL(rawSiteUrl).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getSiteUrl() {
  return new URL(getSiteOrigin());
}

export function isProductionDeployment() {
  return (process.env.VERCEL_ENV ?? process.env.NODE_ENV) === "production";
}

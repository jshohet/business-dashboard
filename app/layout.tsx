import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import { legalFooterLinks, legalOperatorName } from "@/lib/legal";
import { getSiteUrl, isProductionDeployment } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteName = "StorePilot";
const siteDescription =
  "Retail intelligence platform — sales analytics, smart scheduling, inventory forecasting, and efficiency tracking.";
const siteUrl = getSiteUrl();
const isProduction = isProductionDeployment();

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: siteName,
    description: siteDescription,
    siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: isProduction,
    follow: isProduction,
    googleBot: {
      index: isProduction,
      follow: isProduction,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/dashboard-favicon.svg", type: "image/svg+xml" }],
    shortcut: "/dashboard-favicon.svg",
    apple: "/dashboard-favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-screen flex flex-col">
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}

        <div className="flex-1">{children}</div>

        <footer
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg-raised)",
          }}
          className="px-4 py-5 text-xs sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p style={{ color: "var(--text-3)" }}>
              &copy; {currentYear}{" "}
              <span style={{ color: "var(--text-2)" }}>{legalOperatorName}</span>
            </p>
            <nav aria-label="Legal links">
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                {legalFooterLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{ color: "var(--text-3)" }}
                      className="transition hover:opacity-80 underline underline-offset-3">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

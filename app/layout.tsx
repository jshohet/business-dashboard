import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { legalFooterLinks, legalOperatorName } from "@/lib/legal";
import { getSiteUrl, isProductionDeployment } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Business Dashboard";
const siteDescription =
  "Store operations dashboard with sales, staffing, forecasting, and efficiency tools.";
const siteUrl = getSiteUrl();
const isProduction = isProductionDeployment();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
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
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white/90 px-4 py-6 text-sm text-slate-600 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p>{`Copyright ${currentYear} ${legalOperatorName}`}</p>
            <nav aria-label="Legal links">
              <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {legalFooterLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-500">
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

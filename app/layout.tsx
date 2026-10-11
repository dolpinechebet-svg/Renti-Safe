import type { Metadata } from "next";
import { CookieInit } from "@/components/cookie-init";
import { Floaters } from "@/components/floaters";
import { CookieNotice, Footer, Header } from "@/components/site-shell";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rentisafe.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RentiSafe | Find a home and verify before paying", template: "%s | RentiSafe" },
  description: "Find rental homes in Kenya, arrange a viewing and request an independent property verification.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "RentiSafe", title: "RentiSafe | Find a home and verify before paying", description: "Rental homes, viewings and independent property verification in Kenya.", url: siteUrl, locale: "en_KE" },
  twitter: { card: "summary", title: "RentiSafe | Homes and verification", description: "Rental homes, viewings and independent property verification in Kenya." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-KE"><body>
    <Header />
    <main>{children}</main>
    <Footer />
    <CookieNotice />
    <CookieInit />
    <Floaters message="Hi RentiSafe, I want to verify a house" />
  </body></html>;
}

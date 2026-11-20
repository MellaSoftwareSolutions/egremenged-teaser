import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egremenged.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Egre Menged (እግረ መንገድ) — Turn your daily walk into extra income",
  description:
    "Deliver small packages along routes you already take in Addis Ababa — or send packages securely across campus and town. Fast handoffs, payment protected until drop-off.",
  keywords: [
    "Egre Menged",
    "እግረ መንገድ",
    "Addis Ababa delivery",
    "crowd delivery Ethiopia",
    "commuter delivery",
    "campus delivery Addis Ababa",
    "earn on your daily walk",
    "Telebirr payout",
    "CBE transfer",
  ],
  authors: [{ name: "Egre Menged Team" }],
  creator: "Egre Menged",
  publisher: "Egre Menged",
  openGraph: {
    title: "Egre Menged (እግረ መንገድ) — Turn your daily walk into extra income",
    description:
      "Deliver small packages along routes you already take in Addis Ababa — or send packages securely across campus and town. Fast handoffs, payment protected until drop-off.",
    url: siteUrl,
    siteName: "Egre Menged (እግረ መንገድ)",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Egre Menged (እግረ መንገድ) — Turn your daily walk into extra income",
    description:
      "Deliver small packages along routes you already take in Addis Ababa — or send packages securely across campus and town. Fast handoffs, payment protected until drop-off.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans antialiased selection:bg-[#ECFDF5] selection:text-[#16A34A]`}
      >
        {children}
      </body>
    </html>
  );
}

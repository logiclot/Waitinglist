import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers/SessionProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Buy ready to implement automations for your day to day business`,
  description: `${BRAND_NAME} is a marketplace where businesses buy ready to implement automations and work directly with specialists who deliver them.`,
  openGraph: {
    title: BRAND_NAME,
    description: `${BRAND_NAME} is a marketplace where businesses buy ready to implement automations and work directly with specialists who deliver them.`,
    url: `https://${BRAND_DOMAIN}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <Navbar user={session?.user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

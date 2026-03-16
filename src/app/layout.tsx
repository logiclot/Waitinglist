import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers/SessionProvider";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { prisma } from "@/lib/prisma";
import { Toaster } from "sonner";
import { SavedSolutionsProvider } from "@/hooks/SavedSolutionsContext";
import { SavedSuitesProvider } from "@/hooks/SavedSuitesContext";


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

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — Buy ready to implement automations for your day to day business`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_NAME} is a marketplace where businesses buy ready to implement automations and work directly with specialists who deliver them.`,
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: `${BRAND_NAME} — Automation marketplace`,
    description: `${BRAND_NAME} is a marketplace where businesses buy ready to implement automations and work directly with specialists who deliver them.`,
    url: BASE_URL,
    siteName: BRAND_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${BRAND_NAME} — Automation marketplace` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Automation marketplace`,
    description: `${BRAND_NAME} is a marketplace where businesses buy ready to implement automations and work directly with specialists who deliver them.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "pN5nAN5ZcyOWs4i2JxpHYMgDC7nT0HaOMhPWDc32Dh0",
  },
  manifest: "/manifest.json",
};

import { trackUserLogin } from "@/actions/referral";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  let isFoundingExpert = false;
  if (session?.user?.id) {
    // Track login activity
    await trackUserLogin(session.user.id);
    if (session.user.role === "EXPERT") {
      const expert = await prisma.specialistProfile.findUnique({
        where: { userId: session.user.id },
        select: { isFoundingExpert: true }
      });
      isFoundingExpert = expert?.isFoundingExpert || false;
    }
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LogicLot",
              url: "https://logiclot.io",
              logo: "https://logiclot.io/og.png",
              description: "LogicLot is a B2B marketplace where businesses buy ready-to-implement AI automations and work directly with the specialists who deliver them. Every project runs on milestones with escrow-protected payments.",
              foundingDate: "2025",
              founder: {
                "@type": "Person",
                name: "Claudiu",
              },
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                email: "contact@logiclot.io",
                contactType: "customer service",
              },
              knowsAbout: [
                "AI automation",
                "business process automation",
                "workflow automation",
                "n8n",
                "Make.com",
                "CRM automation",
                "sales automation",
                "marketing automation",
              ],
              slogan: "Buy ready-to-implement automations for your business",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <PostHogProvider>
          <SavedSolutionsProvider>
          <SavedSuitesProvider>
          <Navbar user={session?.user} isFoundingExpert={isFoundingExpert} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            theme="light"
            toastOptions={{
              duration: 2000,
              classNames: {
                toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-muted-foreground',
                actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
              }
            }}
          />
          </SavedSuitesProvider>
          </SavedSolutionsProvider>
          </PostHogProvider>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { CookieConsent, CookieSettingsLink } from "@/components/privacy/CookieConsent";
import { BRAND_NAME } from "@/lib/branding";
import { LogoBrand } from "@/components/LogoBrand";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/waitlist") return null;

  return (
    <footer className="bg-white mt-12 mx-4 mb-4 border border-ash-300 shadow-2xl shadow-ash-200 rounded-2xl">
      <CookieConsent />
      <div className="container mx-auto p-6 md:p-8 xl:p-12">
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <LogoBrand href="/" size="md" />
            <p className="w-60 text-sm mt-4">{BRAND_NAME} is a marketplace connecting businesses with specialists who implement automation.</p>
            <p className="mt-2">Ready-to-use AI automations, implemented by verified experts.</p>
          </div>

          <div>
            <h3 className="text-ash-800 font-noto font-semibold tracking-tight">Company</h3>
            <ul className="text-sm grid gap-2 mt-4">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/stacks" className="hover:text-primary transition-colors">
                  Suites
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-primary transition-colors">
                  Free Audit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-ash-800 font-noto font-semibold tracking-tight">Browse by category</h3>
            <ul className="text-sm grid gap-2 mt-4">
              <li>
                <Link href="/solutions?category=marketing-automation" className="hover:text-primary transition-colors">
                  Marketing Automation
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=sales-crm" className="hover:text-primary transition-colors">
                  Sales & CRM
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=customer-support" className="hover:text-primary transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=data-analysis" className="hover:text-primary transition-colors">
                  Data Analysis
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=finance-operations" className="hover:text-primary transition-colors">
                  Finance & Operations
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=content-creation" className="hover:text-primary transition-colors">
                  Content Creation
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=hr-recruiting" className="hover:text-primary transition-colors">
                  HR & Recruiting
                </Link>
              </li>
              <li>
                <Link href="/solutions?category=other" className="hover:text-primary transition-colors">
                  Other
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-ash-800 font-noto font-semibold tracking-tight">Resources</h3>
            <ul className="text-sm grid gap-2 mt-4">
              <li>
                <Link href="/solutions" className="hover:text-primary transition-colors">
                  Browse Solutions
                </Link>
              </li>
              <li>
                <Link href="/for-businesses" className="hover:text-primary transition-colors">
                  For Businesses
                </Link>
              </li>
              <li>
                <Link href="/for-experts" className="hover:text-primary transition-colors">
                  For Experts
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing / Fees
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-ash-800 font-noto font-semibold tracking-tight">Legal</h3>
            <ul className="text-sm grid gap-2 mt-4">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/tax" className="hover:text-primary transition-colors">
                  Tax & Legal
                </Link>
              </li>
              <li>
                <CookieSettingsLink />
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm flex flex-wrap justify-between gap-2 pt-12">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved</p>
          {/* copyright 7px.ro */}
        </div>
      </div>
    </footer>
  );
}

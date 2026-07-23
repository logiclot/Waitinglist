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
    <footer className="border-t border-border bg-background py-12">
      <CookieConsent />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <LogoBrand href="/" size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ready-to-use AI automations, implemented by verified experts.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
                  Audit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Browse by category</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <p className="mt-2">{BRAND_NAME} is a marketplace connecting businesses with specialists who implement automation.</p>
        </div>
      </div>
    </footer>
  );
}

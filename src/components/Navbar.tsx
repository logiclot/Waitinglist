"use client";

import Link from "next/link";
import { Sparkles, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { BRAND_NAME } from "@/lib/branding";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { Session } from "next-auth";

export function Navbar({ user }: { user?: Session["user"] & { role?: string } }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/waitlist" || pathname === "/") return null;

  const getLinkClass = (href: string) => {
    const isActive = pathname.startsWith(href);
    return `text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "text-primary" 
        : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>{BRAND_NAME}</span>
        </Link>

        {/* Desktop Nav - Exactly 4 items as per spec */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/how-it-works" className={getLinkClass("/how-it-works")}>
            How It Works
          </Link>
          <Link href="/solutions" className={getLinkClass("/solutions")}>
            Browse Solutions
          </Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>
            Pricing
          </Link>
          
          {/* Auth / Join */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors text-foreground"
              >
                <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span>{user.email}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 animate-in fade-in zoom-in-95 z-50 text-foreground">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="font-medium truncate">{user.email}</p>
                    <p className="text-xs text-primary mt-1 capitalize">{user.role?.toLowerCase() || 'User'}</p>
                  </div>

                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm hover:bg-secondary transition-colors font-medium text-primary"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {user.role === 'SPECIALIST' && (
                    <Link 
                      href="/jobs" 
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Browse Jobs (Elite)
                    </Link>
                  )}

                  {user.role === 'BUSINESS' && (
                    <Link 
                      href="/jobs/new" 
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Custom Project
                    </Link>
                  )}

                  {/* Admin Link */}
                  {(user.role === 'ADMIN' || user.email === 'logiclot.helpdesk@gmail.com' || user.email === process.env.ADMIN_EMAIL) && (
                    <Link 
                      href="/admin" 
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname === '/admin' 
                          ? "text-primary bg-primary/5 font-medium" 
                          : "hover:bg-secondary text-warning-500"
                      }`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
            >
              Log In / Join
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/solutions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Solutions
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-2 text-center text-foreground">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-medium text-center py-2 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-medium text-center py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In / Join
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

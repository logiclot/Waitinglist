"use client";

import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, MessageSquare, FolderKanban, Settings, Briefcase, PlusCircle, Layers, ShieldCheck, PanelTop, Gift, Users, BarChart2, Activity, Globe, CircleDollarSign } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { ExpertBadge } from "@/components/ui/ExpertBadge";
import { Avatar } from "@/components/ui/Avatar";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { getFoundingExpertStatus } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFoundingExpert, setIsFoundingExpert] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  useEffect(() => {
    if (user?.role === "EXPERT") {
      getFoundingExpertStatus().then(setIsFoundingExpert);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!isProfileOpen) return;
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileOpen]);

  if (pathname === "/waitlist") return null;

  const getLinkClass = (href: string) => {
    const isActive = pathname.startsWith(href);
    return `text-sm font-medium transition-all duration-200 ${isActive
      ? "text-primary"
      : "text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
      }`;
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <LogoBrand href="/" size="lg" />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/solutions" className={getLinkClass("/solutions")}>
            Browse Solutions
          </Link>
          <Link href="/stacks" className={getLinkClass("/stacks")}>
            Suites
          </Link>
          <Link href="/how-it-works" className={getLinkClass("/how-it-works")}>
            How It Works
          </Link>
          <Link href="/docs" className={getLinkClass("/docs")}>
            Documentation
          </Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>
            Pricing
          </Link>
          <Link
            href="/audit"
            className={`text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-full border ${pathname.startsWith("/audit")
              ? "border-primary bg-primary/10 text-primary"
              : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
          >
            Free Audit
          </Link>

          {/* Auth / Join */}
          {isLoading ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <NotificationDropdown />
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground"
                >
                  <Avatar
                    src={user.image}
                    name={user.name || user.email?.split("@")[0] || "User"}
                    size="xs"
                  />
                  <span className="max-w-[120px] truncate text-foreground/80">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                  {isFoundingExpert && (
                    <span className="hidden md:inline-flex">
                      <ExpertBadge isFoundingExpert />
                    </span>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 z-50 text-foreground">
                    {/* User identity */}
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.image}
                          name={user.name || user.email?.split("@")[0] || "User"}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{user.name || user.email?.split("@")[0]}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick links */}
                    <div className="py-1">
                      {user.role === 'ADMIN' && (
                        <DropdownLink href="/admin" icon={ShieldCheck} label="Admin Dashboard" onClick={() => setIsProfileOpen(false)} />
                      )}

                      {user.role !== 'ADMIN' && (
                        <DropdownLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsProfileOpen(false)} />
                      )}

                      <DropdownLink href="/dashboard/messages" icon={MessageSquare} label="Messages" onClick={() => setIsProfileOpen(false)} />

                      {user.role === 'EXPERT' && (
                        <>
                          <DropdownLink href="/expert/projects" icon={FolderKanban} label="Projects" onClick={() => setIsProfileOpen(false)} />
                          <DropdownLink href="/expert/my-solutions" icon={Layers} label="My Solutions" onClick={() => setIsProfileOpen(false)} />
                          <DropdownLink href="/jobs" icon={Briefcase} label="Browse Jobs" onClick={() => setIsProfileOpen(false)} />
                        </>
                      )}

                      {user.role === 'BUSINESS' && (
                        <>
                          <DropdownLink href="/business/projects" icon={FolderKanban} label="My Projects" onClick={() => setIsProfileOpen(false)} />
                          <DropdownLink href="/business/add-request" icon={PlusCircle} label="Post a Request" onClick={() => setIsProfileOpen(false)} />
                        </>
                      )}
                    </div>

                    {/* Settings & Sign out */}
                    <div className="border-t border-border py-1">
                      {user.role !== 'ADMIN' && (
                        <DropdownLink
                          href={user.role === 'EXPERT' ? '/expert/settings' : '/business/settings'}
                          icon={Settings}
                          label="Settings"
                          onClick={() => setIsProfileOpen(false)}
                        />
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2.5"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
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
              href="/solutions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Solutions
            </Link>
            <Link
              href="/stacks"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Suites
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Documentation
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/audit"
              className="text-sm font-semibold text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Free Audit →
            </Link>

            <div className="border-t border-border pt-4 flex flex-col gap-3">
              {isLoading ? (
                <div className="flex items-center gap-3 px-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-2">
                    <Avatar
                      src={user.image}
                      name={user.name || user.email?.split("@")[0] || "User"}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{user.name || user.email?.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isFoundingExpert && <ExpertBadge isFoundingExpert />}
                  </div>

                  <div className="flex flex-col gap-1">
                    {user.role === 'ADMIN' && (
                      <>
                        <MobileMenuLink href="/admin" icon={ShieldCheck} label="Admin Dashboard" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/old-admin" icon={PanelTop} label="Old Admin Panel" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/gift-scans" icon={Gift} label="Gift Scan" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/post-on-behalf" icon={Users} label="Post on Behalf" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/audit-analytics" icon={BarChart2} label="Audit Analytics" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/job-analytics" icon={Activity} label="Job Analytics" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/traffic" icon={Globe} label="Traffic" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/admin/payouts" icon={CircleDollarSign} label="Payouts" onClick={() => setIsMenuOpen(false)} />
                      </>
                    )}
                    {user.role !== 'ADMIN' && (
                      <MobileMenuLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                    )}
                    <MobileMenuLink href="/dashboard/messages" icon={MessageSquare} label="Messages" onClick={() => setIsMenuOpen(false)} />

                    {user.role === 'EXPERT' && (
                      <>
                        <MobileMenuLink href="/expert/projects" icon={FolderKanban} label="Projects" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/expert/my-solutions" icon={Layers} label="My Solutions" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/jobs" icon={Briefcase} label="Browse Jobs" onClick={() => setIsMenuOpen(false)} />
                      </>
                    )}

                    {user.role === 'BUSINESS' && (
                      <>
                        <MobileMenuLink href="/business/projects" icon={FolderKanban} label="My Projects" onClick={() => setIsMenuOpen(false)} />
                        <MobileMenuLink href="/business/add-request" icon={PlusCircle} label="Post a Request" onClick={() => setIsMenuOpen(false)} />
                      </>
                    )}

                    {user.role !== 'ADMIN' && (
                      <MobileMenuLink
                        href={user.role === 'EXPERT' ? '/expert/settings' : '/business/settings'}
                        icon={Settings}
                        label="Settings"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-medium text-center py-2 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
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

/** Reusable mobile menu link */
function MobileMenuLink({ href, icon: Icon, label, onClick }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}

/** Reusable dropdown menu link */
function DropdownLink({ href, icon: Icon, label, onClick }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}

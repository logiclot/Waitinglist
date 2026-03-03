"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/actions/notifications";
import { 
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Search,
  FileText,
  CheckCircle,
  BarChart2,
  DollarSign,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  Layers,
  Package,
  Briefcase as ProjectsIcon,
  ShieldCheck,
  MessageCircle,
  Users,
  Activity,
  Globe,
  Lock,
} from "lucide-react";

interface SidebarProps {
  role: "BUSINESS" | "EXPERT" | "ADMIN";
  isFoundingExpert?: boolean;
  portfolioSlug?: string | null;
  publishedSolutionCount?: number;
}

export function Sidebar({ role, isFoundingExpert: _isFoundingExpert, portfolioSlug, publishedSolutionCount = 0 }: SidebarProps) {
  void _isFoundingExpert;
  const suitesLocked = role === "EXPERT" && publishedSolutionCount < 3;
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount);
  }, [pathname]); // Refetch when navigating (e.g. after reading notifications)

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (pathname.startsWith(path + "/")) return true;
    // "Post a Request" hub is also active when inside the wizard pages
    if (path === "/business/add-request" && (pathname.startsWith("/jobs/new") || pathname.startsWith("/jobs/discovery"))) return true;
    // "Find Work" is active on any /jobs route for experts
    if (path === "/jobs" && pathname.startsWith("/jobs")) return true;
    return false;
  };

  // Expert Navigation — ordered by workflow: engage → deliver → manage → review
  const expertLinks = [
    { label: "Overview",        href: "/dashboard",           icon: LayoutDashboard },
    { label: "Messages",        href: "/dashboard/messages",  icon: MessageSquare },
    { label: "Active Projects", href: "/expert/projects",     icon: ProjectsIcon },
    { label: "Active Bids",     href: "/expert/active-bids",  icon: FileText },
    { label: "Find Work",       href: "/jobs",                icon: Search },
    { label: "Add Solution",    href: "/expert/add-solution", icon: PlusCircle },
    { label: "My Solutions",    href: "/expert/my-solutions", icon: Layers },
    ...(portfolioSlug ? [{ label: "My Portfolio", href: `/p/${portfolioSlug}`, icon: Globe }] : []),
    { label: "Suites",          href: "/expert/ecosystems",   icon: Package },
    { label: "Completed",       href: "/expert/completed",    icon: CheckCircle },
    { label: "Earnings",        href: "/expert/earnings",     icon: DollarSign },
  ];

  const expertBottom = [
    { label: "Feedback",      href: "/dashboard/feedback",   icon: MessageCircle },
    { label: "Notifications", href: "/expert/notifications", icon: Bell },
    { label: "Settings",      href: "/expert/settings",      icon: Settings },
  ];

  // Business Navigation — ordered by buyer journey: discover → request → track → admin
  const businessLinks = [
    { label: "Overview",         href: "/dashboard",             icon: LayoutDashboard },
    { label: "Browse Solutions", href: "/solutions",             icon: Search },
    { label: "Post a Request",   href: "/business/add-request",  icon: PlusCircle },
    { label: "My Projects",      href: "/business/projects",     icon: ProjectsIcon },
    { label: "Messages",         href: "/dashboard/messages",    icon: MessageSquare },
    { label: "Results",          href: "/business/results",      icon: BarChart2 },
    { label: "Billing",          href: "/business/billing",      icon: CreditCard },
    { label: "Help & Onboarding",href: "/business/help",         icon: HelpCircle },
  ];

  const businessBottom = [
    { label: "Feedback",      href: "/dashboard/feedback",    icon: MessageCircle },
    { label: "Notifications", href: "/business/notifications", icon: Bell },
    { label: "Settings",      href: "/business/settings",      icon: Settings },
  ];

  const links = role === "EXPERT" ? expertLinks : businessLinks;
  const bottomLinks = role === "EXPERT" ? expertBottom : businessBottom;

  const adminLinks = role === "ADMIN"
    ? [
        { label: "Admin",           href: "/admin",                 icon: ShieldCheck },
        { label: "Post on Behalf",  href: "/admin/post-on-behalf",  icon: Users },
        { label: "Audit Analytics", href: "/admin/audit-analytics", icon: BarChart2 },
        { label: "Job Analytics",   href: "/admin/job-analytics",   icon: Activity },
        { label: "Traffic",         href: "/admin/traffic",         icon: Globe },
      ]
    : [];

  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          const isLockedSuites = link.label === "Suites" && suitesLocked;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary"
                  : isLockedSuites
                  ? "text-muted-foreground/50 hover:bg-secondary hover:text-muted-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{link.label}</span>
              {isLockedSuites && (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive(link.href)
                ? "bg-primary/10 text-primary"
                : "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
            }`}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          const showUnreadDot = link.label === "Notifications" && unreadCount > 0;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="relative">
                <Icon className="h-4 w-4" />
                {showUnreadDot && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-background animate-pulse" />
                )}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

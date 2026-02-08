"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  BarChart2, 
  DollarSign, 
  Bell, 
  Settings, 
  HelpCircle,
  CreditCard,
  Building2,
  Layers,
  Compass,
  Briefcase as ProjectsIcon // Using Briefcase for Projects/Work
} from "lucide-react";

interface SidebarProps {
  role: "BUSINESS" | "SPECIALIST" | "ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  // Expert Navigation
  const expertPrimary = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Find Work", href: "/expert/find-work", icon: Search },
    { label: "Add Solution", href: "/expert/add-solution", icon: PlusCircle },
    { label: "Messages", href: "/expert/messages", icon: MessageSquare },
    { label: "Active Projects", href: "/expert/projects", icon: ProjectsIcon },
    { label: "Active Bids", href: "/expert/active-bids", icon: FileText },
    { label: "My Solutions", href: "/expert/my-solutions", icon: Layers }, // Renamed from Solution Pool
    { label: "Completed", href: "/expert/completed", icon: CheckCircle },
    { label: "Performance", href: "/expert/performance", icon: BarChart2 },
    { label: "Earnings", href: "/expert/earnings", icon: DollarSign },
  ];

  const expertFeeds = [
    { label: "Discovery Scan Feed", href: "/expert/discovery", icon: Compass },
    { label: "Custom Projects Feed", href: "/expert/custom-projects", icon: Briefcase },
  ];

  const expertLinks = [
    expertPrimary[0], // Overview
    ...expertFeeds,
    expertPrimary[2], // Add Solution
    expertPrimary[3], // Messages
    expertPrimary[6], // My Solutions
    expertPrimary[5], // Active Bids
    expertPrimary[4], // Active Projects
    expertPrimary[7], // Completed
    expertPrimary[8], // Performance
    expertPrimary[9], // Earnings
  ];

  const expertBottom = [
    { label: "Notifications", href: "/expert/notifications", icon: Bell },
    { label: "Settings", href: "/expert/settings", icon: Settings },
  ];

  // Business Navigation
  const businessLinks = [
    { label: "Overview", href: "/business", icon: LayoutDashboard },
    { label: "Add Request", href: "/business/add-request", icon: PlusCircle },
    { label: "Messages", href: "/business/messages", icon: MessageSquare }, // Wraps or redirects to /inbox
    { label: "Browse Solutions", href: "/business/solutions", icon: Search }, // Can use existing /solutions or wrap
    // Removed duplicate "Request Automation"
    { label: "My Projects", href: "/business/projects", icon: Briefcase },
    { label: "Results", href: "/business/results", icon: BarChart2 },
    { label: "Billing", href: "/business/billing", icon: CreditCard }, // Renamed from Billing & Plans
    { label: "Help & Onboarding", href: "/business/help", icon: HelpCircle },
    { label: "Company Profile", href: "/business/company", icon: Building2 },
  ];

  const businessBottom = [
    { label: "Notifications", href: "/business/notifications", icon: Bell },
    { label: "Settings", href: "/business/settings", icon: Settings },
  ];

  const links = role === "SPECIALIST" ? expertLinks : businessLinks;
  const bottomLinks = role === "SPECIALIST" ? expertBottom : businessBottom;

  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

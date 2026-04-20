"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/actions/notifications";
import { getUnreadConversationCount } from "@/actions/messaging";
import { getPendingInviteCount } from "@/actions/ecosystems";
import { getUnseenInvoiceCount } from "@/actions/invoices";
import { getUnseenJobCount } from "@/actions/jobs";
import { getPublishedSolutionCount } from "@/actions/solutions";
import { getActionNeededProjectCount } from "@/actions/orders";
import {
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Search,
  FileText,
  BarChart2,
  Bell,
  Settings,
  Layers,
  Package,
  Briefcase as ProjectsIcon,
  ShieldCheck,
  MessageCircle,
  Users,
  Activity,
  Globe,
  Lock,
  ClipboardList,
  CircleDollarSign as Money,
  Gift,
  PanelTop,
} from "lucide-react";

interface SidebarProps {
  role: "BUSINESS" | "EXPERT" | "ADMIN";
  isFoundingExpert?: boolean;
  portfolioSlug?: string | null;
  publishedSolutionCount?: number;
}

export function Sidebar({
  role,
  isFoundingExpert: _isFoundingExpert,
  portfolioSlug,
}: SidebarProps) {
  void _isFoundingExpert;
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [unseenInvoices, setUnseenInvoices] = useState(0);
  const [unseenJobs, setUnseenJobs] = useState(0);
  const [projectActions, setProjectActions] = useState(0);
  const [showFeedbackBubble, setShowFeedbackBubble] = useState(false);
  const [pubSolCount, setPubSolCount] = useState(0);
  const suitesLocked = role === "EXPERT" && pubSolCount < 3;

  useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount);
    getUnreadConversationCount().then(setUnreadMessages);
    getUnseenInvoiceCount().then(setUnseenInvoices);
    getActionNeededProjectCount().then(setProjectActions);
    if (role === "EXPERT") {
      getPendingInviteCount().then(setPendingInvites);
      getUnseenJobCount().then(setUnseenJobs);
      getPublishedSolutionCount().then(setPubSolCount);
    }
  }, [pathname, role]); // Refetch when navigating (e.g. after reading notifications/messages)

  // Show "5%" bubble on Feedback link until the survey is actually completed
  useEffect(() => {
    fetch("/api/feedback/survey/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.completed) setShowFeedbackBubble(true);
      })
      .catch(() => {
        // If fetch fails, show the bubble as a safe default
        setShowFeedbackBubble(true);
      });
  }, []);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (pathname.startsWith(path + "/")) return true;
    if (pathname === path) return true;
    // "Post a Request" hub is also active when inside the wizard pages
    if (
      path === "/business/add-request" &&
      (pathname.startsWith("/jobs/new") ||
        pathname.startsWith("/jobs/discovery"))
    )
      return true;
    // "Find Work" is active on any /jobs route for experts
    if (path === "/jobs" && pathname.startsWith("/jobs")) return true;
    return false;
  };

  // Expert Navigation — ordered by workflow: engage → deliver → manage → review
  const expertLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Projects", href: "/expert/projects", icon: ProjectsIcon },
    { label: "Active Bids", href: "/expert/active-bids", icon: FileText },
    { label: "Find Work", href: "/jobs", icon: Search },
    { label: "Add Solution", href: "/expert/add-solution", icon: PlusCircle },
    { label: "My Solutions", href: "/expert/my-solutions", icon: Layers },
    ...(portfolioSlug
      ? [{ label: "My Portfolio", href: `/p/${portfolioSlug}`, icon: Globe }]
      : []),
    { label: "Suites", href: "/expert/ecosystems", icon: Package },
    { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  ];

  const expertBottom = [
    { label: "Feedback", href: "/dashboard/feedback", icon: MessageCircle },
    { label: "Notifications", href: "/expert/notifications", icon: Bell },
    { label: "Settings", href: "/expert/settings", icon: Settings },
  ];

  // Business Navigation — ordered by buyer journey: discover → request → track → admin
  const businessLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse Solutions", href: "/solutions", icon: Search },
    {
      label: "Post a Request",
      href: "/business/add-request",
      icon: PlusCircle,
    },
    { label: "My Requests", href: "/jobs", icon: ClipboardList },
    { label: "My Projects", href: "/business/projects", icon: ProjectsIcon },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  ];

  const businessBottom = [
    { label: "Feedback", href: "/dashboard/feedback", icon: MessageCircle },
    { label: "Notifications", href: "/business/notifications", icon: Bell },
    { label: "Settings", href: "/business/settings", icon: Settings },
  ];

  const links = role === "EXPERT" ? expertLinks : businessLinks;
  const bottomLinks = role === "EXPERT" ? expertBottom : businessBottom;

  const adminLinks =
    role === "ADMIN"
      ? [
        { label: "Admin", href: "/admin", icon: ShieldCheck },
        {
          label: "Old Admin Panel",
          href: "/admin/old-admin",
          icon: PanelTop,
        },
        { label: "Gift Scan", href: "/admin/gift-scans", icon: Gift },
        {
          label: "Post on Behalf",
          href: "/admin/post-on-behalf",
          icon: Users,
        },
        {
          label: "Audit Analytics",
          href: "/admin/audit-analytics",
          icon: BarChart2,
        },
        {
          label: "Job Analytics",
          href: "/admin/job-analytics",
          icon: Activity,
        },
        { label: "Traffic", href: "/admin/traffic", icon: Globe },
        { label: "Payouts", href: "/admin/payouts", icon: Money },
      ]
      : [];

  return (
    <>
      {/* Mobile Admin Nav — horizontally scrollable strip */}
      {adminLinks.length > 0 && (
        <nav
          aria-label="Admin"
          className="md:hidden sticky top-16 z-40 bg-card border-b border-border overflow-x-auto"
        >
          <div className="flex items-center gap-1 px-3 py-2 min-w-max">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-200 ${active
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-amber-600 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          const isLockedSuites = link.label === "Suites" && suitesLocked;
          const isMessages = link.label === "Messages";
          const showMessageBadge = isMessages && unreadMessages > 0;
          const isSuites = link.label === "Suites";
          const showInviteBadge = isSuites && pendingInvites > 0;
          const isFindWork = link.label === "Find Work";
          const showJobsBadge = isFindWork && unseenJobs > 0;
          const isInvoices = link.label === "Invoices";
          const showInvoiceBadge = isInvoices && unseenInvoices > 0;
          const isProjects =
            link.label === "Projects" || link.label === "My Projects";
          const showProjectBadge = isProjects && projectActions > 0;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${active
                ? "bg-primary/10 text-primary"
                : isLockedSuites
                  ? "text-muted-foreground/50 hover:bg-secondary hover:text-muted-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <span className="relative">
                <Icon className="h-4 w-4" />
                {showMessageBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
                {showInviteBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-blue-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {pendingInvites > 99 ? "99+" : pendingInvites}
                  </span>
                )}
                {showJobsBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {unseenJobs > 99 ? "99+" : unseenJobs}
                  </span>
                )}
                {showInvoiceBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {unseenInvoices > 99 ? "99+" : unseenInvoices}
                  </span>
                )}
                {showProjectBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {projectActions > 99 ? "99+" : projectActions}
                  </span>
                )}
              </span>
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
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive(link.href)
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
          const showUnreadDot =
            link.label === "Notifications" && unreadCount > 0;
          const isFeedback = link.label === "Feedback";

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <span className="relative">
                <Icon className="h-4 w-4" />
                {showUnreadDot && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[9px] font-bold text-white leading-none px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
              <span className="flex-1">{link.label}</span>
              {isFeedback && showFeedbackBubble && (
                <span className="relative ml-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white shadow-sm animate-bounce">
                    5%
                  </span>
                  {/* Speech bubble tail */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-green-500" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
      </aside>
    </>
  );
}

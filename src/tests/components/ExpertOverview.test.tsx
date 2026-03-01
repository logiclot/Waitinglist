import React from "react";
import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpertOverview } from "@/components/dashboard/ExpertOverview";

// Mock next/link to render plain anchors
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockData = {
  isFirstTime: false,
  displayName: "Jane Expert",
  thisMonthEarnedCents: 245000,
  pendingCents: 80000,
  actions: [
    { type: "warning" as const, title: "Connect Stripe to get paid", description: "You need a Stripe account.", href: "/expert/settings" },
    { type: "info" as const, title: "Add your scheduling link", description: "Let clients book demos.", href: "/expert/settings" },
  ],
  activeOrders: [
    { id: "o1", title: "HubSpot Data Clean", buyerEmail: "acme@corp.com", status: "in_progress" },
  ],
  jobPosts: [
    { id: "j1", title: "CRM Integration Needed", budgetRange: "$500–$1,500", createdAt: "2026-01-15T00:00:00Z" },
  ],
  topSolution: { id: "s1", title: "Lead Scoring System", category: "Sales Automation", orderCount: 12 },
  solutionCount: 3,
};

describe("ExpertOverview", () => {
  it("renders earnings summary cards", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows 'Priority Actions' heading", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("Priority Actions")).toBeInTheDocument();
  });

  it("shows priority action items", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("Connect Stripe to get paid")).toBeInTheDocument();
    expect(screen.getByText("Add your scheduling link")).toBeInTheDocument();
  });

  it("shows New Opportunities section", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("New Opportunities")).toBeInTheDocument();
    expect(screen.getByText("View Feed \u2192")).toBeInTheDocument();
  });

  it("shows Active Projects section", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("HubSpot Data Clean")).toBeInTheDocument();
  });

  it("shows Top Solution section", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("Lead Scoring System")).toBeInTheDocument();
    expect(screen.getByText("Sales Automation")).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText(/get you paid/i)).toBeInTheDocument();
  });

  it("shows first-time onboarding when isFirstTime is true", () => {
    render(<ExpertOverview data={{ ...mockData, isFirstTime: true }} />);
    expect(screen.getByText("Welcome to the Expert Network")).toBeInTheDocument();
    expect(screen.getByText("Complete Profile")).toBeInTheDocument();
  });

  it("shows Optimize Listing button in Top Solution section", () => {
    render(<ExpertOverview data={mockData} />);
    expect(screen.getByText("Optimize Listing")).toBeInTheDocument();
  });
});

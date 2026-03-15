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

describe("ExpertOverview", () => {
  it("renders earnings summary cards", () => {
    render(<ExpertOverview earningsThisMonthCents={245000} inEscrowCents={80000} />);
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("In Escrow")).toBeInTheDocument();
  });

  it("shows 'Priority Actions' heading when no calendar URL", () => {
    render(<ExpertOverview hasCalendarUrl={false} />);
    expect(screen.getByText("Priority Actions")).toBeInTheDocument();
  });

  it("shows calendar link action when hasCalendarUrl is false", () => {
    render(<ExpertOverview hasCalendarUrl={false} />);
    expect(screen.getByText("Link Work Calendar")).toBeInTheDocument();
  });

  it("shows New Opportunities section", () => {
    render(<ExpertOverview />);
    expect(screen.getByText("New Opportunities")).toBeInTheDocument();
  });

  it("shows Active Projects section", () => {
    render(
      <ExpertOverview
        activeOrders={[
          { id: "o1", status: "in_progress", solutionTitle: "HubSpot Data Clean", buyerName: "Acme Corp" },
        ]}
      />
    );
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("HubSpot Data Clean")).toBeInTheDocument();
  });

  it("shows Top Solution section", () => {
    render(
      <ExpertOverview
        topSolution={{ id: "s1", title: "Lead Scoring System", category: "Sales Automation", completedSalesCount: 12 }}
      />
    );
    expect(screen.getByText("Lead Scoring System")).toBeInTheDocument();
    expect(screen.getByText("Sales Automation")).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<ExpertOverview />);
    expect(screen.getByText(/Build once\. Earn on every delivery\./)).toBeInTheDocument();
  });

  it("shows founding expert badge when isFoundingExpert is true", () => {
    render(<ExpertOverview isFoundingExpert={true} />);
    expect(screen.getByText("Founder", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("11% Fee")).toBeInTheDocument();
  });

  it("shows Improve Listing button in Top Solution section", () => {
    render(
      <ExpertOverview
        topSolution={{ id: "s1", title: "Lead Scoring System", category: "Sales Automation", completedSalesCount: 12 }}
      />
    );
    expect(screen.getByText("Improve Listing")).toBeInTheDocument();
  });
});

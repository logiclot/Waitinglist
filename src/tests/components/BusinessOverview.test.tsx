import React from "react";
import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import type { RecommendedSolution } from "@/lib/recommendation-engine";

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

function makeSolution(overrides: Partial<RecommendedSolution> = {}): RecommendedSolution {
  return {
    id: "sol-1",
    slug: "crm-automation",
    title: "CRM Automation Suite",
    category: "Sales",
    shortSummary: "Automate your CRM data pipeline.",
    outcome: "Reduce manual entry by 90%",
    implementationPriceCents: 75000,
    deliveryDays: 14,
    integrations: ["Salesforce", "HubSpot"],
    expertName: "Jane Expert",
    expertSlug: "jane-expert",
    expertVerified: true,
    orderCount: 5,
    ...overrides,
  };
}

describe("BusinessOverview", () => {
  it("renders the main heading", () => {
    render(<BusinessOverview />);
    expect(
      screen.getByText(/automate your operations/i)
    ).toBeInTheDocument();
  });

  it("shows 'Recommended for you' heading", () => {
    render(<BusinessOverview />);
    expect(screen.getByText("Recommended for you")).toBeInTheDocument();
  });

  it("renders solution cards when recommendations provided", () => {
    const solutions = [
      makeSolution({ id: "sol-1", title: "CRM Automation Suite", slug: "crm-auto" }),
      makeSolution({ id: "sol-2", title: "Email Marketing Bot", slug: "email-bot", category: "Marketing" }),
    ];
    render(<BusinessOverview recommendations={solutions} />);
    expect(screen.getByText("CRM Automation Suite")).toBeInTheDocument();
    expect(screen.getByText("Email Marketing Bot")).toBeInTheDocument();
  });

  it("shows category badges on solution cards", () => {
    const solutions = [makeSolution({ category: "Sales" })];
    render(<BusinessOverview recommendations={solutions} />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("shows empty state when no recommendations", () => {
    render(<BusinessOverview recommendations={[]} />);
    expect(screen.getByText("No personalised recommendations yet.")).toBeInTheDocument();
    expect(screen.getByText("Browse all solutions")).toBeInTheDocument();
  });

  it("shows empty state when recommendations prop is omitted", () => {
    render(<BusinessOverview />);
    expect(screen.getByText("No personalised recommendations yet.")).toBeInTheDocument();
  });

  it("shows 'How it works' section", () => {
    render(<BusinessOverview />);
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Choose or request")).toBeInTheDocument();
    expect(screen.getByText("Expert builds & deploys")).toBeInTheDocument();
    expect(screen.getByText("Review & go live")).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<BusinessOverview />);
    expect(screen.getByText("Post a Discovery Scan")).toBeInTheDocument();
    expect(screen.getByText("Post a Custom Project")).toBeInTheDocument();
  });

  it("shows delivery days on solution cards", () => {
    const solutions = [makeSolution({ deliveryDays: 14 })];
    render(<BusinessOverview recommendations={solutions} />);
    expect(screen.getByText("14 days")).toBeInTheDocument();
  });

  it("shows integrations on solution cards", () => {
    const solutions = [makeSolution({ integrations: ["Salesforce", "HubSpot", "Slack"] })];
    render(<BusinessOverview recommendations={solutions} />);
    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Slack")).toBeInTheDocument();
  });

  it("shows verified badge when expertVerified is true", () => {
    const solutions = [makeSolution({ expertVerified: true })];
    render(<BusinessOverview recommendations={solutions} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
});

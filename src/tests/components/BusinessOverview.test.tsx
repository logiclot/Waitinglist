import React from "react";
import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";

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

function makeSolution(overrides: Record<string, unknown> = {}) {
  return {
    id: "sol-1",
    slug: "crm-automation",
    title: "CRM Automation Suite",
    description: "Automate your CRM data pipeline.",
    category: "Sales",
    implementationPrice: 750,
    deliveryDays: 14,
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

  it("renders solution cards when recommendedSolutions provided", () => {
    const solutions = [
      makeSolution({ id: "sol-1", title: "CRM Automation Suite", slug: "crm-auto" }),
      makeSolution({ id: "sol-2", title: "Email Marketing Bot", slug: "email-bot", category: "Marketing" }),
    ];
    render(<BusinessOverview recommendedSolutions={solutions} />);
    expect(screen.getByText("CRM Automation Suite")).toBeInTheDocument();
    expect(screen.getByText("Email Marketing Bot")).toBeInTheDocument();
  });

  it("shows category badges on solution cards", () => {
    const solutions = [makeSolution({ category: "Sales" })];
    render(<BusinessOverview recommendedSolutions={solutions} />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("shows empty state when no recommendedSolutions", () => {
    render(<BusinessOverview recommendedSolutions={[]} />);
    expect(screen.getByText(/Browse the solution library/)).toBeInTheDocument();
  });

  it("shows 'How it works' section when no active orders", () => {
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
    render(<BusinessOverview recommendedSolutions={solutions} />);
    expect(screen.getByText("14 days")).toBeInTheDocument();
  });
});

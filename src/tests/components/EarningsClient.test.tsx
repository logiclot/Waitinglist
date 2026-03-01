import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EarningsClient } from "@/app/expert/earnings/EarningsClient";

// Mock fetch for Stripe dashboard link
const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeEarningsData(overrides: Record<string, unknown> = {}) {
  return {
    totalEarnedCents: 150000,
    inEscrowCents: 30000,
    commissionRate: 15,
    tier: "STANDARD",
    isFoundingExpert: null,
    completedSalesCount: 3,
    stripeConnected: true,
    transactions: [
      {
        date: "2025-06-15",
        orderTitle: "CRM Integration",
        milestoneTitle: "Phase 1",
        grossCents: 50000,
        feePercent: 15,
        netCents: 42500,
      },
    ],
    monthlyBreakdown: [
      {
        month: "2025-06",
        earnedCents: 42500,
        orderCount: 1,
      },
    ],
    ...overrides,
  };
}

describe("EarningsClient", () => {
  it("shows total earned amount", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    // formatEur(150000) => "EUR 1,500.00" in en-IE locale
    // The exact format depends on the Intl implementation.
    // We look for the text content within the card that shows Total Earned.
    expect(screen.getByText("Total Earned")).toBeInTheDocument();
    // The formatted amount should appear somewhere
    const totalCard = screen.getByText("Total Earned").closest("div[class*='rounded-xl']");
    expect(totalCard).toBeTruthy();
    expect(totalCard!.textContent).toContain("1,500");
  });

  it("shows in-escrow amount", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("In Escrow")).toBeInTheDocument();
    const escrowCard = screen.getByText("In Escrow").closest("div[class*='rounded-xl']");
    expect(escrowCard).toBeTruthy();
    expect(escrowCard!.textContent).toContain("300");
  });

  it("shows commission rate", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("Commission Rate")).toBeInTheDocument();
    // "15%" appears both in the commission card and in the transaction table fee column,
    // so we verify at least one instance exists.
    const matches = screen.getAllByText("15%");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows tier badge", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("shows founding badge when isFoundingExpert", () => {
    render(<EarningsClient data={makeEarningsData({ isFoundingExpert: true })} />);
    expect(screen.getByText("Founding")).toBeInTheDocument();
  });

  it("shows 'View Stripe Dashboard' button when stripe connected", () => {
    render(<EarningsClient data={makeEarningsData({ stripeConnected: true })} />);
    expect(screen.getByText("View Stripe Dashboard")).toBeInTheDocument();
  });

  it("does not show 'View Stripe Dashboard' button when stripe not connected", () => {
    render(<EarningsClient data={makeEarningsData({ stripeConnected: false })} />);
    expect(screen.queryByText("View Stripe Dashboard")).not.toBeInTheDocument();
  });

  it("shows transaction table with rows", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("CRM Integration")).toBeInTheDocument();
    expect(screen.getByText("Phase 1")).toBeInTheDocument();
    // Table headers
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Milestone")).toBeInTheDocument();
    expect(screen.getByText("Gross")).toBeInTheDocument();
    expect(screen.getByText("Net")).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    render(<EarningsClient data={makeEarningsData({ transactions: [] })} />);
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    expect(
      screen.getByText("Completed milestone payouts will appear here.")
    ).toBeInTheDocument();
  });

  it("shows monthly breakdown when data exists", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("Monthly Breakdown")).toBeInTheDocument();
    // "June 2025" for en-IE locale
    expect(screen.getByText(/June 2025/)).toBeInTheDocument();
  });

  it("does not show monthly breakdown when empty", () => {
    render(<EarningsClient data={makeEarningsData({ monthlyBreakdown: [] })} />);
    expect(screen.queryByText("Monthly Breakdown")).not.toBeInTheDocument();
  });

  it("shows completed sales count", () => {
    render(<EarningsClient data={makeEarningsData()} />);
    expect(screen.getByText("Completed Sales")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

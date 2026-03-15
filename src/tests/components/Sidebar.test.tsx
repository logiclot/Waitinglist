import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/dashboard/Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/business"),
}));

// Mock server actions called in useEffect
vi.mock("@/actions/notifications", () => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/messaging", () => ({
  getUnreadConversationCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/ecosystems", () => ({
  getPendingInviteCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/invoices", () => ({
  getUnseenInvoiceCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/jobs", () => ({
  getUnseenJobCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/solutions", () => ({
  getPublishedSolutionCount: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/actions/orders", () => ({
  getActionNeededProjectCount: vi.fn().mockResolvedValue(0),
}));

// Mock fetch for feedback survey status
globalThis.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({ completed: true }),
}) as unknown as typeof fetch;

describe("Sidebar", () => {
  describe("Business role", () => {
    it("shows business-specific links", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Post a Request")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("Browse Solutions")).toBeInTheDocument();
      expect(screen.getByText("My Projects")).toBeInTheDocument();
      expect(screen.getByText("My Requests")).toBeInTheDocument();
      expect(screen.getByText("Invoices")).toBeInTheDocument();
    });

    it("does not show expert-specific links for business", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.queryByText("Find Work")).not.toBeInTheDocument();
      expect(screen.queryByText("Add Solution")).not.toBeInTheDocument();
      expect(screen.queryByText("My Solutions")).not.toBeInTheDocument();
      expect(screen.queryByText("Active Bids")).not.toBeInTheDocument();
    });

    it("has correct href attributes for business links", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Overview").closest("a")).toHaveAttribute("href", "/dashboard");
      expect(screen.getByText("Post a Request").closest("a")).toHaveAttribute("href", "/business/add-request");
      expect(screen.getByText("Browse Solutions").closest("a")).toHaveAttribute("href", "/solutions");
      expect(screen.getByText("My Projects").closest("a")).toHaveAttribute("href", "/business/projects");
      expect(screen.getByText("Invoices").closest("a")).toHaveAttribute("href", "/dashboard/invoices");
    });

    it("shows bottom section links for business", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Feedback")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Notifications").closest("a")).toHaveAttribute("href", "/business/notifications");
      expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/business/settings");
    });
  });

  describe("Expert (EXPERT) role", () => {
    it("shows expert-specific links", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Projects")).toBeInTheDocument();
      expect(screen.getByText("Find Work")).toBeInTheDocument();
      expect(screen.getByText("Add Solution")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("My Solutions")).toBeInTheDocument();
      expect(screen.getByText("Active Bids")).toBeInTheDocument();
      expect(screen.getByText("Suites")).toBeInTheDocument();
      expect(screen.getByText("Invoices")).toBeInTheDocument();
    });

    it("does not show business-specific links for expert", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.queryByText("Post a Request")).not.toBeInTheDocument();
      expect(screen.queryByText("Browse Solutions")).not.toBeInTheDocument();
      expect(screen.queryByText("My Requests")).not.toBeInTheDocument();
    });

    it("has correct href attributes for expert links", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.getByText("Overview").closest("a")).toHaveAttribute("href", "/dashboard");
      expect(screen.getByText("Messages").closest("a")).toHaveAttribute("href", "/dashboard/messages");
      expect(screen.getByText("Add Solution").closest("a")).toHaveAttribute("href", "/expert/add-solution");
      expect(screen.getByText("My Solutions").closest("a")).toHaveAttribute("href", "/expert/my-solutions");
      expect(screen.getByText("Active Bids").closest("a")).toHaveAttribute("href", "/expert/active-bids");
      expect(screen.getByText("Suites").closest("a")).toHaveAttribute("href", "/expert/ecosystems");
    });

    it("shows bottom section links for expert", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.getByText("Feedback")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Notifications").closest("a")).toHaveAttribute("href", "/expert/notifications");
      expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/expert/settings");
    });
  });
});

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/dashboard/Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/business"),
}));

describe("Sidebar", () => {
  describe("Business role", () => {
    it("shows business-specific links", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Add Request")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("Browse Solutions")).toBeInTheDocument();
      expect(screen.getByText("My Projects")).toBeInTheDocument();
      expect(screen.getByText("Billing")).toBeInTheDocument();
      expect(screen.getByText("Help & Onboarding")).toBeInTheDocument();
      expect(screen.getByText("Company Profile")).toBeInTheDocument();
    });

    it("shows 'Completed' link for business", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    it("does not show expert-specific links for business", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.queryByText("Find Work")).not.toBeInTheDocument();
      expect(screen.queryByText("Add Solution")).not.toBeInTheDocument();
      expect(screen.queryByText("My Solutions")).not.toBeInTheDocument();
      expect(screen.queryByText("Active Bids")).not.toBeInTheDocument();
      // Earnings tab removed — experts see income via Projects
    });

    it("has correct href attributes for business links", () => {
      render(<Sidebar role="BUSINESS" />);
      expect(screen.getByText("Overview").closest("a")).toHaveAttribute("href", "/business");
      expect(screen.getByText("Add Request").closest("a")).toHaveAttribute("href", "/business/add-request");
      expect(screen.getByText("Browse Solutions").closest("a")).toHaveAttribute("href", "/business/solutions");
      expect(screen.getByText("My Projects").closest("a")).toHaveAttribute("href", "/business/projects");
      expect(screen.getByText("Billing").closest("a")).toHaveAttribute("href", "/business/billing");
    });

    it("shows bottom section links for business", () => {
      render(<Sidebar role="BUSINESS" />);
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
      expect(screen.getByText("Discovery Scan Feed")).toBeInTheDocument();
      expect(screen.getByText("Custom Projects Feed")).toBeInTheDocument();
      expect(screen.getByText("Add Solution")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("My Solutions")).toBeInTheDocument();
      expect(screen.getByText("Active Bids")).toBeInTheDocument();
      expect(screen.getByText("Active Projects")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Suites")).toBeInTheDocument();
    });

    it("does not show business-specific links for expert", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.queryByText("Add Request")).not.toBeInTheDocument();
      expect(screen.queryByText("Browse Solutions")).not.toBeInTheDocument();
      expect(screen.queryByText("Billing")).not.toBeInTheDocument();
      expect(screen.queryByText("Help & Onboarding")).not.toBeInTheDocument();
      expect(screen.queryByText("Company Profile")).not.toBeInTheDocument();
    });

    it("has correct href attributes for expert links", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.getByText("Overview").closest("a")).toHaveAttribute("href", "/dashboard");
      expect(screen.getByText("Add Solution").closest("a")).toHaveAttribute("href", "/expert/add-solution");
      expect(screen.getByText("My Solutions").closest("a")).toHaveAttribute("href", "/expert/my-solutions");
      expect(screen.getByText("Active Bids").closest("a")).toHaveAttribute("href", "/expert/active-bids");
      expect(screen.getByText("Suites").closest("a")).toHaveAttribute("href", "/expert/ecosystems");
    });

    it("shows bottom section links for expert", () => {
      render(<Sidebar role="EXPERT" />);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Notifications").closest("a")).toHaveAttribute("href", "/expert/notifications");
      expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/expert/settings");
    });
  });
});

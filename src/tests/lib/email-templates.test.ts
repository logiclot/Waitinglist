import { vi, describe, it, expect } from "vitest";

// Mock the app-url module before importing templates
vi.mock("@/lib/app-url", () => ({ APP_URL: "https://logiclot.io" }));

import {
  verificationEmail,
  passwordResetEmail,
  welcomeEmail,
  deliveryReadyEmail,
  postApprovalEmail,
  reEngagementEmail,
  demoBookedEmail,
  sequenceEmail,
  notificationEmail,
  type NurtureRecommendation,
} from "@/lib/email-templates";

// ── Helpers ──────────────────────────────────────────────────────────────────

function expectValidHtml(html: string) {
  expect(html).toContain("<!DOCTYPE html>");
  expect(html).toContain("</html>");
}

function expectBranding(html: string) {
  expect(html).toContain("LogicLot");
}

// ── verificationEmail ────────────────────────────────────────────────────────

describe("verificationEmail", () => {
  const html = verificationEmail({ verifyUrl: "https://logiclot.io/verify?token=abc123" });

  it("returns valid HTML", () => {
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    expectBranding(html);
  });

  it("contains the verification URL", () => {
    expect(html).toContain("https://logiclot.io/verify?token=abc123");
  });

  it("contains email verification messaging", () => {
    expect(html).toContain("Confirm your email");
  });
});

// ── passwordResetEmail ───────────────────────────────────────────────────────

describe("passwordResetEmail", () => {
  const html = passwordResetEmail({ resetUrl: "https://logiclot.io/reset?token=xyz789" });

  it("returns valid HTML", () => {
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    expectBranding(html);
  });

  it("contains the reset URL", () => {
    expect(html).toContain("https://logiclot.io/reset?token=xyz789");
  });

  it("contains password reset messaging", () => {
    expect(html).toContain("Reset your password");
  });
});

// ── welcomeEmail ─────────────────────────────────────────────────────────────

describe("welcomeEmail", () => {
  it("returns valid HTML for business role", () => {
    const html = welcomeEmail({ firstName: "Alice", role: "business" });
    expectValidHtml(html);
    expectBranding(html);
  });

  it("contains the first name", () => {
    const html = welcomeEmail({ firstName: "Alice", role: "business" });
    expect(html).toContain("Alice");
  });

  it("shows business-specific content for business role", () => {
    const html = welcomeEmail({ firstName: "Alice", role: "business" });
    expect(html).toContain("/business");
    expect(html).toContain("Go to my dashboard");
  });

  it("shows expert-specific content for expert role", () => {
    const html = welcomeEmail({ firstName: "Bob", role: "expert" });
    expect(html).toContain("/dashboard");
    expect(html).toContain("Create my first solution");
    expect(html).toContain("Bob");
  });
});

// ── deliveryReadyEmail ───────────────────────────────────────────────────────

describe("deliveryReadyEmail", () => {
  const html = deliveryReadyEmail({
    firstName: "Charlie",
    projectTitle: "Slack Automation",
    expertName: "Dana Expert",
    reviewUrl: "https://logiclot.io/orders/123/review",
  });

  it("returns valid HTML", () => {
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    expectBranding(html);
  });

  it("contains the first name", () => {
    expect(html).toContain("Charlie");
  });

  it("contains the project title", () => {
    expect(html).toContain("Slack Automation");
  });

  it("contains the expert name", () => {
    expect(html).toContain("Dana Expert");
  });

  it("contains the review URL", () => {
    expect(html).toContain("https://logiclot.io/orders/123/review");
  });
});

// ── postApprovalEmail ────────────────────────────────────────────────────────

describe("postApprovalEmail", () => {
  const recommendations: NurtureRecommendation[] = [
    { title: "CRM Integration", slug: "crm-integration", category: "CRM", priceCents: 15000 },
    { title: "Email Automation", slug: "email-automation", category: "Email", priceCents: 8000 },
  ];

  it("returns valid HTML", () => {
    const html = postApprovalEmail({ firstName: "Eve", projectTitle: "Zapier Flow", recommendations });
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    const html = postApprovalEmail({ firstName: "Eve", projectTitle: "Zapier Flow", recommendations });
    expectBranding(html);
  });

  it("contains the first name and project title", () => {
    const html = postApprovalEmail({ firstName: "Eve", projectTitle: "Zapier Flow", recommendations });
    expect(html).toContain("Eve");
    expect(html).toContain("Zapier Flow");
  });

  it("shows recommendation items when recommendations are provided", () => {
    const html = postApprovalEmail({ firstName: "Eve", projectTitle: "Zapier Flow", recommendations });
    expect(html).toContain("CRM Integration");
    expect(html).toContain("Email Automation");
    expect(html).toContain("/solutions/crm-integration");
    expect(html).toContain("/solutions/email-automation");
  });

  it("does not show recommendation section when recommendations are empty", () => {
    const html = postApprovalEmail({ firstName: "Eve", projectTitle: "Zapier Flow", recommendations: [] });
    expect(html).not.toContain("also automated");
  });
});

// ── reEngagementEmail ────────────────────────────────────────────────────────

describe("reEngagementEmail", () => {
  const recommendations: NurtureRecommendation[] = [
    { title: "Slack Bot", slug: "slack-bot", category: "Communication", priceCents: 12000 },
  ];

  it("returns valid HTML", () => {
    const html = reEngagementEmail({ firstName: "Frank", recommendations });
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    const html = reEngagementEmail({ firstName: "Frank", recommendations });
    expectBranding(html);
  });

  it("contains the first name", () => {
    const html = reEngagementEmail({ firstName: "Frank", recommendations });
    expect(html).toContain("Frank");
  });

  it("shows recommendation items when provided", () => {
    const html = reEngagementEmail({ firstName: "Frank", recommendations });
    expect(html).toContain("Slack Bot");
    expect(html).toContain("/solutions/slack-bot");
  });

  it("works with empty recommendations", () => {
    const html = reEngagementEmail({ firstName: "Frank", recommendations: [] });
    expectValidHtml(html);
    expect(html).toContain("Frank");
  });
});

// ── demoBookedEmail ──────────────────────────────────────────────────────────

describe("demoBookedEmail", () => {
  it("returns valid HTML", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
    });
    expectValidHtml(html);
  });

  it("contains the LogicLot brand", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
    });
    expectBranding(html);
  });

  it("contains the dynamic content", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
    });
    expect(html).toContain("Grace");
    expect(html).toContain("Hank Expert");
    expect(html).toContain("CRM Setup");
  });

  it("shows calendar link when calendarUrl is provided", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
      calendarUrl: "https://cal.com/hank/demo",
    });
    expect(html).toContain("https://cal.com/hank/demo");
    expect(html).toContain("Schedule Your Demo Call");
  });

  it("shows fallback text when calendarUrl is not provided", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
    });
    expect(html).not.toContain("Schedule Your Demo Call");
    expect(html).toContain("reach out to you directly");
  });

  it("shows fallback text when calendarUrl is null", () => {
    const html = demoBookedEmail({
      firstName: "Grace",
      expertName: "Hank Expert",
      solutionTitle: "CRM Setup",
      calendarUrl: null,
    });
    expect(html).not.toContain("Schedule Your Demo Call");
    expect(html).toContain("reach out to you directly");
  });
});

// ── sequenceEmail ────────────────────────────────────────────────────────────

describe("sequenceEmail", () => {
  it("returns valid HTML with all fields", () => {
    const html = sequenceEmail({
      firstName: "Ivy",
      subject: "Test Subject",
      headline: "Big Headline",
      body: "Some body text here.",
      ctaLabel: "Click Me",
      ctaUrl: "https://logiclot.io/action",
    });
    expectValidHtml(html);
    expectBranding(html);
    expect(html).toContain("Ivy");
    expect(html).toContain("Big Headline");
    expect(html).toContain("Some body text here.");
    expect(html).toContain("Click Me");
    expect(html).toContain("https://logiclot.io/action");
  });

  it("includes footnote when provided", () => {
    const html = sequenceEmail({
      firstName: "Ivy",
      subject: "Test",
      headline: "Headline",
      body: "Body",
      ctaLabel: "CTA",
      ctaUrl: "https://logiclot.io",
      footnote: "This is a footnote.",
    });
    expect(html).toContain("This is a footnote.");
  });

  it("omits footnote when not provided", () => {
    const html = sequenceEmail({
      firstName: "Ivy",
      subject: "Test",
      headline: "Headline",
      body: "Body",
      ctaLabel: "CTA",
      ctaUrl: "https://logiclot.io",
    });
    // No footnote paragraph should appear
    expect(html).not.toContain("footnote");
  });
});

// ── notificationEmail ────────────────────────────────────────────────────────

describe("notificationEmail", () => {
  it("returns valid HTML with title and message", () => {
    const html = notificationEmail({
      title: "New Order",
      message: "You have a new order waiting.",
    });
    expectValidHtml(html);
    expectBranding(html);
    expect(html).toContain("New Order");
    expect(html).toContain("You have a new order waiting.");
  });

  it("includes action button when actionUrl is provided", () => {
    const html = notificationEmail({
      title: "Update",
      message: "Check it out.",
      actionUrl: "/orders/456",
      actionLabel: "View Order",
    });
    expect(html).toContain("https://logiclot.io/orders/456");
    expect(html).toContain("View Order");
  });

  it("handles absolute actionUrl without prepending base", () => {
    const html = notificationEmail({
      title: "Update",
      message: "External link.",
      actionUrl: "https://external.com/page",
    });
    expect(html).toContain("https://external.com/page");
  });

  it("omits action button when actionUrl is not provided", () => {
    const html = notificationEmail({
      title: "Info",
      message: "Just a heads up.",
    });
    expect(html).not.toContain("View on LogicLot");
  });
});

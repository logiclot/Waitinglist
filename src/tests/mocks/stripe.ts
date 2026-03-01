import { vi } from "vitest";

export const stripeMock = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  transfers: {
    create: vi.fn(),
  },
  accounts: {
    create: vi.fn(),
    createLoginLink: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

import { vi } from "vitest";

// Mutable session reference that getServerSession will read
let _currentSession: Record<string, unknown> | null = {
  user: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "BUSINESS",
  },
};

export const mockGetServerSession = vi.fn(() => Promise.resolve(_currentSession));

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...(args as [])),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

export function setMockSession(session: Record<string, unknown> | null) {
  _currentSession = session;
  mockGetServerSession.mockImplementation(() => Promise.resolve(_currentSession));
}

export function setMockRole(role: string) {
  if (_currentSession?.user && typeof _currentSession.user === "object") {
    (_currentSession.user as Record<string, unknown>).role = role;
  }
}

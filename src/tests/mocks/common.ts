import { vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(),
  wasRecentlyNotified: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
  clearUser: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  withScope: vi.fn(),
  setUser: vi.fn(),
}));

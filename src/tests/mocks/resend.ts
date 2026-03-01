import { vi } from "vitest";

export const resendMock = {
  emails: {
    send: vi.fn().mockResolvedValue({ id: "email-1" }),
  },
};

vi.mock("@/lib/resend", () => ({
  resend: resendMock,
}));

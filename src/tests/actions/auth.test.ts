// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { signUp, verifyEmail } from "@/actions/auth";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-password") },
}));

// Mock crypto's randomBytes
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomBytes: vi.fn(() => ({
      toString: () => "mock-verification-token-hex",
    })),
  };
});

// Helper to create FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("signUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when fields are missing", async () => {
    const result = await signUp(null, makeFormData({ email: "", password: "", confirmPassword: "" }));
    expect(result).toEqual({ error: "All fields are required" });
  });

  it("returns error when email is missing", async () => {
    const result = await signUp(null, makeFormData({ email: "", password: "pass123", confirmPassword: "pass123" }));
    expect(result).toEqual({ error: "All fields are required" });
  });

  it("returns error when passwords do not match", async () => {
    const result = await signUp(
      null,
      makeFormData({ email: "test@example.com", password: "pass123", confirmPassword: "pass456" })
    );
    expect(result).toEqual({ error: "Passwords do not match" });
  });

  it("returns error when user already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing-user", email: "test@example.com" });

    const result = await signUp(
      null,
      makeFormData({ email: "test@example.com", password: "pass123", confirmPassword: "pass123" })
    );
    expect(result).toEqual({ error: "User already exists" });
  });

  it("creates user and verification token on success", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "new-user-id", email: "new@example.com" });
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: "token-id" });

    const result = await signUp(
      null,
      makeFormData({ email: "new@example.com", password: "pass123", confirmPassword: "pass123" })
    );

    expect(result).toEqual({ success: true, email: "new@example.com" });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        passwordHash: "hashed-password",
      },
    });
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        token: "mock-verification-token-hex",
        userId: "new-user-id",
      }),
    });
  });

  it("returns error when prisma throws", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(new Error("DB error"));

    const result = await signUp(
      null,
      makeFormData({ email: "fail@example.com", password: "pass123", confirmPassword: "pass123" })
    );
    expect(result).toEqual({ error: "DB error" });
  });
});

describe("verifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);

    const result = await verifyEmail("invalid-token");
    expect(result).toEqual({ error: "Invalid token" });
  });

  it("returns error for expired token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "token-1",
      token: "expired-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
      user: { id: "user-1" },
    });

    const result = await verifyEmail("expired-token");
    expect(result).toEqual({ error: "Token expired" });
  });

  it("verifies email successfully", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "token-1",
      token: "valid-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24 hours
      user: { id: "user-1" },
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.emailVerificationToken.delete.mockResolvedValue({});

    const result = await verifyEmail("valid-token");
    expect(result).toEqual({ success: true });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(prismaMock.emailVerificationToken.delete).toHaveBeenCalledWith({
      where: { id: "token-1" },
    });
  });

  it("returns error when verification throws", async () => {
    prismaMock.emailVerificationToken.findUnique.mockRejectedValue(new Error("DB error"));

    const result = await verifyEmail("any-token");
    expect(result).toEqual({ error: "Verification failed" });
  });
});

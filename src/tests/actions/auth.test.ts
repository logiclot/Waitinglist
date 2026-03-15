// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/common";
import "../mocks/resend";
import "../mocks/next-auth";
import { prismaMock } from "../mocks/prisma";
import { resendMock } from "../mocks/resend";
import { mockGetServerSession, setMockSession } from "../mocks/next-auth";

// Mock Analytics
vi.mock("@/lib/analytics", () => ({
  Analytics: { signedUp: vi.fn() },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockImplementation((plain: string, hash: string) =>
      Promise.resolve(hash !== "DELETED" && plain === "correct-password")
    ),
  },
}));

// Mock crypto's randomBytes
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomBytes: vi.fn(() => ({
      toString: () => "mock-token-hex",
    })),
  };
});

// Mock email templates
vi.mock("@/lib/email-templates", () => ({
  verificationEmail: vi.fn(() => "<html>verify</html>"),
  passwordResetEmail: vi.fn(() => "<html>reset</html>"),
}));

// Mock app-url
vi.mock("@/lib/app-url", () => ({
  APP_URL: "http://localhost:3000",
}));

// Helper to create FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const VALID_PASSWORD = "Test123!@";
const WEAK_PASSWORD = "short";
const NO_UPPER_PASSWORD = "test123!@";
const NO_LOWER_PASSWORD = "TEST123!@";
const NO_NUMBER_PASSWORD = "TestTest!@";
const NO_SPECIAL_PASSWORD = "Test12345";

// ── signUp ────────────────────────────────────────────────────────────────────

describe("signUp", () => {
  let signUp: typeof import("@/actions/auth").signUp;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    signUp = mod.signUp;
  });

  it("returns error when fields are missing", async () => {
    const result = await signUp(null, makeFormData({ email: "", password: "", confirmPassword: "" }));
    expect(result).toEqual({ error: "All fields are required" });
  });

  it("returns error when terms not accepted", async () => {
    const result = await signUp(
      null,
      makeFormData({ email: "a@b.com", password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD })
    );
    expect(result).toEqual({
      error: "You must accept the Terms & Conditions and Privacy Policy to continue.",
    });
  });

  it("returns error when passwords do not match", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: VALID_PASSWORD,
        confirmPassword: "Different1!",
        termsAccepted: "on",
      })
    );
    expect(result).toEqual({ error: "Passwords do not match" });
  });

  // ── Password strength ──────────────────────────────────────────────

  it("rejects password shorter than 8 characters", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: WEAK_PASSWORD,
        confirmPassword: WEAK_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result.error).toContain("at least 8 characters");
  });

  it("rejects password without uppercase letter", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: NO_UPPER_PASSWORD,
        confirmPassword: NO_UPPER_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result.error).toContain("one uppercase letter");
  });

  it("rejects password without lowercase letter", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: NO_LOWER_PASSWORD,
        confirmPassword: NO_LOWER_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result.error).toContain("one lowercase letter");
  });

  it("rejects password without number", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: NO_NUMBER_PASSWORD,
        confirmPassword: NO_NUMBER_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result.error).toContain("one number");
  });

  it("rejects password without special character", async () => {
    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: NO_SPECIAL_PASSWORD,
        confirmPassword: NO_SPECIAL_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result.error).toContain("one special character");
  });

  // ── Duplicate user ─────────────────────────────────────────────────

  it("returns error when user already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing", email: "a@b.com" });

    const result = await signUp(
      null,
      makeFormData({
        email: "a@b.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result).toEqual({ error: "An account with this email already exists" });
  });

  // ── Successful sign-up (normal flow) ───────────────────────────────

  it("creates user and sends verification email on success", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "new-user", email: "new@example.com" });
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: "t1" });

    const result = await signUp(
      null,
      makeFormData({
        email: "new@example.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
      })
    );

    expect(result).toEqual({ success: true, email: "new@example.com" });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "new@example.com",
        passwordHash: "hashed-password",
      }),
    });
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        token: "mock-token-hex",
        userId: "new-user",
      }),
    });
  });

  // ── Referral code ──────────────────────────────────────────────────

  it("stores valid referral code", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ id: "referrer", referralCode: "REF123" });
    prismaMock.user.create.mockResolvedValue({ id: "new-user", email: "ref@test.com" });
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: "t1" });

    await signUp(
      null,
      makeFormData({
        email: "ref@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        referralCode: "REF123",
      })
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ referredBy: "REF123" }),
    });
  });

  it("ignores invalid referral code silently", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null); // No referrer found
    prismaMock.user.create.mockResolvedValue({ id: "new-user", email: "ref@test.com" });
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: "t1" });

    await signUp(
      null,
      makeFormData({
        email: "ref@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        referralCode: "INVALID",
      })
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ referredBy: null }),
    });
  });

  // ── Invite token flow ──────────────────────────────────────────────

  it("rejects invalid invite token", async () => {
    prismaMock.waitlistSignup.findUnique.mockResolvedValue(null);

    const result = await signUp(
      null,
      makeFormData({
        email: "expert@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        inviteToken: "bad-token",
      })
    );
    expect(result).toEqual({ error: "This invite link is invalid or has already been used." });
  });

  it("rejects already-used invite token", async () => {
    prismaMock.waitlistSignup.findUnique.mockResolvedValue({
      id: "ws-1",
      email: "expert@test.com",
      role: "expert",
      usedAt: new Date(), // already used
    });

    const result = await signUp(
      null,
      makeFormData({
        email: "expert@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        inviteToken: "used-token",
      })
    );
    expect(result).toEqual({ error: "This invite link is invalid or has already been used." });
  });

  it("rejects invite token when email does not match", async () => {
    prismaMock.waitlistSignup.findUnique.mockResolvedValue({
      id: "ws-1",
      email: "other@test.com",
      role: "expert",
      usedAt: null,
    });

    const result = await signUp(
      null,
      makeFormData({
        email: "wrong@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        inviteToken: "valid-token",
      })
    );
    expect(result).toEqual({ error: "This invite link is for a different email address." });
  });

  it("creates invited expert with role set and email verified", async () => {
    prismaMock.waitlistSignup.findUnique.mockResolvedValue({
      id: "ws-1",
      email: "expert@test.com",
      role: "expert",
      usedAt: null,
    });
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "invited-user", email: "expert@test.com" });
    prismaMock.waitlistSignup.update.mockResolvedValue({});

    const result = await signUp(
      null,
      makeFormData({
        email: "expert@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        inviteToken: "valid-token",
      })
    );

    expect(result).toEqual({ success: true, email: "expert@test.com", invited: true });

    // Should set role to EXPERT and auto-verify email
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "expert@test.com",
        role: "EXPERT",
        emailVerifiedAt: expect.any(Date),
      }),
    });

    // Should mark invite as used
    expect(prismaMock.waitlistSignup.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: { usedAt: expect.any(Date) },
    });

    // Should NOT create a verification token (email already verified)
    expect(prismaMock.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it("creates invited business user with BUSINESS role", async () => {
    prismaMock.waitlistSignup.findUnique.mockResolvedValue({
      id: "ws-2",
      email: "biz@test.com",
      role: "business",
      usedAt: null,
    });
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "biz-user", email: "biz@test.com" });
    prismaMock.waitlistSignup.update.mockResolvedValue({});

    await signUp(
      null,
      makeFormData({
        email: "biz@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
        inviteToken: "biz-token",
      })
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: "BUSINESS" }),
    });
  });

  // ── Error handling ─────────────────────────────────────────────────

  it("returns generic error when prisma throws", async () => {
    prismaMock.user.findFirst.mockRejectedValue(new Error("DB connection lost"));

    const result = await signUp(
      null,
      makeFormData({
        email: "fail@test.com",
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        termsAccepted: "on",
      })
    );
    expect(result).toEqual({ error: "Something went wrong. Please try again." });
  });
});

// ── verifyEmail ───────────────────────────────────────────────────────────────

describe("verifyEmail", () => {
  let verifyEmail: typeof import("@/actions/auth").verifyEmail;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    verifyEmail = mod.verifyEmail;
  });

  it("returns error for invalid token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);
    const result = await verifyEmail("invalid-token");
    expect(result).toEqual({ error: "This verification link is invalid." });
  });

  it("returns error for expired token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "t1",
      token: "expired",
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000),
      user: { id: "u1" },
    });
    const result = await verifyEmail("expired");
    expect(result).toEqual({ error: "This verification link has expired. Please request a new one." });
  });

  it("verifies email and deletes token on success", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "t1",
      token: "valid",
      userId: "u1",
      expiresAt: new Date(Date.now() + 86400000),
      user: { id: "u1" },
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.emailVerificationToken.delete.mockResolvedValue({});

    const result = await verifyEmail("valid");
    expect(result).toEqual({ success: true });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(prismaMock.emailVerificationToken.delete).toHaveBeenCalledWith({
      where: { id: "t1" },
    });
  });
});

// ── resendVerificationEmail ───────────────────────────────────────────────────

describe("resendVerificationEmail", () => {
  let resendVerificationEmail: typeof import("@/actions/auth").resendVerificationEmail;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    resendVerificationEmail = mod.resendVerificationEmail;
  });

  it("returns error for unknown email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await resendVerificationEmail("nobody@test.com");
    expect(result).toEqual({ error: "No account found with this email." });
  });

  it("returns error if already verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "verified@test.com",
      emailVerifiedAt: new Date(),
    });
    const result = await resendVerificationEmail("verified@test.com");
    expect(result).toEqual({ error: "This email is already verified." });
  });

  it("invalidates old tokens and creates a new one", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "unverified@test.com",
      emailVerifiedAt: null,
    });
    prismaMock.emailVerificationToken.deleteMany.mockResolvedValue({});
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: "t2" });

    const result = await resendVerificationEmail("unverified@test.com");
    expect(result).toEqual({ success: true });

    expect(prismaMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "u1", token: "mock-token-hex" }),
    });
  });
});

// ── requestPasswordReset ──────────────────────────────────────────────────────

describe("requestPasswordReset", () => {
  let requestPasswordReset: typeof import("@/actions/auth").requestPasswordReset;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    requestPasswordReset = mod.requestPasswordReset;
  });

  it("returns error if email is missing", async () => {
    const result = await requestPasswordReset(null, makeFormData({ email: "" }));
    expect(result).toEqual({ error: "Email is required." });
  });

  it("returns success even for unknown email (prevents enumeration)", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    const result = await requestPasswordReset(null, makeFormData({ email: "nobody@test.com" }));
    expect(result).toEqual({ success: true });
  });

  it("returns success for user without password (OAuth only)", async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: "u1", email: "oauth@test.com", passwordHash: null }]);
    const result = await requestPasswordReset(null, makeFormData({ email: "oauth@test.com" }));
    expect(result).toEqual({ success: true });
    // Should NOT create a reset token
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("creates reset token and sends email for valid user", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: "u1", email: "user@test.com", passwordHash: "hashed" },
    ]);
    prismaMock.passwordResetToken.deleteMany.mockResolvedValue({});
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: "rt1" });

    // Set FROM_EMAIL env so it tries to send
    const origEnv = process.env.RESEND_FROM_EMAIL;
    process.env.RESEND_FROM_EMAIL = "noreply@logiclot.io";

    const result = await requestPasswordReset(null, makeFormData({ email: "user@test.com" }));

    process.env.RESEND_FROM_EMAIL = origEnv;

    expect(result).toEqual({ success: true });
    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "u1", token: "mock-token-hex" }),
    });
  });
});

// ── resetPassword ─────────────────────────────────────────────────────────────

describe("resetPassword", () => {
  let resetPassword: typeof import("@/actions/auth").resetPassword;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    resetPassword = mod.resetPassword;
  });

  it("returns error for missing token", async () => {
    const result = await resetPassword("", VALID_PASSWORD);
    expect(result).toEqual({ error: "Missing reset token." });
  });

  it("rejects weak password", async () => {
    const result = await resetPassword("some-token", "weak");
    expect(result.error).toContain("at least 8 characters");
  });

  it("rejects password without special character", async () => {
    const result = await resetPassword("some-token", NO_SPECIAL_PASSWORD);
    expect(result.error).toContain("one special character");
  });

  it("returns error for invalid token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
    const result = await resetPassword("bad-token", VALID_PASSWORD);
    expect(result).toEqual({ error: "This reset link is invalid or has already been used." });
  });

  it("returns error for expired token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "rt1",
      token: "expired",
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = await resetPassword("expired", VALID_PASSWORD);
    expect(result).toEqual({ error: "This reset link has expired. Please request a new one." });
  });

  it("updates password and deletes token on success", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "rt1",
      token: "valid",
      userId: "u1",
      expiresAt: new Date(Date.now() + 3600000),
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.passwordResetToken.delete.mockResolvedValue({});

    const result = await resetPassword("valid", VALID_PASSWORD);
    expect(result).toEqual({ success: true });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "hashed-password" },
    });
    expect(prismaMock.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { id: "rt1" },
    });
  });
});

// ── deleteMyAccount ───────────────────────────────────────────────────────────

describe("deleteMyAccount", () => {
  let deleteMyAccount: typeof import("@/actions/auth").deleteMyAccount;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/actions/auth");
    deleteMyAccount = mod.deleteMyAccount;
  });

  it("returns error when not signed in", async () => {
    setMockSession(null);
    const result = await deleteMyAccount("any-password");
    expect(result).toEqual({ error: "Not signed in." });
  });

  it("returns error for incorrect password", async () => {
    setMockSession({ user: { id: "u1", email: "test@test.com" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: "hashed-password",
    });

    const result = await deleteMyAccount("wrong-password");
    expect(result).toEqual({ error: "Incorrect password." });
  });

  it("blocks deletion when buyer has active orders", async () => {
    setMockSession({ user: { id: "u1", email: "test@test.com" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: "hashed-password",
    });
    prismaMock.order.count.mockResolvedValueOnce(2); // active orders as buyer

    const result = await deleteMyAccount("correct-password");
    expect(result.error).toContain("active orders");
  });

  it("blocks deletion when user has active job posts", async () => {
    setMockSession({ user: { id: "u1", email: "test@test.com" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: "hashed-password",
    });
    prismaMock.order.count.mockResolvedValueOnce(0); // no active orders
    prismaMock.jobPost.count.mockResolvedValueOnce(1); // active job

    const result = await deleteMyAccount("correct-password");
    expect(result.error).toContain("active job posts");
  });

  it("succeeds for user with no active orders/jobs", async () => {
    setMockSession({ user: { id: "u1", email: "test@test.com" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: "hashed-password",
    });
    prismaMock.order.count.mockResolvedValue(0);
    prismaMock.jobPost.count.mockResolvedValue(0);
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    // Mock $transaction to execute the callback
    prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof prismaMock) => Promise<void>) => {
      // Create a tx proxy that returns resolved promises for all operations
      const txProxy = new Proxy(prismaMock, {
        get(target, prop) {
          const model = target[prop as keyof typeof target];
          if (model && typeof model === "object") {
            return new Proxy(model, {
              get(m, method) {
                const fn = m[method as keyof typeof m];
                if (typeof fn === "function") return fn;
                return vi.fn().mockResolvedValue({});
              },
            });
          }
          return model;
        },
      });
      await cb(txProxy as typeof prismaMock);
    });

    const result = await deleteMyAccount("correct-password");
    expect(result).toEqual({ success: true });
  });
});

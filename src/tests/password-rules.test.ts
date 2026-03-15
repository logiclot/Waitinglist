import { describe, it, expect } from "vitest";
import { PASSWORD_RULES, validatePassword } from "@/lib/password-rules";

describe("PASSWORD_RULES", () => {
  it("has 5 rules", () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });

  describe("length rule", () => {
    const rule = PASSWORD_RULES[0];
    it("fails for 7 chars", () => expect(rule.test("Abc123!")).toBe(false));
    it("passes for 8 chars", () => expect(rule.test("Abc1234!")).toBe(true));
    it("passes for long passwords", () => expect(rule.test("A".repeat(100) + "a1!")).toBe(true));
  });

  describe("uppercase rule", () => {
    const rule = PASSWORD_RULES[1];
    it("fails without uppercase", () => expect(rule.test("abc123!@")).toBe(false));
    it("passes with uppercase", () => expect(rule.test("Abc123!@")).toBe(true));
  });

  describe("lowercase rule", () => {
    const rule = PASSWORD_RULES[2];
    it("fails without lowercase", () => expect(rule.test("ABC123!@")).toBe(false));
    it("passes with lowercase", () => expect(rule.test("ABc123!@")).toBe(true));
  });

  describe("number rule", () => {
    const rule = PASSWORD_RULES[3];
    it("fails without number", () => expect(rule.test("Abcdefg!")).toBe(false));
    it("passes with number", () => expect(rule.test("Abcdefg1")).toBe(true));
  });

  describe("special character rule", () => {
    const rule = PASSWORD_RULES[4];
    it("fails without special char", () => expect(rule.test("Abcdefg1")).toBe(false));
    it.each(["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "?"])(
      "passes with %s",
      (char) => expect(rule.test(`Abc123${char}x`)).toBe(true)
    );
  });
});

describe("validatePassword", () => {
  it("returns error for empty password", () => {
    expect(validatePassword("")).toBe("Password is required.");
  });

  it("returns null for fully valid password", () => {
    expect(validatePassword("MyPass1!")).toBeNull();
  });

  it("returns error listing all failed rules", () => {
    const result = validatePassword("abc");
    expect(result).toContain("at least 8 characters");
    expect(result).toContain("one uppercase letter");
    expect(result).toContain("one number");
    expect(result).toContain("one special character");
    // Should NOT mention lowercase (it passes)
    expect(result).not.toContain("one lowercase letter");
  });

  it("accepts complex valid passwords", () => {
    expect(validatePassword("C0mpl3x!Pass")).toBeNull();
    expect(validatePassword("Str0ng@Password")).toBeNull();
    expect(validatePassword("12345678Aa!")).toBeNull();
  });
});

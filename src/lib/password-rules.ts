export const PASSWORD_RULES = [
  { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
  { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
  { test: (pw: string) => /[a-z]/.test(pw), label: "One lowercase letter" },
  { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
  { test: (pw: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw), label: "One special character (!@#$...)" },
];

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  const failed = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failed.length > 0) return `Password must contain: ${failed.map((r) => r.label.toLowerCase()).join(", ")}.`;
  return null;
}

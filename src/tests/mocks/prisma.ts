import { vi } from "vitest";

// Create a deep mock of PrismaClient
const createMockModel = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  upsert: vi.fn(),
});

export const prismaMock = {
  user: createMockModel(),
  businessProfile: createMockModel(),
  specialistProfile: createMockModel(),
  solution: createMockModel(),
  order: createMockModel(),
  jobPost: createMockModel(),
  bid: createMockModel(),
  conversation: createMockModel(),
  message: createMockModel(),
  notification: createMockModel(),
  dispute: createMockModel(),
  savedSolution: createMockModel(),
  emailVerificationToken: createMockModel(),
  passwordResetToken: createMockModel(),
  waitlistSignup: createMockModel(),
  feedback: createMockModel(),
  surveyCompletion: createMockModel(),
  ecosystem: createMockModel(),
  ecosystemItem: { ...createMockModel(), updateMany: vi.fn() },
  ecosystemInvite: { ...createMockModel(), updateMany: vi.fn() },
  review: { ...createMockModel(), updateMany: vi.fn() },
  $transaction: vi.fn((fns: unknown[]) => Promise.all(fns)),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

/**
 * One-time script: Create an ADMIN user.
 * Run with: npx tsx scripts/seed-admin.ts
 * Delete after use.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "axentiatech@gmail.com";
const TEMP_PASSWORD = "AuditTeam2026!";

async function main() {
  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

  const existing = await prisma.user.findFirst({
    where: { email: { equals: EMAIL, mode: "insensitive" } },
  });

  if (existing) {
    console.log(`\u26a0\ufe0f  User already exists: ${EMAIL} (id: ${existing.id}, role: ${existing.role})`);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        passwordHash: hashedPassword,
        emailVerifiedAt: new Date(),
        onboardingCompletedAt: new Date(),
      },
    });
    console.log(`   \u2192 Updated to ADMIN with full access`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      passwordHash: hashedPassword,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      onboardingCompletedAt: new Date(),
    },
  });

  console.log(`\u2705 Created ADMIN user: ${EMAIL} (id: ${user.id})`);
  console.log(`\ud83d\udd11 Password: ${TEMP_PASSWORD}`);
  console.log(`   Sign in at /auth/sign-in\n`);
}

main()
  .catch((e) => {
    console.error("\u274c Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

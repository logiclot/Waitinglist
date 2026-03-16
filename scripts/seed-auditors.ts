/**
 * One-time script: Create full-access BUSINESS accounts for audit team.
 * Run with: npx tsx scripts/seed-auditors.ts
 * Delete after use.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AUDITORS = [
  {
    email: "iamabhay.mittal@gmail.com",
    firstName: "Abhay",
    lastName: "Mittal",
    companyName: "Audit Team",
  },
  {
    email: "iamabhaymittal@gmail.com",
    firstName: "Abhay",
    lastName: "Mittal",
    companyName: "Audit Team",
  },
];

const TEMP_PASSWORD = "AuditTeam2026!";

async function main() {
  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

  for (const auditor of AUDITORS) {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: { equals: auditor.email, mode: "insensitive" } },
    });

    if (existing) {
      console.log(`⚠️  User already exists: ${auditor.email} (id: ${existing.id}, role: ${existing.role})`);
      // Update to full access if not already
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "BUSINESS",
          emailVerifiedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });
      // Ensure business profile exists
      const hasProfile = await prisma.businessProfile.findUnique({
        where: { userId: existing.id },
      });
      if (!hasProfile) {
        await prisma.businessProfile.create({
          data: {
            userId: existing.id,
            firstName: auditor.firstName,
            lastName: auditor.lastName,
            companyName: auditor.companyName,
            jobRole: "Auditor",
            howHeard: "Direct invite",
            interests: [],
            tools: [],
          },
        });
        console.log(`   → Created BusinessProfile for existing user`);
      }
      console.log(`   → Updated to BUSINESS with full access`);
      continue;
    }

    // Create new user + business profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: auditor.email,
          passwordHash: hashedPassword,
          role: "BUSINESS",
          emailVerifiedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });

      await tx.businessProfile.create({
        data: {
          userId: u.id,
          firstName: auditor.firstName,
          lastName: auditor.lastName,
          companyName: auditor.companyName,
          jobRole: "Auditor",
          howHeard: "Direct invite",
          interests: [],
          tools: [],
        },
      });

      // Mark waitlist signup as used (if they're on the waitlist)
      const waitlist = await tx.waitlistSignup.findUnique({
        where: { email: auditor.email },
      });
      if (waitlist && !waitlist.usedAt) {
        await tx.waitlistSignup.update({
          where: { id: waitlist.id },
          data: { usedAt: new Date() },
        });
        console.log(`   → Marked waitlist signup as used`);
      }

      return u;
    });

    console.log(`✅ Created: ${auditor.email} (id: ${user.id})`);
  }

  console.log(`\n🔑 Temporary password for both: ${TEMP_PASSWORD}`);
  console.log(`   They can sign in at /auth/sign-in and change it in settings.\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

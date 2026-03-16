/**
 * One-time script: Convert iamabhay.mittal@gmail.com from BUSINESS to EXPERT.
 * Run with: npx tsx scripts/convert-to-expert.ts
 * Delete after use.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = "iamabhay.mittal@gmail.com";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: EMAIL, mode: "insensitive" } },
    include: { businessProfile: true, specialistProfile: true },
  });

  if (!user) {
    console.error(`❌ User not found: ${EMAIL}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (id: ${user.id}, role: ${user.role})`);

  if (user.specialistProfile) {
    console.log(`⚠️  Already has a SpecialistProfile — skipping creation.`);
    // Just ensure role is EXPERT
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "EXPERT" },
    });
    console.log(`✅ Role set to EXPERT`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Remove BusinessProfile if it exists
    if (user.businessProfile) {
      await tx.businessProfile.delete({ where: { userId: user.id } });
      console.log(`   → Removed BusinessProfile`);
    }

    // 2. Update role to EXPERT
    await tx.user.update({
      where: { id: user.id },
      data: { role: "EXPERT" },
    });
    console.log(`   → Role updated to EXPERT`);

    // 3. Create SpecialistProfile
    await tx.specialistProfile.create({
      data: {
        userId: user.id,
        slug: "abhay-mittal",
        legalFullName: "Abhay Mittal",
        displayName: "Abhay Mittal",
        country: "India",
        yearsExperience: "3-5",
        pastImplementations: "10+",
        portfolioLinks: [],
        tools: [],
        specialties: [],
        status: "APPROVED",
        verified: true,
      },
    });
    console.log(`   → Created SpecialistProfile (slug: abhay-mittal, status: APPROVED)`);
  });

  console.log(`\n✅ ${EMAIL} is now a full EXPERT with approved status.`);
  console.log(`   They can sign in and access /dashboard (expert dashboard).\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

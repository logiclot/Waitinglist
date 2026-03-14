-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'BUSINESS', 'EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SpecialistStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'paid_pending_implementation', 'in_progress', 'delivered', 'revision_requested', 'approved', 'refunded', 'disputed');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('user', 'system', 'bid_card', 'order_card');

-- CreateEnum
CREATE TYPE "DemoVideoStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('draft', 'pending_payment', 'open', 'closed', 'awarded', 'cancelled', 'full');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('submitted', 'shortlisted', 'rejected', 'accepted', 'withdrawn');

-- CreateEnum
CREATE TYPE "SpecialistTier" AS ENUM ('STANDARD', 'PROVEN', 'ELITE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralRewards" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "loginDaysCount" INTEGER NOT NULL DEFAULT 0,
    "referralCompletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "howHeard" TEXT NOT NULL,
    "interests" TEXT[],
    "tools" TEXT[],
    "industry" TEXT,
    "companySize" TEXT,
    "whatToAutomate" TEXT,
    "timezone" TEXT,
    "billingEmail" TEXT,
    "website" TEXT,
    "country" TEXT,
    "businessPrimaryProblems" TEXT[],
    "successDefinition" TEXT[],
    "decisionContext" TEXT,
    "upgradeInterests" TEXT[],
    "timingPreference" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalFullName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT,
    "isAgency" BOOLEAN NOT NULL DEFAULT false,
    "agencyName" TEXT,
    "agencyTeamSize" TEXT,
    "businessIdentificationNumber" TEXT,
    "phoneNumber" TEXT,
    "primaryTool" TEXT,
    "tools" TEXT[],
    "specialties" TEXT[],
    "availability" TEXT,
    "yearsExperience" TEXT NOT NULL,
    "portfolioLinks" JSONB NOT NULL,
    "portfolioUrl" TEXT,
    "pastImplementations" TEXT NOT NULL,
    "typicalProjectSize" TEXT,
    "clientAcquisitionSource" TEXT[],
    "bio" TEXT,
    "responseTime" TEXT,
    "status" "SpecialistStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "tier" "SpecialistTier" NOT NULL DEFAULT 'STANDARD',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "businessVerified" BOOLEAN NOT NULL DEFAULT false,
    "foundingRank" INTEGER,
    "completedSalesCount" INTEGER NOT NULL DEFAULT 0,
    "commissionOverridePercent" DECIMAL(5,2),
    "legalStatus" TEXT NOT NULL DEFAULT 'pending_acceptance',
    "termsAcceptedAt" TIMESTAMP(3),
    "authorityConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "stripeAccountId" TEXT,
    "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isFoundingExpert" BOOLEAN NOT NULL DEFAULT false,
    "platformFeePercentage" INTEGER NOT NULL DEFAULT 15,
    "calendarUrl" TEXT,
    "invoiceCompanyName" TEXT,
    "invoiceAddress" TEXT,
    "invoiceVatNumber" TEXT,
    "portfolioBackground" TEXT,
    "portfolioBorderColor" TEXT,
    "portfolioFont" TEXT,
    "portfolioCoverImage" TEXT,
    "portfolioBackgroundColor" TEXT,
    "portfolioPatternColor" TEXT,
    "featuredSolutionIds" TEXT[],
    "portfolioViewCount" INTEGER NOT NULL DEFAULT 0,
    "bidBannedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortSummary" TEXT,
    "outcome" TEXT,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "complexity" TEXT,
    "category" TEXT NOT NULL,
    "integrations" TEXT[],
    "requiredInputs" TEXT[],
    "implementationPriceCents" INTEGER NOT NULL,
    "monthlyCostMinCents" INTEGER,
    "monthlyCostMaxCents" INTEGER,
    "deliveryDays" INTEGER NOT NULL,
    "supportDays" INTEGER NOT NULL DEFAULT 30,
    "included" TEXT[],
    "excluded" TEXT[],
    "faq" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "moderationStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "outline" TEXT[],
    "lastStep" INTEGER NOT NULL DEFAULT 1,
    "proofType" TEXT,
    "proofContent" TEXT,
    "businessGoals" TEXT[],
    "industries" TEXT[],
    "paybackPeriod" TEXT,
    "trustSignals" TEXT[],
    "structureConsistent" TEXT[],
    "structureCustom" TEXT[],
    "measurableOutcome" TEXT,
    "milestones" JSONB,
    "skills" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "changelog" TEXT,
    "upgradePriceCents" INTEGER,
    "parentId" TEXT,
    "demoVideoUrl" TEXT,
    "demoVideoStatus" "DemoVideoStatus" NOT NULL DEFAULT 'none',
    "demoVideoReviewedAt" TIMESTAMP(3),
    "demoPriceCents" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "solutionId" TEXT,
    "bidId" TEXT,
    "priceCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'draft',
    "deliveryNote" TEXT,
    "revisionNote" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "milestones" JSONB,
    "stripePaymentIntentId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerRating" INTEGER,
    "sellerComment" TEXT,
    "sellerSubmittedAt" TIMESTAMP(3),
    "buyerRating" INTEGER,
    "buyerComment" TEXT,
    "buyerSubmittedAt" TIMESTAMP(3),
    "isUnblinded" BOOLEAN NOT NULL DEFAULT false,
    "unblindedAt" TIMESTAMP(3),
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNotes" TEXT,
    "resolution" TEXT,
    "resolutionNote" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "solutionId" TEXT,
    "orderId" TEXT,
    "jobPostId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tools" TEXT[],
    "budgetRange" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'draft',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "paymentProvider" TEXT,
    "paymentIntentId" TEXT,
    "rejectionFeedback" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "solutionId" TEXT,
    "message" TEXT NOT NULL,
    "proposedApproach" TEXT,
    "estimatedTime" TEXT NOT NULL,
    "priceEstimate" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'submitted',
    "feedback" TEXT,
    "feedbackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSolution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "source" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ecosystem" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortPitch" TEXT NOT NULL,
    "businessGoal" TEXT NOT NULL,
    "outcomes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ecosystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcosystemItem" (
    "id" TEXT NOT NULL,
    "ecosystemId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EcosystemItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "step" INTEGER,
    "score" INTEGER,
    "scoreLabel" TEXT,
    "answers" JSONB,
    "email" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialistProfile_userId_key" ON "SpecialistProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialistProfile_slug_key" ON "SpecialistProfile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialistProfile_foundingRank_key" ON "SpecialistProfile"("foundingRank");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_slug_key" ON "Solution"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_bidId_key" ON "Order"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_orderId_key" ON "Dispute"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_jobPostId_specialistId_key" ON "Bid"("jobPostId", "specialistId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedSolution_userId_solutionId_key" ON "SavedSolution"("userId", "solutionId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_email_key" ON "WaitlistSignup"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ecosystem_slug_key" ON "Ecosystem"("slug");

-- CreateIndex
CREATE INDEX "Feedback_userId_createdAt_idx" ON "Feedback"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyCompletion_userId_key" ON "SurveyCompletion"("userId");

-- CreateIndex
CREATE INDEX "EcosystemItem_solutionId_idx" ON "EcosystemItem"("solutionId");

-- CreateIndex
CREATE UNIQUE INDEX "EcosystemItem_ecosystemId_solutionId_key" ON "EcosystemItem"("ecosystemId", "solutionId");

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- CreateIndex
CREATE INDEX "PageView_pathname_idx" ON "PageView"("pathname");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_event_idx" ON "AuditEvent"("event");

-- CreateIndex
CREATE INDEX "AuditEvent_sessionId_idx" ON "AuditEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialistProfile" ADD CONSTRAINT "SpecialistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "SpecialistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Solution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SpecialistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SpecialistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "SpecialistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSolution" ADD CONSTRAINT "SavedSolution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSolution" ADD CONSTRAINT "SavedSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ecosystem" ADD CONSTRAINT "Ecosystem_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "SpecialistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCompletion" ADD CONSTRAINT "SurveyCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcosystemItem" ADD CONSTRAINT "EcosystemItem_ecosystemId_fkey" FOREIGN KEY ("ecosystemId") REFERENCES "Ecosystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcosystemItem" ADD CONSTRAINT "EcosystemItem_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


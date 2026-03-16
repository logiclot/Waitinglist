-- Add free Discovery Scan counter for waitlist signups
ALTER TABLE "BusinessProfile" ADD COLUMN "freeDiscoveryScansRemaining" INTEGER NOT NULL DEFAULT 0;

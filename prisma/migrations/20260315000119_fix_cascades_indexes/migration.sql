-- DropForeignKey
ALTER TABLE "Ecosystem" DROP CONSTRAINT "Ecosystem_expertId_fkey";

-- DropForeignKey
ALTER TABLE "EcosystemInvite" DROP CONSTRAINT "EcosystemInvite_solutionId_fkey";

-- DropForeignKey
ALTER TABLE "EcosystemItem" DROP CONSTRAINT "EcosystemItem_solutionId_fkey";

-- DropForeignKey
ALTER TABLE "Solution" DROP CONSTRAINT "Solution_expertId_fkey";

-- CreateIndex
CREATE INDEX "Bid_solutionId_idx" ON "Bid"("solutionId");

-- CreateIndex
CREATE INDEX "Conversation_solutionId_idx" ON "Conversation"("solutionId");

-- CreateIndex
CREATE INDEX "Order_solutionId_idx" ON "Order"("solutionId");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "SpecialistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ecosystem" ADD CONSTRAINT "Ecosystem_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "SpecialistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcosystemItem" ADD CONSTRAINT "EcosystemItem_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcosystemInvite" ADD CONSTRAINT "EcosystemInvite_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

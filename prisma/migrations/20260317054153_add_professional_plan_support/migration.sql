-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "ProfessionalPlanRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isProfessional" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'STRIPE';

-- CreateTable
CREATE TABLE "ProfessionalPlanRequest" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "message" TEXT,
    "proposedPrice" INTEGER,
    "status" "ProfessionalPlanRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalPlanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfessionalPlanRequest_farmId_idx" ON "ProfessionalPlanRequest"("farmId");

-- CreateIndex
CREATE INDEX "ProfessionalPlanRequest_status_idx" ON "ProfessionalPlanRequest"("status");

-- AddForeignKey
ALTER TABLE "ProfessionalPlanRequest" ADD CONSTRAINT "ProfessionalPlanRequest_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalPlanRequest" ADD CONSTRAINT "ProfessionalPlanRequest_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

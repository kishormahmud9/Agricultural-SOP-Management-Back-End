/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `ProfessionalPlanRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfessionalPlanRequest" DROP CONSTRAINT "ProfessionalPlanRequest_farmId_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentMethod";

-- DropTable
DROP TABLE "ProfessionalPlanRequest";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "ProfessionalPlanRequestStatus";

/*
  Warnings:

  - You are about to drop the column `isProfessional` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `ProfessionalPlanRequest` table. All the data in the column will be lost.
  - You are about to drop the column `proposedPrice` on the `ProfessionalPlanRequest` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `ProfessionalPlanRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `ProfessionalPlanRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmName` to the `ProfessionalPlanRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProfessionalPlanRequest" DROP CONSTRAINT "ProfessionalPlanRequest_planId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "isProfessional";

-- AlterTable
ALTER TABLE "ProfessionalPlanRequest" DROP COLUMN "planId",
DROP COLUMN "proposedPrice",
ADD COLUMN     "agreedPrice" INTEGER,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "durationMonths" INTEGER,
ADD COLUMN     "farmName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "planName" TEXT,
ADD COLUMN     "priceType" TEXT;

/*
  Warnings:

  - You are about to drop the column `module` on the `SOP` table. All the data in the column will be lost.
  - Added the required column `category` to the `SOP` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SOPCategory" AS ENUM ('SAFETY', 'OPERATIONS', 'COMPLIANCE', 'TRAINING');

-- AlterTable
ALTER TABLE "SOP" DROP COLUMN "module",
ADD COLUMN     "category" "SOPCategory" NOT NULL,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileType" TEXT;

-- CreateIndex
CREATE INDEX "SOP_category_idx" ON "SOP"("category");

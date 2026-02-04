/*
  Warnings:

  - Made the column `module` on table `SOP` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SOP" ADD COLUMN     "language" TEXT,
ADD COLUMN     "parsedContent" JSONB,
ALTER COLUMN "module" SET NOT NULL;

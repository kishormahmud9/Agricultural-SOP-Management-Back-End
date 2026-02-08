/*
  Warnings:

  - Added the required column `source` to the `SOP` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SOPSource" AS ENUM ('PDF_UPLOAD', 'DIGITAL_EDITOR');

-- AlterTable
ALTER TABLE "SOP" ADD COLUMN     "source" "SOPSource" NOT NULL;

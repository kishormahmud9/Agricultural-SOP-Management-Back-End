/*
  Warnings:

  - Added the required column `country` to the `Farm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultLanguage` to the `Farm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "defaultLanguage" TEXT NOT NULL;

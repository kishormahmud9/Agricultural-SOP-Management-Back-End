/*
  Warnings:

  - The values [SAFETY,OPERATIONS,COMPLIANCE,TRAINING] on the enum `SOPCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SOPCategory_new" AS ENUM ('MILKING', 'FEEDING', 'HEALTH', 'CALVES', 'MAINTENANCE', 'EMERGENCIES');
ALTER TABLE "SOP" ALTER COLUMN "category" TYPE "SOPCategory_new" USING ("category"::text::"SOPCategory_new");
ALTER TYPE "SOPCategory" RENAME TO "SOPCategory_old";
ALTER TYPE "SOPCategory_new" RENAME TO "SOPCategory";
DROP TYPE "public"."SOPCategory_old";
COMMIT;

/*
  Warnings:

  - The values [NIGHT] on the enum `TaskShift` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskShift_new" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');
ALTER TABLE "public"."Task" ALTER COLUMN "shift" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "shift" TYPE "TaskShift_new" USING ("shift"::text::"TaskShift_new");
ALTER TYPE "TaskShift" RENAME TO "TaskShift_old";
ALTER TYPE "TaskShift_new" RENAME TO "TaskShift";
DROP TYPE "public"."TaskShift_old";
ALTER TABLE "Task" ALTER COLUMN "shift" SET DEFAULT 'MORNING';
COMMIT;

-- CreateEnum
CREATE TYPE "TaskShift" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "shift" "TaskShift" NOT NULL DEFAULT 'MORNING';

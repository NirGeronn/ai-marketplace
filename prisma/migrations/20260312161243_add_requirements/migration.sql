-- AlterTable
ALTER TABLE "solutions" ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];

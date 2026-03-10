/*
  Warnings:

  - You are about to drop the column `barcode` on the `BirthTracking` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BarcodeStatus" AS ENUM ('NOT_DUE', 'NOT_ATTACHED', 'ATTACHED');

-- AlterTable
ALTER TABLE "BirthTracking" DROP COLUMN "barcode",
ADD COLUMN     "barcodeStatus" "BarcodeStatus" NOT NULL DEFAULT 'NOT_DUE';

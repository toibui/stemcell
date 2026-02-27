/*
  Warnings:

  - You are about to drop the column `customerId` on the `BirthTracking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contractId]` on the table `BirthTracking` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BirthTracking" DROP CONSTRAINT "BirthTracking_customerId_fkey";

-- AlterTable
ALTER TABLE "BirthTracking" DROP COLUMN "customerId",
ADD COLUMN     "contractId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BirthTracking_contractId_key" ON "BirthTracking"("contractId");

-- AddForeignKey
ALTER TABLE "BirthTracking" ADD CONSTRAINT "BirthTracking_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

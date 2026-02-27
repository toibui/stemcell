/*
  Warnings:

  - You are about to drop the column `actualBirthDate` on the `BirthTracking` table. All the data in the column will be lost.
  - You are about to drop the column `actualBirthTime` on the `BirthTracking` table. All the data in the column will be lost.
  - You are about to drop the column `contractSigned` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `contractSignedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `qcStaffId` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `collectedBy` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `SampleProcessing` table. All the data in the column will be lost.
  - Made the column `staffId` on table `BirthFollowUp` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `staffId` to the `QualityControl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `Sample` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `SampleProcessing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BirthFollowUp" ALTER COLUMN "staffId" SET NOT NULL;

-- AlterTable
ALTER TABLE "BirthTracking" DROP COLUMN "actualBirthDate",
DROP COLUMN "actualBirthTime",
ADD COLUMN     "actualBirthAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "contractSigned",
DROP COLUMN "contractSignedAt",
DROP COLUMN "status",
ADD COLUMN     "channelMarketingId" TEXT;

-- AlterTable
ALTER TABLE "QualityControl" DROP COLUMN "qcStaffId",
DROP COLUMN "status",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sample" DROP COLUMN "collectedBy",
DROP COLUMN "status",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SampleProcessing" DROP COLUMN "processedBy",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SampleStatus";

-- CreateTable
CREATE TABLE "Type" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMarketing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ChannelMarketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulting" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "Content" TEXT,
    "staffid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "no" TEXT,
    "typeId" TEXT NOT NULL,
    "dateContract" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultQualityControl" (
    "id" TEXT NOT NULL,
    "qcId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ResultQualityControl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_no_key" ON "Contract"("no");

-- CreateIndex
CREATE INDEX "Sample_birthId_idx" ON "Sample"("birthId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_channelMarketingId_fkey" FOREIGN KEY ("channelMarketingId") REFERENCES "ChannelMarketing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulting" ADD CONSTRAINT "Consulting_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulting" ADD CONSTRAINT "Consulting_staffid_fkey" FOREIGN KEY ("staffid") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthFollowUp" ADD CONSTRAINT "BirthFollowUp_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleProcessing" ADD CONSTRAINT "SampleProcessing_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultQualityControl" ADD CONSTRAINT "ResultQualityControl_qcId_fkey" FOREIGN KEY ("qcId") REFERENCES "QualityControl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

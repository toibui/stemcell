-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('admin', 'administration', 'collection', 'processing', 'quality_control', 'storage');

-- CreateEnum
CREATE TYPE "BirthStatus" AS ENUM ('planned', 'contacted', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('collected', 'processing', 'external_testing', 'qc', 'stored', 'rejected');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "edd" TIMESTAMP(3),
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "contractSignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthTracking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "edd" TIMESTAMP(3),
    "actualBirthDate" TIMESTAMP(3),
    "actualBirthTime" TIMESTAMP(3),
    "hospitalName" TEXT,
    "hospitalAddress" TEXT,
    "birthType" TEXT,
    "babiesCount" INTEGER NOT NULL DEFAULT 1,
    "status" "BirthStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthFollowUp" (
    "id" TEXT NOT NULL,
    "birthId" TEXT NOT NULL,
    "followType" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3),
    "contactedAt" TIMESTAMP(3),
    "staffId" TEXT,
    "note" TEXT,

    CONSTRAINT "BirthFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "birthId" TEXT NOT NULL,
    "babyOrder" INTEGER NOT NULL,
    "collectedBy" TEXT,
    "collectedAt" TIMESTAMP(3),
    "condition" TEXT,
    "status" "SampleStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleProcessing" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "SampleProcessing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalTest" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "labName" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "resultReceivedAt" TIMESTAMP(3),
    "resultStatus" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "ExternalTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityControl" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "qcStaffId" TEXT,
    "checkedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "QualityControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageTank" (
    "id" TEXT NOT NULL,
    "tankCode" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,

    CONSTRAINT "StorageTank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "storedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageTank_tankCode_key" ON "StorageTank"("tankCode");

-- AddForeignKey
ALTER TABLE "BirthTracking" ADD CONSTRAINT "BirthTracking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthFollowUp" ADD CONSTRAINT "BirthFollowUp_birthId_fkey" FOREIGN KEY ("birthId") REFERENCES "BirthTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_birthId_fkey" FOREIGN KEY ("birthId") REFERENCES "BirthTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleProcessing" ADD CONSTRAINT "SampleProcessing_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalTest" ADD CONSTRAINT "ExternalTest_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "StorageTank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

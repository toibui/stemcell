-- CreateTable
CREATE TABLE "Outside" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outside_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "isOutside" BOOLEAN DEFAULT false,
ADD COLUMN "outsideId" TEXT;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_outsideId_fkey"
FOREIGN KEY ("outsideId") REFERENCES "Outside"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

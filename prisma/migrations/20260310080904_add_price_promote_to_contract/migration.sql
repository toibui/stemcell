-- AlterTable
ALTER TABLE "BirthTracking" ADD COLUMN     "barcode" BOOLEAN;

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "promote" DECIMAL(65,30);

/*
  Warnings:

  - The primary key for the `Target` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Target" DROP CONSTRAINT "Target_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Target_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Target_id_seq";

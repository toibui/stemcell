/*
  Warnings:

  - Made the column `email` on table `Staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "email" SET NOT NULL;

/*
  Warnings:

  - Added the required column `link` to the `pending_colaborator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pending_colaborator" ADD COLUMN     "link" TEXT NOT NULL;

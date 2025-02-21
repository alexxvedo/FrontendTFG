/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `type` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `provider` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `providerAccountId` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `token_type` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `session_state` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "type" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "provider" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "providerAccountId" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "token_type" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "session_state" SET DATA TYPE VARCHAR(191),
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId");

/*
  Warnings:

  - The values [done,failed] on the enum `Jobs_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Jobs` MODIFY `status` ENUM('pending', 'running', 'succeeded', 'fail') NOT NULL;

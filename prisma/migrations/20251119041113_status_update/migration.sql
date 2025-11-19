/*
  Warnings:

  - The values [CONFIRMED,READY,CANCELLED] on the enum `order_status_history_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED,READY,CANCELLED] on the enum `order_status_history_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order_status_history` MODIFY `status` ENUM('PENDING', 'PICKED_UP', 'IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED') NOT NULL;

-- AlterTable
ALTER TABLE `orders` MODIFY `status` ENUM('PENDING', 'PICKED_UP', 'IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED') NOT NULL DEFAULT 'PENDING';

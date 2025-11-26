-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `customItemId` VARCHAR(191) NULL,
    ADD COLUMN `customServiceId` VARCHAR(191) NULL,
    ADD COLUMN `isCustom` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `serviceId` VARCHAR(191) NULL,
    MODIFY `serviceItemId` VARCHAR(191) NULL;

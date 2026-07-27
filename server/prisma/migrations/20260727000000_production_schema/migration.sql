-- Align the initial schema with the production domain model.
ALTER TABLE `Category`
  ADD COLUMN `image` VARCHAR(191) NULL,
  ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `Product`
  MODIFY COLUMN `description` TEXT NULL,
  CHANGE COLUMN `discountPrice` `salePrice` DECIMAL(10, 2) NULL,
  CHANGE COLUMN `isFeatured` `featured` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `ProductImage`
  CHANGE COLUMN `url` `imageUrl` VARCHAR(191) NOT NULL,
  DROP COLUMN `altText`,
  CHANGE COLUMN `displayOrder` `sortOrder` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `Order`
  DROP COLUMN `razorpayOrderId`,
  DROP COLUMN `razorpayPaymentId`,
  MODIFY COLUMN `orderStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL;

CREATE TABLE `RefreshToken` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `adminId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `RefreshToken_tokenHash_key`(`tokenHash`),
  INDEX `RefreshToken_adminId_idx`(`adminId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `RefreshToken_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `orderId` INTEGER NOT NULL,
  `method` ENUM('COD', 'RAZORPAY') NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `amount` DECIMAL(10, 2) NOT NULL,
  `razorpayOrderId` VARCHAR(191) NULL,
  `razorpayPaymentId` VARCHAR(191) NULL,
  `razorpaySignature` VARCHAR(191) NULL,
  `failureReason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Payment_orderId_key`(`orderId`),
  UNIQUE INDEX `Payment_razorpayOrderId_key`(`razorpayOrderId`),
  UNIQUE INDEX `Payment_razorpayPaymentId_key`(`razorpayPaymentId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'kaspi');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'cash';

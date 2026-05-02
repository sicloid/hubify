-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('AWAITING_PAYMENT', 'ESCROW_HELD', 'RELEASED_TO_SELLER', 'REFUNDED');

-- AlterTable
ALTER TABLE "TradeRequest" ADD COLUMN "unitPrice" DECIMAL(10,2),
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "totalPrice" DECIMAL(12,2),
ADD COLUMN "paymentStatus" "PaymentStatus",
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "destinationCity" TEXT;

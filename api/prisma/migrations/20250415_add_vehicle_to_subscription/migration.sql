-- AlterTable: add vehicle info to subscription
ALTER TABLE "client_subscriptions"
  ADD COLUMN IF NOT EXISTS "vehiclePlate" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleModel" TEXT;
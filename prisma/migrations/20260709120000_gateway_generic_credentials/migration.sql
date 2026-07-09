-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'FAILED', 'DISCONNECTED');
CREATE TYPE "WebhookHealth" AS ENUM ('UNKNOWN', 'HEALTHY', 'DEGRADED', 'FAILED');

-- AlterEnum
ALTER TYPE "GatewayProvider" ADD VALUE 'RAZORPAY';
ALTER TYPE "GatewayProvider" ADD VALUE 'CASHFREE';
ALTER TYPE "WebhookSource" ADD VALUE 'RAZORPAY';
ALTER TYPE "WebhookSource" ADD VALUE 'CASHFREE';

-- AlterTable: add new columns (credentials nullable until data migration script runs)
ALTER TABLE "PaymentGateway"
  ADD COLUMN "credentials" TEXT,
  ADD COLUMN "webhookSecret" TEXT,
  ADD COLUMN "webhookVersion" TEXT,
  ADD COLUMN "connectionStatus" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "webhookHealth" "WebhookHealth" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "connectedAt" TIMESTAMP(3),
  ADD COLUMN "disconnectedAt" TIMESTAMP(3),
  ADD COLUMN "lastWebhookAt" TIMESTAMP(3),
  ADD COLUMN "lastSuccessfulWebhookAt" TIMESTAMP(3),
  ADD COLUMN "lastFailedWebhookAt" TIMESTAMP(3),
  ADD COLUMN "lastSyncAt" TIMESTAMP(3),
  ADD COLUMN "lastSettlementImportAt" TIMESTAMP(3),
  ADD COLUMN "lastRefundImportAt" TIMESTAMP(3),
  ADD COLUMN "lastFailedEventAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IntegrationAuditLog" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "gatewayId" TEXT,
    "provider" "GatewayProvider" NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationAuditLog_shopId_provider_idx" ON "IntegrationAuditLog"("shopId", "provider");
CREATE INDEX "IntegrationAuditLog_gatewayId_idx" ON "IntegrationAuditLog"("gatewayId");

ALTER TABLE "IntegrationAuditLog" ADD CONSTRAINT "IntegrationAuditLog_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGateway"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "PaymentGateway_shopId_provider_key" ON "PaymentGateway"("shopId", "provider");

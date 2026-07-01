import { resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { encrypt } from "@/lib/crypto/encrypt";

import { buildSeedData, DEMO_GATEWAY_SECRETS } from "./seed-data";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

/**
 * Seeds the database with a single demo shop and one record per table so
 * Prisma Studio shows fully linked sample data.
 */
async function main(): Promise<void> {
  const data = buildSeedData();

  await prisma.shop.upsert({
    where: { id: data.shop.id },
    update: data.shop,
    create: data.shop,
  });

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: data.user,
    create: data.user,
  });

  await prisma.shopMember.upsert({
    where: { id: data.member.id },
    update: data.member,
    create: data.member,
  });

  const gateway = {
    ...data.gateway,
    key: encrypt(DEMO_GATEWAY_SECRETS.key),
    salt: encrypt(DEMO_GATEWAY_SECRETS.salt),
  };
  await prisma.paymentGateway.upsert({
    where: { id: gateway.id },
    update: gateway,
    create: gateway,
  });

  await prisma.matchingConfig.upsert({
    where: { id: data.matchingConfig.id },
    update: data.matchingConfig,
    create: data.matchingConfig,
  });

  await prisma.shopifyOrder.upsert({
    where: { id: data.order.id },
    update: data.order,
    create: data.order,
  });

  await prisma.gatewayTransaction.upsert({
    where: { id: data.transaction.id },
    update: data.transaction,
    create: data.transaction,
  });

  await prisma.gatewaySettlement.upsert({
    where: { id: data.settlement.id },
    update: data.settlement,
    create: data.settlement,
  });

  await prisma.settlementLineItem.upsert({
    where: { id: data.lineItem.id },
    update: data.lineItem,
    create: data.lineItem,
  });

  await prisma.gatewayRefund.upsert({
    where: { id: data.refund.id },
    update: data.refund,
    create: data.refund,
  });

  await prisma.reconciliationRecord.upsert({
    where: { id: data.reconciliation.id },
    update: data.reconciliation,
    create: data.reconciliation,
  });

  await prisma.webhookEvent.upsert({
    where: { id: data.webhookEvent.id },
    update: data.webhookEvent,
    create: data.webhookEvent,
  });

  console.log(`Seeded demo shop ${data.shop.shopDomain}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

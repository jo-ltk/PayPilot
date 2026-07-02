import { resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { encrypt } from "@/lib/crypto/encrypt";

import { buildSeedData, DEMO_GATEWAY_SECRETS } from "./seed-data";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const BATCH_SIZE = 100;

/**
 * Deletes prior transactional demo data so re-seeding stays idempotent.
 * @param shopId - Demo shop id
 */
async function clearShopTransactionalData(shopId: string): Promise<void> {
  await prisma.$transaction([
    prisma.webhookEvent.deleteMany({ where: { shopId } }),
    prisma.reconciliationRecord.deleteMany({ where: { shopId } }),
    prisma.gatewaySettlement.deleteMany({ where: { shopId } }),
    prisma.gatewayTransaction.deleteMany({ where: { shopId } }),
    prisma.shopifyOrder.deleteMany({ where: { shopId } }),
  ]);
}

/**
 * Inserts rows in batches to avoid oversized SQL statements.
 * @param label - Log label for the entity type
 * @param rows - Records to insert
 * @param insert - Prisma createMany delegate
 */
async function insertBatched<T extends Record<string, unknown>>(
  label: string,
  rows: T[],
  insert: (batch: T[]) => Promise<{ count: number }>,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE);
    const { count } = await insert(batch);
    if (count !== batch.length) {
      throw new Error(`Failed to insert full ${label} batch at offset ${offset}`);
    }
  }
}

/**
 * Seeds the database with a rich demo shop and hundreds of linked records.
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

  await clearShopTransactionalData(data.shop.id);

  await insertBatched("orders", data.orders, (batch) =>
    prisma.shopifyOrder.createMany({ data: batch }),
  );
  await insertBatched("transactions", data.transactions, (batch) =>
    prisma.gatewayTransaction.createMany({ data: batch }),
  );
  await insertBatched("settlements", data.settlements, (batch) =>
    prisma.gatewaySettlement.createMany({ data: batch }),
  );
  await insertBatched("line items", data.lineItems, (batch) =>
    prisma.settlementLineItem.createMany({ data: batch }),
  );
  await insertBatched("refunds", data.refunds, (batch) =>
    prisma.gatewayRefund.createMany({ data: batch }),
  );
  await insertBatched("reconciliations", data.reconciliations, (batch) =>
    prisma.reconciliationRecord.createMany({ data: batch }),
  );
  await insertBatched("webhook events", data.webhookEvents, (batch) =>
    prisma.webhookEvent.createMany({ data: batch }),
  );

  console.log(`Seeded demo shop ${data.shop.shopDomain}`);
  console.log(
    `  ${data.meta.transactionCount} transactions, ${data.meta.orderCount} orders, ` +
      `${data.meta.settlementCount} settlements, ${data.meta.refundCount} refunds, ` +
      `${data.meta.reconciliationCount} reconciliations`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

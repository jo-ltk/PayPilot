import { resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { decrypt } from "@/lib/crypto/encrypt";
import { encryptCredentials } from "@/lib/gateways/credentials";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

type LegacyGatewayRow = {
  id: string;
  key: string;
  salt: string;
  merchantEmail: string;
  isActive: boolean;
  createdAt: Date;
};

/**
 * Migrates legacy key/salt/merchantEmail columns into encrypted credentials JSON.
 */
async function main(): Promise<void> {
  const rows = await prisma.$queryRaw<LegacyGatewayRow[]>`
    SELECT id, key, salt, "merchantEmail", "isActive", "createdAt"
    FROM "PaymentGateway"
    WHERE credentials IS NULL
  `;

  for (const row of rows) {
    const credentials = encryptCredentials({
      key: decrypt(row.key),
      salt: decrypt(row.salt),
      merchantEmail: row.merchantEmail,
    });

    await prisma.paymentGateway.update({
      where: { id: row.id },
      data: {
        credentials,
        connectionStatus: row.isActive ? "CONNECTED" : "DISCONNECTED",
        connectedAt: row.isActive ? row.createdAt : null,
      },
    });
  }

  console.log(`Migrated ${rows.length} gateway credential row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

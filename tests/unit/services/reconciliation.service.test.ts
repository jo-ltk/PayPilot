import {
  MatchingStrategy,
  ReconciliationStatus,
  SettlementStatus,
} from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
  matchingFindUnique,
  orderFindMany,
  txnFindMany,
  refundFindMany,
  reconFindFirst,
  reconCreate,
  reconUpdate,
  txnUpdate,
} = vi.hoisted(() => ({
  matchingFindUnique: vi.fn(),
  orderFindMany: vi.fn(),
  txnFindMany: vi.fn(),
  refundFindMany: vi.fn(),
  reconFindFirst: vi.fn(),
  reconCreate: vi.fn(),
  reconUpdate: vi.fn(),
  txnUpdate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    matchingConfig: { findUnique: matchingFindUnique },
    shopifyOrder: { findMany: orderFindMany },
    gatewayTransaction: {
      findMany: txnFindMany,
      update: txnUpdate,
    },
    gatewayRefund: { findMany: refundFindMany },
    reconciliationRecord: {
      findFirst: reconFindFirst,
      create: reconCreate,
      update: reconUpdate,
    },
  },
}));

import { runReconciliation } from "@/lib/services/reconciliation.service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("runReconciliation", () => {
  it("persists MATCHED results and links matchedOrderId", async () => {
    matchingFindUnique.mockResolvedValue({
      strategy: MatchingStrategy.UDF_ORDER_ID,
      priority: [],
      fieldMapping: {},
      amountTolerancePaise: 0,
      includeGatewayFees: false,
    });
    orderFindMany.mockResolvedValue([
      {
        id: "o1",
        shopifyOrderId: "1001",
        orderName: "#1001",
        shopifyPaymentId: null,
        totalPricePaise: 10000,
        financialStatus: "paid",
      },
    ]);
    txnFindMany.mockResolvedValue([
      {
        id: "t1",
        txnid: "#1001",
        amountPaise: 10000,
        netAmountPaise: 9700,
        settlementStatus: SettlementStatus.SETTLED,
        udf1: "1001",
        udf2: null,
        udf3: null,
        udf4: null,
        udf5: null,
        udf6: null,
        udf7: null,
        udf8: null,
        udf9: null,
        udf10: null,
      },
    ]);
    refundFindMany.mockResolvedValue([]);
    reconFindFirst.mockResolvedValue(null);
    reconCreate.mockResolvedValue(undefined);
    txnUpdate.mockResolvedValue(undefined);

    const result = await runReconciliation("s1");

    expect(result.processed).toBe(1);
    expect(reconCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: ReconciliationStatus.MATCHED }),
      }),
    );
    expect(txnUpdate).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { matchedOrderId: "o1" },
    });
  });

  it("skips updating records already marked RESOLVED", async () => {
    matchingFindUnique.mockResolvedValue(null);
    orderFindMany.mockResolvedValue([]);
    txnFindMany.mockResolvedValue([
      {
        id: "t1",
        txnid: "x",
        amountPaise: 100,
        netAmountPaise: 100,
        settlementStatus: SettlementStatus.PENDING,
        udf1: null,
        udf2: null,
        udf3: null,
        udf4: null,
        udf5: null,
        udf6: null,
        udf7: null,
        udf8: null,
        udf9: null,
        udf10: null,
      },
    ]);
    refundFindMany.mockResolvedValue([]);
    reconFindFirst.mockResolvedValue({
      id: "r1",
      status: ReconciliationStatus.RESOLVED,
    });

    await runReconciliation("s1");

    expect(reconUpdate).not.toHaveBeenCalled();
    expect(reconCreate).not.toHaveBeenCalled();
  });
});

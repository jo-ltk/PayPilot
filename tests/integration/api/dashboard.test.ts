import { ReconciliationStatus, Role, SettlementStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const {
  txnFindMany,
  txnCount,
  settlementFindMany,
  settlementCount,
  refundFindMany,
  refundCount,
  reconFindMany,
  reconCount,
  reconUpdateMany,
  reconFindUnique,
  txnAggregate,
  refundAggregate,
  settlementAggregate,
  reconGroupBy,
} = vi.hoisted(() => ({
  txnFindMany: vi.fn(),
  txnCount: vi.fn(),
  settlementFindMany: vi.fn(),
  settlementCount: vi.fn(),
  refundFindMany: vi.fn(),
  refundCount: vi.fn(),
  reconFindMany: vi.fn(),
  reconCount: vi.fn(),
  reconUpdateMany: vi.fn(),
  reconFindUnique: vi.fn(),
  txnAggregate: vi.fn(),
  refundAggregate: vi.fn(),
  settlementAggregate: vi.fn(),
  reconGroupBy: vi.fn(),
}));
const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: {
    gatewayTransaction: {
      findMany: txnFindMany,
      count: txnCount,
      aggregate: txnAggregate,
    },
    gatewaySettlement: {
      findMany: settlementFindMany,
      count: settlementCount,
      aggregate: settlementAggregate,
    },
    gatewayRefund: {
      findMany: refundFindMany,
      count: refundCount,
      aggregate: refundAggregate,
    },
    reconciliationRecord: {
      findMany: reconFindMany,
      count: reconCount,
      updateMany: reconUpdateMany,
      findUnique: reconFindUnique,
      groupBy: reconGroupBy,
    },
  },
}));
vi.mock("@/lib/inngest/client", () => ({ inngest: { send } }));

import { GET as analyticsGet } from "@/app/api/shops/[shopId]/analytics/route";
import { GET as paymentsGet } from "@/app/api/shops/[shopId]/payments/route";
import { PATCH as reconPatch } from "@/app/api/shops/[shopId]/reconciliation/[id]/route";
import { GET as reconGet } from "@/app/api/shops/[shopId]/reconciliation/route";
import { POST as reconcilePost } from "@/app/api/shops/[shopId]/reconcile/route";
import { GET as refundsGet } from "@/app/api/shops/[shopId]/refunds/route";
import { GET as settlementsGet } from "@/app/api/shops/[shopId]/settlements/route";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

const ctx = { params: Promise.resolve({ shopId: "s1" }) };
const reconCtx = { params: Promise.resolve({ shopId: "s1", id: "r1" }) };

/** Sets a session cookie for the given role on shop s1. */
async function setSession(role: Role): Promise<void> {
  const session: Session = {
    userId: "u1",
    email: "user@example.com",
    memberships: [{ shopId: "s1", role }],
  };
  const token = await createSessionToken(session);
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === SESSION_COOKIE ? { value: token } : undefined,
  });
}

const txnRow = {
  id: "t1",
  easebuzzTxnId: "EZ1",
  easebuzzPaymentId: null,
  amountPaise: 10000,
  feesPaise: 200,
  netAmountPaise: 9800,
  currency: "INR",
  status: "success",
  mode: "UPI",
  email: "a@b.com",
  phone: null,
  txnid: "#1001",
  matchedOrderId: null,
  settlementStatus: SettlementStatus.PENDING,
  occurredAt: new Date("2026-01-01T00:00:00Z"),
};

beforeEach(() => {
  txnFindMany.mockResolvedValue([txnRow]);
  txnCount.mockResolvedValue(1);
  settlementFindMany.mockResolvedValue([
    {
      id: "st1",
      payoutId: "po1",
      payoutDate: new Date("2026-01-02"),
      totalAmountPaise: 9800,
      transactionCount: 1,
      status: "settled",
      utrNumber: "UTR1",
      bankAccountLast4: "1234",
    },
  ]);
  settlementCount.mockResolvedValue(1);
  refundFindMany.mockResolvedValue([
    {
      id: "rf1",
      refundId: "R1",
      transactionId: "t1",
      amountPaise: 500,
      status: "refunded",
      shopifyRefundId: null,
      processedAt: new Date("2026-01-03"),
    },
  ]);
  refundCount.mockResolvedValue(1);
  reconFindMany.mockResolvedValue([
    {
      id: "r1",
      shopifyOrderId: "o1",
      transactionId: "t1",
      status: ReconciliationStatus.AMOUNT_MISMATCH,
      expectedAmountPaise: 10000,
      actualAmountPaise: 9000,
      deltaPaise: -1000,
      reason: "delta",
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt: new Date("2026-01-04"),
    },
  ]);
  reconCount.mockResolvedValue(1);
  txnAggregate
    .mockResolvedValueOnce({
      _count: { _all: 1 },
      _sum: { amountPaise: 10000, feesPaise: 200, netAmountPaise: 9800 },
    })
    .mockResolvedValueOnce({ _sum: { amountPaise: 10000 } });
  refundAggregate.mockResolvedValue({
    _count: { _all: 1 },
    _sum: { amountPaise: 500 },
  });
  settlementAggregate.mockResolvedValue({
    _count: { _all: 1 },
    _sum: { totalAmountPaise: 9800 },
  });
  reconGroupBy.mockResolvedValue([
    { status: ReconciliationStatus.AMOUNT_MISMATCH, _count: { _all: 1 } },
  ]);
  send.mockResolvedValue(undefined);
  reconUpdateMany.mockResolvedValue({ count: 1 });
  reconFindUnique.mockResolvedValue({
    id: "r1",
    shopifyOrderId: "o1",
    transactionId: "t1",
    status: ReconciliationStatus.RESOLVED,
    expectedAmountPaise: 10000,
    actualAmountPaise: 9000,
    deltaPaise: -1000,
    reason: "delta",
    resolvedAt: new Date("2026-01-05"),
    resolvedByUserId: "u1",
    createdAt: new Date("2026-01-04"),
  });
});

afterEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockReset();
});

describe("dashboard list APIs", () => {
  it("GET /payments returns paginated transactions for VIEWER", async () => {
    await setSession(Role.VIEWER);
    const response = await paymentsGet(
      new Request("http://localhost/api/shops/s1/payments") as never,
      ctx,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].easebuzzTxnId).toBe("EZ1");
    expect(json.meta.total).toBe(1);
  });

  it("GET /settlements returns paginated settlements", async () => {
    await setSession(Role.VIEWER);
    const response = await settlementsGet(
      new Request("http://localhost/api/shops/s1/settlements") as never,
      ctx,
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data[0].payoutId).toBe("po1");
  });

  it("GET /refunds returns paginated refunds", async () => {
    await setSession(Role.VIEWER);
    const response = await refundsGet(
      new Request("http://localhost/api/shops/s1/refunds") as never,
      ctx,
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data[0].refundId).toBe("R1");
  });

  it("GET /reconciliation returns paginated mismatch records", async () => {
    await setSession(Role.VIEWER);
    const response = await reconGet(
      new Request("http://localhost/api/shops/s1/reconciliation") as never,
      ctx,
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.data[0].status).toBe(ReconciliationStatus.AMOUNT_MISMATCH);
  });
});

describe("analytics and reconcile APIs", () => {
  it("GET /analytics returns KPIs and series", async () => {
    await setSession(Role.VIEWER);
    const response = await analyticsGet(
      new Request("http://localhost/api/shops/s1/analytics") as never,
      ctx,
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.data.kpis.transactionCount).toBe(1);
    expect(json.data.series).toHaveLength(1);
  });

  it("POST /reconcile enqueues reconciliation for ADMIN", async () => {
    await setSession(Role.ADMIN);
    const response = await reconcilePost(
      new Request("http://localhost/api/shops/s1/reconcile", {
        method: "POST",
      }) as never,
      ctx,
    );
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledWith({
      name: "reconciliation/run",
      data: { shopId: "s1" },
    });
  });

  it("forbids VIEWER from triggering reconcile", async () => {
    await setSession(Role.VIEWER);
    const response = await reconcilePost(
      new Request("http://localhost/api/shops/s1/reconcile", {
        method: "POST",
      }) as never,
      ctx,
    );
    expect(response.status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it("PATCH /reconciliation/[id] resolves a record for ADMIN", async () => {
    await setSession(Role.ADMIN);
    const response = await reconPatch(
      new Request("http://localhost/api/shops/s1/reconciliation/r1", {
        method: "PATCH",
      }) as never,
      reconCtx,
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.data.status).toBe(ReconciliationStatus.RESOLVED);
  });
});

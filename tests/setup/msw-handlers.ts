import {
  GatewayEnvironment,
  MatchingStrategy,
  ReconciliationStatus,
  SettlementStatus,
} from "@prisma/client";
import { http, HttpResponse } from "msw";

const mockShop = {
  id: "shop-1",
  shopDomain: "demo.myshopify.com",
  shopName: "Demo Store",
  currency: "INR",
  isActive: true,
  onboardingStep: "COMPLETE",
};

const mockTransaction = {
  id: "txn-1",
  easebuzzTxnId: "EZ-TXN-001",
  easebuzzPaymentId: "EZ-PAY-001",
  amountPaise: 150000,
  feesPaise: 3000,
  netAmountPaise: 147000,
  currency: "INR",
  status: "success",
  mode: "UPI",
  email: "buyer@example.com",
  phone: "9876543210",
  txnid: "ORD-1001",
  matchedOrderId: "order-1",
  settlementStatus: SettlementStatus.SETTLED,
  occurredAt: "2026-06-01T10:00:00.000Z",
};

const mockSettlement = {
  id: "set-1",
  payoutId: "PAYOUT-001",
  payoutDate: "2026-06-05",
  totalAmountPaise: 500000,
  transactionCount: 12,
  status: "completed",
  utrNumber: "UTR123456",
  bankAccountLast4: "4321",
};

const mockRefund = {
  id: "ref-1",
  refundId: "REF-001",
  transactionId: "txn-1",
  amountPaise: 50000,
  status: "processed",
  shopifyRefundId: "shopify-ref-1",
  processedAt: "2026-06-02T12:00:00.000Z",
};

const mockReconciliation = {
  id: "rec-1",
  shopifyOrderId: "order-1",
  transactionId: "txn-1",
  status: ReconciliationStatus.AMOUNT_MISMATCH,
  expectedAmountPaise: 150000,
  actualAmountPaise: 145000,
  deltaPaise: -5000,
  reason: "Amount mismatch",
  resolvedAt: null,
  resolvedByUserId: null,
  createdAt: "2026-06-01T11:00:00.000Z",
};

const mockAnalytics = {
  from: "2026-05-01",
  to: "2026-06-01",
  kpis: {
    transactionCount: 120,
    grossVolumePaise: 12000000,
    feesPaise: 240000,
    netVolumePaise: 11760000,
    refundCount: 3,
    refundTotalPaise: 150000,
    settlementCount: 4,
    settlementTotalPaise: 10000000,
    pendingSettlementPaise: 1760000,
    reconciliation: { AMOUNT_MISMATCH: 2, MATCHED: 118 },
    matchRate: 98.3,
  },
  series: [
    { date: "2026-05-01", grossPaise: 400000, count: 4 },
    { date: "2026-05-02", grossPaise: 350000, count: 3 },
  ],
};

const mockSettings = {
  gateway: {
    id: "gw-1",
    provider: "EASEBUZZ",
    keyMasked: "****1234",
    saltMasked: "****5678",
    merchantEmail: "merchant@example.com",
    environment: GatewayEnvironment.SANDBOX,
    isActive: true,
  },
  matching: {
    strategy: MatchingStrategy.UDF_ORDER_ID,
    priority: [],
    fieldMapping: {},
    amountTolerancePaise: 0,
    includeGatewayFees: false,
  },
};

const listMeta = {
  page: 1,
  pageSize: 25,
  total: 1,
  hasMore: false,
};

function listResponse<T>(data: T[]) {
  return HttpResponse.json({ success: true, data, meta: listMeta });
}

function successResponse<T>(data: T) {
  return HttpResponse.json({ success: true, data });
}

/** MSW handlers mocking all SettleFlow API endpoints for component tests. */
export const apiHandlers = [
  http.get("/api/health", () =>
    successResponse({ status: "ok", timestamp: new Date().toISOString() }),
  ),

  http.get("/api/shops", () => successResponse([mockShop])),

  http.get("/api/shops/:shopId/payments", () =>
    listResponse([mockTransaction]),
  ),

  http.get("/api/shops/:shopId/settlements", () =>
    listResponse([mockSettlement]),
  ),

  http.get("/api/shops/:shopId/refunds", () => listResponse([mockRefund])),

  http.get("/api/shops/:shopId/reconciliation", () =>
    listResponse([mockReconciliation]),
  ),

  http.patch("/api/shops/:shopId/reconciliation/:id", () =>
    successResponse({
      ...mockReconciliation,
      status: ReconciliationStatus.RESOLVED,
      resolvedAt: new Date().toISOString(),
    }),
  ),

  http.get("/api/shops/:shopId/analytics", () =>
    successResponse(mockAnalytics),
  ),

  http.post("/api/shops/:shopId/reconcile", () =>
    successResponse({ queued: true }),
  ),

  http.get("/api/shops/:shopId/settings", () => successResponse(mockSettings)),

  http.patch("/api/shops/:shopId/settings", async ({ request }) => {
    const body = (await request.json()) as {
      gateway?: { merchantEmail?: string; environment?: GatewayEnvironment };
      matching?: { strategy?: MatchingStrategy };
    };

    return successResponse({
      gateway: body.gateway
        ? {
            ...mockSettings.gateway,
            merchantEmail:
              body.gateway.merchantEmail ?? mockSettings.gateway.merchantEmail,
            environment:
              body.gateway.environment ?? mockSettings.gateway.environment,
          }
        : mockSettings.gateway,
      matching: body.matching
        ? { ...mockSettings.matching, ...body.matching }
        : mockSettings.matching,
    });
  }),

  http.post("/api/shops/:shopId/settings/validate", () =>
    successResponse({
      valid: true,
      message: "Credentials verified",
      webhookUrls: {
        transaction: "https://app.settleflow.io/api/webhooks/easebuzz/transaction",
        payout: "https://app.settleflow.io/api/webhooks/easebuzz/payout",
        refund: "https://app.settleflow.io/api/webhooks/easebuzz/refund",
      },
    }),
  ),

  http.post("/api/shops/:shopId/settings/invite", () =>
    successResponse({ inviteToken: "invite-token-123" }),
  ),

  http.post("/api/auth/password", () => successResponse({ success: true })),

  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string };
    return successResponse({
      userId: "user-1",
      email: body.email,
      shops: [{ shopId: "shop-1", role: "ADMIN" }],
    });
  }),

  http.post("/api/auth/shopify", () =>
    successResponse({
      shopId: "shop-1",
      shopDomain: "demo.myshopify.com",
    }),
  ),

  http.post("/api/auth/invite/accept", () =>
    successResponse({
      userId: "user-2",
      email: "invited@example.com",
      shops: [{ shopId: "shop-1", role: "VIEWER" }],
    }),
  ),

  http.post("/api/auth/logout", () => successResponse({ success: true })),
];

export const handlers = [
  ...apiHandlers,
  http.get("https://api.shopify.com/*", () => {
    return HttpResponse.json({ data: {} });
  }),
  http.post("https://testpay.easebuzz.in/*", () => {
    return HttpResponse.json({ status: 1 });
  }),
];

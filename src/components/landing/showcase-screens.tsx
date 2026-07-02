import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const TXN_ROWS = [
  { id: "#8493", method: "UPI", gateway: "Razorpay", amount: "₹12,450", status: "Settled" },
  { id: "#8494", method: "Card", gateway: "PayU", amount: "₹4,299", status: "Settled" },
  { id: "#8495", method: "Netbanking", gateway: "Razorpay", amount: "₹28,999", status: "Pending" },
  { id: "#8496", method: "Wallet", gateway: "Cashfree", amount: "₹1,199", status: "Settled" },
  { id: "#8497", method: "UPI", gateway: "Razorpay", amount: "₹7,850", status: "Pending" },
];

/** Mock transactions table for the showcase panel. */
export function TransactionsScreen() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Captured today", value: "₹1,84,220" },
          { label: "Transactions", value: "312" },
          { label: "Avg. order", value: "₹1,940" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-(--pp-line) bg-white p-3">
            <p className="pp-mono text-[8px] text-(--pp-faint) sm:text-[9px]">{kpi.label}</p>
            <p className="pp-display mt-1 text-sm font-medium text-(--pp-ink) sm:text-lg">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-(--pp-line)">
        <div className="pp-mono grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 border-b border-(--pp-line) bg-(--pp-surface) px-3 py-2 text-[8px] text-(--pp-faint) sm:grid-cols-[0.7fr_1fr_1fr_1fr_0.8fr] sm:text-[9px]">
          <span>Order</span>
          <span className="hidden sm:block">Method</span>
          <span>Gateway</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {TXN_ROWS.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 border-b border-(--pp-line) px-3 py-2.5 text-[11px] last:border-0 sm:grid-cols-[0.7fr_1fr_1fr_1fr_0.8fr] sm:text-xs"
          >
            <span className="font-mono text-(--pp-dim)">{row.id}</span>
            <span className="hidden text-(--pp-dim) sm:block">{row.method}</span>
            <span className="text-(--pp-dim)">{row.gateway}</span>
            <span className="font-mono text-(--pp-ink)">{row.amount}</span>
            <span
              className={
                row.status === "Settled" ? "font-medium text-(--pp-blue)" : "text-(--pp-faint)"
              }
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mock reconciliation triage board for the showcase panel. */
export function ReconciliationScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-(--pp-blue)/30 bg-(--pp-blue-soft) px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-(--pp-blue-bright)" />
          <p className="text-xs text-(--pp-ink) sm:text-sm">
            1,284 of 1,291 transactions auto-matched
          </p>
        </div>
        <span className="pp-display text-sm font-medium text-(--pp-blue-bright) sm:text-lg">99.4%</span>
      </div>
      {[
        { id: "#STL-0283", issue: "Amount mismatch", diff: "−₹142.00", severity: "review" },
        { id: "#TXN-8461", issue: "Missing in gateway report", diff: "₹4,299", severity: "review" },
        { id: "#RFD-1099", issue: "Duplicate refund entry", diff: "−₹1,850", severity: "critical" },
      ].map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between rounded-xl border border-(--pp-line) bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`h-4 w-4 ${
                row.severity === "critical" ? "text-(--pp-blue)" : "text-(--pp-faint)"
              }`}
            />
            <div>
              <p className="font-mono text-xs text-(--pp-ink)">{row.id}</p>
              <p className="text-[10px] text-(--pp-faint) sm:text-[11px]">{row.issue}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-(--pp-dim)">{row.diff}</span>
            <span className="hidden rounded-full border border-(--pp-line-strong) px-3 py-1 text-[10px] text-(--pp-dim) sm:block">
              Resolve
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mock analytics view with a sparkline area chart for the showcase panel. */
export function AnalyticsScreen() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-(--pp-line) bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="pp-mono text-[8px] text-(--pp-faint) sm:text-[9px]">Net revenue · 90d</p>
            <p className="pp-display mt-1 text-xl font-medium text-(--pp-ink) sm:text-2xl">₹1.42 Cr</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-(--pp-blue-soft) px-3 py-1 text-[10px] text-(--pp-blue-bright)">
            <TrendingUp className="h-3 w-3" /> +31.8%
          </span>
        </div>
        <svg viewBox="0 0 400 90" className="mt-3 h-20 w-full sm:h-24" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="pp-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d63f2" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1d63f2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 C40,62 60,48 100,50 C140,52 160,30 200,32 C240,34 260,18 300,20 C340,22 370,10 400,6 L400,90 L0,90 Z"
            fill="url(#pp-area)"
          />
          <path
            d="M0,70 C40,62 60,48 100,50 C140,52 160,30 200,32 C240,34 260,18 300,20 C340,22 370,10 400,6"
            fill="none"
            stroke="#3572f4"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Refund rate", value: "1.8%" },
          { label: "Gateway fees", value: "₹2.1 L" },
          { label: "Settled in", value: "T+2.1" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-(--pp-line) bg-white p-3">
            <p className="pp-mono text-[8px] text-(--pp-faint) sm:text-[9px]">{kpi.label}</p>
            <p className="pp-display mt-1 text-sm font-medium text-(--pp-ink) sm:text-lg">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

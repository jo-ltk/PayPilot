/**
 * Minimal landing page. The product UI is built in the frontend milestones (F0+).
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">PayPilot</h1>
      <p className="text-sm text-zinc-500">
        Shopify Payment Analytics &amp; Settlement Reconciliation
      </p>
    </main>
  );
}

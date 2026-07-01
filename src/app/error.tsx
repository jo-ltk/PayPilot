"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Global error boundary page for unexpected runtime failures. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <ErrorState
        title="Something went wrong"
        message={error.message || "An unexpected error occurred. Please try again."}
        onRetry={reset}
      />
    </main>
  );
}

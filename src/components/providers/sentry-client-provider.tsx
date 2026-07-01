"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, type ReactNode } from "react";

interface SentryClientProviderProps {
  children: ReactNode;
}

/**
 * Initializes Sentry browser error tracking when a public DSN is configured.
 * @param props - Child tree to render
 */
export function SentryClientProvider({ children }: SentryClientProviderProps) {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

    if (!dsn || Sentry.getClient()) {
      return;
    }

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: 0.1,
    });
  }, []);

  return children;
}

"use client";

import posthog from "posthog-js";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PostHogProviderProps {
  children: ReactNode;
}

/**
 * Initializes PostHog client analytics when a public key is configured.
 * @param props - Child tree to render
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const initialized = useRef(false);
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  useEffect(() => {
    if (!apiKey || initialized.current) {
      return;
    }

    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage",
    });
    initialized.current = true;
  }, [apiKey, host]);

  useEffect(() => {
    if (!apiKey || !initialized.current) {
      return;
    }

    posthog.capture("$pageview", { $current_url: pathname });
  }, [apiKey, pathname]);

  return children;
}

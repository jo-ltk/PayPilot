"use client";

import { Toaster } from "@/components/ui/sonner";

/** Global toast notifications via Sonner. */
export function ToastProvider() {
  return <Toaster position="top-right" richColors closeButton />;
}

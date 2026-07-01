import type { ReactNode } from "react";

interface StandaloneRootLayoutProps {
  children: ReactNode;
}

/**
 * Standalone finance portal root layout.
 * Public routes (login, invite) and protected shop routes share this shell.
 */
export default function StandaloneRootLayout({
  children,
}: StandaloneRootLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}

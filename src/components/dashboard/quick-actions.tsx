"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Scale,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useShopContext } from "@/hooks/use-shop-context";
import { kpiCardVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: typeof Scale;
}

function buildBasePath(mode: "embedded" | "standalone", shopId: string | null): string {
  if (mode === "embedded") {
    return "/app";
  }

  return shopId ? `/shops/${shopId}` : "/shops";
}

/** Shortcut cards for common dashboard workflows. */
export function QuickActions() {
  const { mode, shopId } = useShopContext();
  const basePath = buildBasePath(mode, shopId);

  const actions: QuickAction[] = [
    {
      title: "Run Reconciliation",
      description: "Match payments with settlements",
      href: `${basePath}/reconciliation`,
      icon: Scale,
    },
    {
      title: "View Transactions",
      description: "Browse all payment records",
      href: `${basePath}/transactions`,
      icon: ArrowLeftRight,
    },
    {
      title: "View Settlements",
      description: "Track payout batches",
      href: `${basePath}/settlements`,
      icon: Wallet,
    },
    {
      title: "Manage Settings",
      description: "Gateway and team configuration",
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <motion.div
          key={action.title}
          variants={kpiCardVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={action.href} className="block h-full">
            <Card
              className={cn(
                "h-full border-border/80 shadow-none transition-colors",
                "hover:border-foreground/20 hover:bg-muted/30",
              )}
            >
              <CardHeader className="gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                  <action.icon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">
                    {action.title}
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

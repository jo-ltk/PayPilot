"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUpRight,
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

const retroChipStyles = [
  "bg-[var(--retro-yellow)]",
  "bg-[var(--retro-pink)]",
  "bg-[var(--retro-blue)]",
  "bg-[var(--retro-yellow)]",
];

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
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          variants={kpiCardVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={action.href} className="group block h-full">
            <Card className="h-full shadow-none transition-colors hover:bg-secondary/60">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      retroChipStyles[index % retroChipStyles.length],
                    )}
                  >
                    <action.icon
                      aria-hidden="true"
                      className="size-4 text-foreground"
                    />
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-foreground/40 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

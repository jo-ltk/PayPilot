"use client";

import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShops } from "@/hooks/use-shops";
import { useShopContext } from "@/hooks/use-shop-context";

function formatShopLabel(shopId: string, shopName?: string): string {
  return shopName ?? shopId.replace(/_/g, " ");
}

function buildShopHref(pathname: string, targetShopId: string): string {
  if (!pathname.startsWith("/shops/")) {
    return `/shops/${targetShopId}`;
  }

  const suffix = pathname.replace(/^\/shops\/[^/]+/, "");
  return `/shops/${targetShopId}${suffix}`;
}

/** Standalone multi-shop switcher rendered in the top bar. */
export function ShopSwitcher() {
  const { mode, shopId, memberships } = useShopContext();
  const pathname = usePathname();
  const showSwitcher = mode === "standalone" && memberships.length > 1 && shopId;
  const { data: shops } = useShops(Boolean(showSwitcher));

  if (!showSwitcher) {
    return null;
  }

  const shopNameById = new Map(shops?.map((shop) => [shop.id, shop.shopName]));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Switch shop" />
        }
      >
        <span className="max-w-[120px] truncate sm:max-w-[160px]">
          {formatShopLabel(shopId, shopNameById.get(shopId))}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Shops</DropdownMenuLabel>
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.shopId}
            render={
              <Link href={buildShopHref(pathname, membership.shopId)} />
            }
          >
            {formatShopLabel(
              membership.shopId,
              shopNameById.get(membership.shopId),
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

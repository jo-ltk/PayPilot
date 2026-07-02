"use client";

import { LogOut, User, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShopContext } from "@/hooks/use-shop-context";
import { logoutUser } from "@/lib/auth-client";

/** Account menu with logout for standalone users. */
export function UserMenu() {
  const { mode, shopDomain, role } = useShopContext();
  const router = useRouter();

  const initials =
    mode === "embedded"
      ? (shopDomain?.slice(0, 2).toUpperCase() ?? "PP")
      : "FP";

  async function handleLogout(): Promise<void> {
    await logoutUser();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="retro-pill size-10 border-transparent p-1 sm:size-11"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar className="bg-[var(--retro-chart-strong)] text-white">
          <AvatarFallback className="bg-transparent font-retro text-sm font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          {mode === "embedded" ? shopDomain ?? "Shopify" : "Finance Portal"}
        </DropdownMenuLabel>
        {role ? (
          <p className="px-2 pb-2 text-xs text-muted-foreground capitalize">
            Role: {role.toLowerCase()}
          </p>
        ) : null}
        <DropdownMenuSeparator />
        {mode === "standalone" ? (
          <>
            <DropdownMenuItem render={<Link href="/" />}>
              <Globe aria-hidden="true" className="size-4" />
              Back to website
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleLogout()}>
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            <User aria-hidden="true" className="size-4" />
            Embedded session
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

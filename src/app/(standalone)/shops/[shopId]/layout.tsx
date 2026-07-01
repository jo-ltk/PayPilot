import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { StandaloneAuthProvider } from "@/components/providers/standalone-auth-provider";
import {
  getCurrentSession,
  resolveShopAccess,
} from "@/lib/auth/require-shop-access";
import { embeddedNavItems } from "@/lib/navigation";
import { getStandaloneShopRedirect } from "@/lib/standalone-route-guard";

interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ shopId: string }>;
}

function buildShopNavItems(shopId: string) {
  return embeddedNavItems.map((item) => ({
    ...item,
    href: item.href.replace("/app", `/shops/${shopId}`),
  }));
}

/** Shop-scoped standalone shell with session guard and navigation. */
export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { shopId } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/shops/${shopId}`)}`);
  }

  const unauthorizedRedirect = getStandaloneShopRedirect(session, shopId);
  if (unauthorizedRedirect) {
    redirect(unauthorizedRedirect);
  }

  const access = resolveShopAccess(session, shopId, Role.VIEWER);
  const navItems = buildShopNavItems(shopId);

  return (
    <StandaloneAuthProvider
      shopId={access.shopId}
      role={access.role}
      userId={session.userId}
      userEmail={session.email}
      memberships={session.memberships}
    >
      <AppShell navItems={navItems}>{children}</AppShell>
    </StandaloneAuthProvider>
  );
}

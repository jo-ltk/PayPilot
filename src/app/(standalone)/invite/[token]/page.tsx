import { redirect } from "next/navigation";

import { InviteForm } from "@/components/auth/invite-form";
import { getCurrentSession } from "@/lib/auth/require-shop-access";

interface InviteAcceptPageProps {
  params: Promise<{ token: string }>;
}

/** Team invite acceptance page for the standalone finance portal. */
export default async function InviteAcceptPage({
  params,
}: InviteAcceptPageProps) {
  const { token } = await params;
  const session = await getCurrentSession();

  if (session) {
    const firstShop = session.memberships[0]?.shopId;
    if (firstShop) {
      redirect(`/shops/${firstShop}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <InviteForm token={token} />
    </main>
  );
}

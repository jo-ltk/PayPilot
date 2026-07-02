import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/shared/brand-mark";
import {
  APP_ENTRY_PATH,
  resolvePostLoginPath,
} from "@/lib/app-entry";
import { getCurrentSession } from "@/lib/auth/require-shop-access";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/** Standalone finance portal login page. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSession();
  const { redirect: redirectTo } = await searchParams;

  if (session) {
    const firstShop = session.memberships[0]?.shopId;
    if (firstShop) {
      const destination = resolvePostLoginPath(
        session.memberships,
        redirectTo ?? APP_ENTRY_PATH,
      );
      redirect(destination);
    }
  }

  return (
    <main className="pp-landing flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrandMark href="/" />
        <p className="max-w-sm text-sm text-(--pp-dim)">
          Finance portal access for reconciliation teams.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}

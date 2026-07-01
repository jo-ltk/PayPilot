import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
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
      const destination = redirectTo?.startsWith("/shops/")
        ? redirectTo
        : `/shops/${firstShop}`;
      redirect(destination);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}

"use client";

import { LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PasswordChangeForm } from "@/components/settings/password-change-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealth } from "@/hooks/use-health";
import { useShopContext } from "@/hooks/use-shop-context";
import { logoutUser } from "@/lib/auth-client";
import { ROLE_LABELS } from "@/lib/settings-labels";

/** Session, logout, password, and API health controls. */
export function SecurityPanel() {
  const router = useRouter();
  const { mode, role, userEmail, shopId, shopDomain } = useShopContext();
  const healthQuery = useHealth();

  const handleLogoutEverywhere = async () => {
    try {
      await logoutUser();
      toast.success("Signed out on this device");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
    }
  };

  const healthVariant =
    healthQuery.data?.status === "ok" ? "success" : "warning";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session information</CardTitle>
          <CardDescription>
            Details about your current authenticated session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium capitalize">{mode}</span>
          </div>
          {userEmail ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{userEmail}</span>
            </div>
          ) : null}
          {role ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{ROLE_LABELS[role]}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Shop</span>
            <span className="font-medium">{shopDomain ?? shopId ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API health</CardTitle>
          <CardDescription>
            Live status of the SettleFlow API and dependencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : healthQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Health check failed</AlertTitle>
              <AlertDescription>
                {healthQuery.error?.message ?? "Unable to reach the API"}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                label={healthQuery.data?.status === "ok" ? "Healthy" : "Degraded"}
                variant={healthVariant}
              />
              <span className="text-sm text-muted-foreground">
                Database: {healthQuery.data?.checks.database ?? "unknown"}
              </span>
              <span className="text-sm text-muted-foreground">
                Version {healthQuery.data?.version ?? "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {mode === "standalone" ? (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Update your finance portal password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield aria-hidden="true" className="size-4" />
            Sign out
          </CardTitle>
          <CardDescription>
            End your session on this device. Use logout everywhere when sharing
            a workstation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleLogoutEverywhere()}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Logout everywhere
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

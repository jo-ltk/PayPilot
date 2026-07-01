"use client";

import { Role } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamInvite, type PendingInvite } from "@/hooks/use-team-invite";
import { ROLE_LABELS } from "@/lib/settings-labels";

type InviteRole = typeof Role.ADMIN | typeof Role.VIEWER;

const INVITE_ROLES: InviteRole[] = [Role.ADMIN, Role.VIEWER];

interface TeamInviteFormProps {
  shopId: string;
  disabled?: boolean;
  onInvited: (invite: PendingInvite) => void;
}

/** Form for inviting a finance team member to the shop. */
export function TeamInviteForm({
  shopId,
  disabled = false,
  onInvited,
}: TeamInviteFormProps) {
  const inviteMutation = useTeamInvite(shopId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>(Role.VIEWER);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const result = await inviteMutation.mutateAsync({ email, role });
      onInvited({
        id: crypto.randomUUID(),
        email,
        role,
        inviteToken: result.inviteToken,
        invitedAt: new Date().toISOString(),
      });
      setEmail("");
      toast.success("Invite created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create invite",
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            autoComplete="off"
            disabled={disabled || inviteMutation.isPending}
            placeholder="colleague@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <Select
            value={role}
            onValueChange={(nextRole) => setRole(nextRole as InviteRole)}
            disabled={disabled || inviteMutation.isPending}
          >
            <SelectTrigger id="invite-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {INVITE_ROLES.map((inviteRole) => (
                <SelectItem key={inviteRole} value={inviteRole}>
                  {ROLE_LABELS[inviteRole]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={disabled || inviteMutation.isPending}
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Inviting…
              </>
            ) : (
              "Invite member"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

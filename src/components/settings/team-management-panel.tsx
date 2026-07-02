"use client";

import { Role } from "@prisma/client";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { TeamInviteForm } from "@/components/settings/team-invite-form";
import {
  TeamMembersTable,
  type TeamMemberRow,
} from "@/components/settings/team-members-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PendingInvite } from "@/hooks/use-team-invite";
import { canManageTeam } from "@/lib/settings-permissions";
import { useShopContext } from "@/hooks/use-shop-context";

type InviteRole = typeof Role.ADMIN | typeof Role.VIEWER;

interface TeamManagementPanelProps {
  shopId: string;
}

/** Team invite workflow and member roster for the active shop. */
export function TeamManagementPanel({ shopId }: TeamManagementPanelProps) {
  const { mode, role, userId, userEmail } = useShopContext();
  const canManage = canManageTeam(mode, role);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  const members = useMemo<TeamMemberRow[]>(() => {
    const rows: TeamMemberRow[] = [];

    if (userEmail && role) {
      rows.push({
        id: userId ?? "current-user",
        email: userEmail,
        role,
        status: "active",
      });
    }

    for (const invite of pendingInvites) {
      rows.push({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: "pending",
        inviteToken: invite.inviteToken,
      });
    }

    return rows;
  }, [pendingInvites, role, userEmail, userId]);

  const handleInvited = (invite: PendingInvite) => {
    setPendingInvites((current) => [invite, ...current]);
  };

  const handleRemove = (memberId: string) => {
    setPendingInvites((current) =>
      current.filter((invite) => invite.id !== memberId),
    );
  };

  const handleRoleChange = (memberId: string, nextRole: InviteRole) => {
    setPendingInvites((current) =>
      current.map((invite) =>
        invite.id === memberId ? { ...invite, role: nextRole } : invite,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team management</CardTitle>
        <CardDescription>
          Invite finance teammates and manage access roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="retro-subpanel p-4 sm:p-5">
          <TeamInviteForm
            shopId={shopId}
            disabled={!canManage}
            onInvited={handleInvited}
          />
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite colleagues to collaborate on reconciliation and settlements."
          />
        ) : (
          <TeamMembersTable
            members={members}
            currentUserId={userId ?? null}
            currentRole={role}
            canManage={canManage}
            onRemove={handleRemove}
            onRoleChange={handleRoleChange}
          />
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Role } from "@prisma/client";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildInviteUrl, ROLE_LABELS } from "@/lib/settings-labels";
import { hasRole } from "@/lib/auth/rbac";

type InviteRole = typeof Role.ADMIN | typeof Role.VIEWER;

export type TeamMemberRow = {
  id: string;
  email: string;
  role: Role;
  status: "active" | "pending";
  inviteToken?: string;
};

interface TeamMembersTableProps {
  members: TeamMemberRow[];
  currentUserId: string | null;
  currentRole: Role | null;
  canManage: boolean;
  onRemove: (memberId: string) => void;
  onRoleChange: (memberId: string, role: InviteRole) => void;
}

/**
 * Copies an invite link to the clipboard.
 * @param token - Invite token
 */
async function copyInviteLink(token: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(buildInviteUrl(token));
    toast.success("Invite link copied");
  } catch {
    toast.error("Unable to copy invite link");
  }
}

function memberInitials(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase();
}

/** Team members table with invite actions and role management. */
export function TeamMembersTable({
  members,
  currentUserId,
  currentRole,
  canManage,
  onRemove,
  onRoleChange,
}: TeamMembersTableProps) {
  const canChangeRoles =
    canManage && currentRole != null && hasRole(currentRole, Role.OWNER);

  return (
    <div className="retro-panel overflow-hidden">
      <Table className="retro-settings-table">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          const isPending = member.status === "pending";

          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{memberInitials(member.email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.email}</p>
                    {isSelf ? (
                      <p className="text-xs text-muted-foreground">You</p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {canChangeRoles && isPending ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="outline" size="sm" />}
                    >
                      {ROLE_LABELS[member.role]}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {[Role.ADMIN, Role.VIEWER].map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => onRoleChange(member.id, role)}
                        >
                          {ROLE_LABELS[role]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  ROLE_LABELS[member.role]
                )}
              </TableCell>
              <TableCell>
                <StatusBadge
                  label={isPending ? "Pending" : "Active"}
                  variant={isPending ? "pending" : "success"}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {isPending && member.inviteToken ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Copy invite link for ${member.email}`}
                      onClick={() => void copyInviteLink(member.inviteToken!)}
                    >
                      <Copy aria-hidden="true" className="size-4" />
                    </Button>
                  ) : null}
                  {canManage && isPending && !isSelf ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${member.email}`}
                      onClick={() => onRemove(member.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
    </div>
  );
}

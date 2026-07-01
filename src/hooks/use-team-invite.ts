"use client";

import { Role } from "@prisma/client";

import type { InviteInput } from "@/schemas/auth.schema";
import { useShopApi } from "@/hooks/use-shop-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { apiPost } from "@/lib/api-client";

export type InviteResponse = {
  inviteToken: string;
};

export type PendingInvite = {
  id: string;
  email: string;
  role: Role;
  inviteToken: string;
  invitedAt: string;
};

/**
 * Invites a team member to the active shop.
 * @param shopId - Active shop id
 * @returns TanStack mutation for POST settings invite
 */
export function useTeamInvite(shopId: string | null) {
  const { getOptions } = useShopApi();

  return useApiMutation(async (input: InviteInput) => {
    if (!shopId) {
      throw new Error("Shop context is required");
    }

    const options = await getOptions();
    return apiPost<InviteResponse>(
      `/shops/${shopId}/settings/invite`,
      input,
      options,
    );
  });
}

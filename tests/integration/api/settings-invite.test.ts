import { Role } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { userUpsert, memberUpsert } = vi.hoisted(() => ({
  userUpsert: vi.fn(),
  memberUpsert: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { upsert: userUpsert },
    shopMember: { upsert: memberUpsert },
  },
}));

import { POST as invite } from "@/app/api/shops/[shopId]/settings/invite/route";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

/**
 * Sets the mocked cookie store to carry a session for the given role.
 */
async function setSession(role: Role): Promise<void> {
  const session: Session = {
    userId: "u1",
    email: "admin@example.com",
    memberships: [{ shopId: "s1", role }],
  };
  const token = await createSessionToken(session);
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === SESSION_COOKIE ? { value: token } : undefined,
  });
}

/**
 * Builds an invite request for shop s1.
 */
function inviteRequest(body: unknown): Request {
  return new Request("http://localhost/api/shops/s1/settings/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ctx = { params: Promise.resolve({ shopId: "s1" }) };

describe("POST /api/shops/[shopId]/settings/invite", () => {
  beforeEach(() => {
    userUpsert.mockResolvedValue({ id: "u_new" });
    memberUpsert.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cookiesMock.mockReset();
    userUpsert.mockReset();
    memberUpsert.mockReset();
  });

  it("allows an ADMIN to create an invite", async () => {
    await setSession(Role.ADMIN);
    const response = await invite(
      inviteRequest({ email: "new@example.com", role: "VIEWER" }) as never,
      ctx,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.inviteToken).toBeDefined();
    expect(memberUpsert).toHaveBeenCalledTimes(1);
  });

  it("forbids a VIEWER from creating an invite", async () => {
    await setSession(Role.VIEWER);
    const response = await invite(
      inviteRequest({ email: "new@example.com", role: "VIEWER" }) as never,
      ctx,
    );

    expect(response.status).toBe(403);
    expect(memberUpsert).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request with 401", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    const response = await invite(
      inviteRequest({ email: "new@example.com", role: "VIEWER" }) as never,
      ctx,
    );

    expect(response.status).toBe(401);
  });
});

import { Role } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "@/lib/api/errors";

const mocks = vi.hoisted(() => ({
  userUpsert: vi.fn(),
  userUpdate: vi.fn(),
  memberUpsert: vi.fn(),
  memberFindUnique: vi.fn(),
  memberUpdate: vi.fn(),
  memberFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { upsert: mocks.userUpsert, update: mocks.userUpdate },
    shopMember: {
      upsert: mocks.memberUpsert,
      findUnique: mocks.memberFindUnique,
      update: mocks.memberUpdate,
      findMany: mocks.memberFindMany,
    },
  },
}));

import { acceptInvite, createInvite } from "@/lib/auth/invite";

afterEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
});

describe("createInvite", () => {
  beforeEach(() => {
    mocks.userUpsert.mockResolvedValue({ id: "u1" });
    mocks.memberUpsert.mockResolvedValue(undefined);
  });

  it("provisions a pending user and a membership with a fresh token", async () => {
    const { inviteToken } = await createInvite({
      shopId: "s1",
      email: "new@example.com",
      role: Role.VIEWER,
    });

    expect(inviteToken).toHaveLength(48);
    const memberArg = mocks.memberUpsert.mock.calls[0][0];
    expect(memberArg.create.role).toBe(Role.VIEWER);
    expect(memberArg.create.inviteToken).toBe(inviteToken);
  });
});

describe("acceptInvite", () => {
  it("activates the user and returns a session", async () => {
    mocks.memberFindUnique.mockResolvedValue({
      id: "m1",
      userId: "u1",
      user: { email: "new@example.com" },
    });
    mocks.userUpdate.mockResolvedValue(undefined);
    mocks.memberUpdate.mockResolvedValue(undefined);
    mocks.memberFindMany.mockResolvedValue([{ shopId: "s1", role: Role.VIEWER }]);

    const session = await acceptInvite({
      token: "tok",
      name: "New User",
      password: "password123",
    });

    expect(session.userId).toBe("u1");
    expect(session.email).toBe("new@example.com");
    expect(session.memberships).toEqual([{ shopId: "s1", role: Role.VIEWER }]);
    expect(mocks.memberUpdate.mock.calls[0][0].data.inviteToken).toBeNull();
  });

  it("throws NotFoundError for an unknown token", async () => {
    mocks.memberFindUnique.mockResolvedValue(null);
    await expect(
      acceptInvite({ token: "bad", name: "X", password: "password123" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

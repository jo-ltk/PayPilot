import { Role } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import type { Session } from "@/schemas/auth.schema";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique } } }));

import {
  authenticateUser,
  createSessionToken,
  verifySession,
} from "@/lib/auth/standalone";

describe("session token round-trip", () => {
  it("creates and verifies a session token", async () => {
    const session: Session = {
      userId: "u1",
      email: "user@example.com",
      memberships: [{ shopId: "s1", role: Role.OWNER }],
    };
    const token = await createSessionToken(session);
    const verified = await verifySession(token);
    expect(verified).toMatchObject(session);
  });

  it("rejects a malformed token", async () => {
    await expect(verifySession("not.a.jwt")).rejects.toThrow();
  });
});

describe("authenticateUser", () => {
  beforeEach(async () => {
    const passwordHash = await hashPassword("correct-horse");
    findUnique.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      passwordHash,
      memberships: [{ shopId: "s1", role: Role.ADMIN }],
    });
  });

  afterEach(() => {
    findUnique.mockReset();
  });

  it("returns a session for valid credentials", async () => {
    const session = await authenticateUser("user@example.com", "correct-horse");
    expect(session.userId).toBe("u1");
    expect(session.memberships[0].role).toBe(Role.ADMIN);
  });

  it("throws AuthError for a wrong password", async () => {
    await expect(
      authenticateUser("user@example.com", "wrong"),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("throws AuthError when the user does not exist", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(
      authenticateUser("missing@example.com", "whatever"),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

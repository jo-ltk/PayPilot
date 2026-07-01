import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hashPassword } from "@/lib/auth/password";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique } } }));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";

/**
 * Builds a JSON login request.
 */
function loginRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const passwordHash = await hashPassword("correct-horse");
    findUnique.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      passwordHash,
      memberships: [{ shopId: "s1", role: "ADMIN" }],
    });
  });

  afterEach(() => findUnique.mockReset());

  it("authenticates and sets an httpOnly session cookie", async () => {
    const response = await login(
      loginRequest({ email: "user@example.com", password: "correct-horse" }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.userId).toBe("u1");
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("sf_session=");
    expect(cookie?.toLowerCase()).toContain("httponly");
  });

  it("returns 401 for an invalid password", async () => {
    const response = await login(
      loginRequest({ email: "user@example.com", password: "wrong" }) as never,
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for a malformed body", async () => {
    const response = await login(loginRequest({ email: "not-an-email" }) as never);
    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const response = await logout();
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("sf_session=");
    expect(cookie).toContain("Max-Age=0");
  });
});

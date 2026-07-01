import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

import { server } from "../../../setup/msw-server";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh,
  }),
}));

describe("LoginForm", () => {
  it("submits credentials to the login API and redirects", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          success: true,
          data: {
            userId: "u1",
            email: "user@example.com",
            shops: [{ shopId: "shop-1", role: "ADMIN" }],
          },
        }),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/shops/shop-1");
    });
  });

  it("shows API errors inline", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          success: false,
          error: { code: "AUTH_ERROR", message: "Invalid email or password" },
        }),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });
});
